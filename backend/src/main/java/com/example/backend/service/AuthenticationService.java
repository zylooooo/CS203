package com.example.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.AdminLoginDto;
import com.example.backend.dto.AdminRegisterDto;
import com.example.backend.dto.AdminVerifyDto;
import com.example.backend.dto.UserRegisterDto;
import com.example.backend.dto.UserVerifyDto;
import com.example.backend.dto.UserLoginDto;

import com.example.backend.exception.*;

import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.BeanPropertyBindingResult;

import com.example.backend.model.Admin;
import com.example.backend.model.User;

import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;

import com.example.backend.security.UserPrincipal;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final LocalValidatorFactoryBean validator;

    public Map<String, Object> userSignup(UserRegisterDto userRegisterDto) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        try {
            // Validate the userRegisterDto
            Errors validationErrors = new BeanPropertyBindingResult(userRegisterDto, "userRegisterDto");
            validator.validate(userRegisterDto, validationErrors);

            if (validationErrors.hasErrors()) {
                validationErrors.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
                );
            }

            // Check if username already exists
            if (userRepository.existsByUsername(userRegisterDto.getUsername()) || adminRepository.existsByAdminName(userRegisterDto.getUsername())) {
                errors.put("username", "Account name already exists");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(userRegisterDto.getEmail()) || adminRepository.existsByEmail(userRegisterDto.getEmail())) {
                errors.put("email", "Email already exists");
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

            User user = new User();
            user.setRole("ROLE_USER");
            user.setUsername(userRegisterDto.getUsername());
            user.setEmail(userRegisterDto.getEmail());
            user.setPassword(passwordEncoder.encode(userRegisterDto.getPassword())); 
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15));
            user.setEnabled(false);
            user.setFirstName(userRegisterDto.getFirstName());
            user.setLastName(userRegisterDto.getLastName());
            user.setPhoneNumber(userRegisterDto.getPhoneNumber());
            user.setElo(userRegisterDto.getElo());
            user.setGender(userRegisterDto.getGender());
            user.setDateOfBirth(userRegisterDto.getDateOfBirth());
            user.setAge(userRegisterDto.getAge());

            sendVerificationEmail(user);

            User savedUser = userRepository.save(user);
            response.put("user", savedUser);
        } catch (Exception e) {
            errors.put("error", "An unexpected error occurred. Please try again.");
            response.put("errors", errors);
            throw e;
        }

        return response;
    }

    public Map<String, Object> adminSignup(AdminRegisterDto adminRegisterDto) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        try {
            Errors validationErrors = new BeanPropertyBindingResult(adminRegisterDto, "adminRegisterDto");
            validator.validate(adminRegisterDto, validationErrors);

            if (validationErrors.hasErrors()) {
                validationErrors.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
                );
            }

            if (adminRepository.existsByAdminName(adminRegisterDto.getAdminName()) || userRepository.existsByUsername(adminRegisterDto.getAdminName())) {
                errors.put("adminName", "Account name already exists");
            }
            if (adminRepository.existsByEmail(adminRegisterDto.getEmail()) || userRepository.existsByEmail(adminRegisterDto.getEmail())) {
                errors.put("email", "Email already exists");
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

            Admin admin = new Admin();
            admin.setRole("ROLE_ADMIN");
            admin.setEmail(adminRegisterDto.getEmail());
            admin.setFirstName(adminRegisterDto.getFirstName());
            admin.setLastName(adminRegisterDto.getLastName());
            admin.setPassword(passwordEncoder.encode(adminRegisterDto.getPassword()));
            admin.setAdminName(adminRegisterDto.getAdminName());
            admin.setVerificationCode(generateVerificationCode());
            admin.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15)); // 15 minutes
            admin.setEnabled(false);
            
            sendVerificationEmail(admin);

            Admin savedAdmin = adminRepository.save(admin);
            response.put("admin", savedAdmin);
        } catch (Exception e) {
            errors.put("error", "An unexpected error occurred. Please try again.");
            response.put("errors", errors);
            throw e;
        }
        return response;
    }
    
    public UserPrincipal userAuthenticate(UserLoginDto loginDto) {
        User user = userRepository.findByUsername(loginDto.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found with username: " + loginDto.getUsername()));

        if (!user.isEnabled()) {
            throw new UserNotEnabledException("User account not verified. Please check your email to enable your account.");
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));
        return UserPrincipal.create(user);
    }   

    public UserPrincipal adminAuthenticate(AdminLoginDto loginDto) {
        Admin admin = adminRepository.findByAdminName(loginDto.getAdminName())
            .orElseThrow(() -> new AdminNotFoundException("Admin not found with admin name: " + loginDto.getAdminName()));
    
        if (!admin.isEnabled()) {
            throw new AdminNotEnabledException("Admin account not verified. Please check your email to enable your account.");
        }
    
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(admin.getAdminName(), loginDto.getPassword()));
        return UserPrincipal.create(admin);
    }


    public void verifyUser(UserVerifyDto verifyDto) {

        User user = userRepository.findByUsername(verifyDto.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new UserAlreadyVerifiedException("User is already verified");
        }

        if (user.getVerificationCodeExpiration() == null || 
            user.getVerificationCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new VerificationCodeExpiredException("Verification code has expired");
        }

        if (!user.getVerificationCode().equals(verifyDto.getVerificationCode())) {
            throw new InvalidVerificationCodeException("Invalid verification code");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiration(null);
        userRepository.save(user);

    }

    public void verifyAdmin(AdminVerifyDto verifyDto) {
    Admin admin = adminRepository.findByAdminName(verifyDto.getAdminName())
        .orElseThrow(() -> new AdminNotFoundException("Admin not found"));

    if (admin.isEnabled()) {
        throw new AdminAlreadyVerifiedException("Admin is already verified");
    }

    if (admin.getVerificationCodeExpiration() == null || 
        admin.getVerificationCodeExpiration().isBefore(LocalDateTime.now())) {
        throw new VerificationCodeExpiredException("Verification code has expired");
    }

    if (!admin.getVerificationCode().equals(verifyDto.getVerificationCode())) {
        throw new InvalidVerificationCodeException("Invalid verification code");
    }

        admin.setEnabled(true);
        admin.setVerificationCode(null);
        admin.setVerificationCodeExpiration(null);
        adminRepository.save(admin);
    }


    public void resendVerificationCode(String email) throws UserAlreadyVerifiedException, AdminAlreadyVerifiedException, AccountNotFoundException, EmailSendingException {
        Optional<User> userOptional = userRepository.findByEmail(email);
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);
    
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            try {
                handleResendVerification(user);
            } catch (UserAlreadyVerifiedException e) {
                throw e;
            }
        } else if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();

            try {
                handleResendVerification(admin);
            } catch (AdminAlreadyVerifiedException e) {
                throw e;
            }

        } else {
            throw new AccountNotFoundException("Account not found with email: " + email);
        }
    }

    void handleResendVerification(Object account) throws UserAlreadyVerifiedException, AdminAlreadyVerifiedException {
        if (account instanceof User) {
            User user = (User) account;
            if (user.isEnabled()) {
                throw new UserAlreadyVerifiedException("User account is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(user);
            userRepository.save(user);
        } else if (account instanceof Admin) {
            Admin admin = (Admin) account;
            if (admin.isEnabled()) {
                throw new AdminAlreadyVerifiedException("Admin account is already verified");
            }
            admin.setVerificationCode(generateVerificationCode());
            admin.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(admin);
            adminRepository.save(admin);
        }
    }

    public void sendVerificationEmail(Object o) {

        String verificationCode = null;
        String email = null;

        if (o instanceof User) {
            User user = (User) o;
            verificationCode = user.getVerificationCode();
            email = user.getEmail();
        } else if (o instanceof Admin) {
            Admin admin = (Admin) o;
            verificationCode = admin.getVerificationCode();
            email = admin.getEmail();
        }

        String subject = "Account Verification";
        
        String htmlMessage = "<!DOCTYPE html>"
                                + "<html lang=\"en\">"
                                + "<head>"
                                + "<meta charset=\"UTF-8\">"
                                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                                + "<title>RallyRank Verification</title>"
                                + "</head>"
                                + "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;\">"
                                + "<div style=\"max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);\">"
                                + "<div style=\"background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center;\">"
                                + "<h1 style=\"margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\">RallyRank</h1>"
                                + "</div>"
                                + "<div style=\"padding: 40px; text-align: center;\">"
                                + "<h2 style=\"color: #556B2F; font-size: 24px; margin-bottom: 20px;\">Verify Your Account</h2>"
                                + "<p style=\"font-size: 16px; line-height: 1.5; margin-bottom: 25px;\">Thank you for joining RallyRank. To complete your registration, please use the verification code below. This code will expire in 15 minutes.</p>"
                                + "<div style=\"background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; margin-bottom: 30px;\">"
                                + "<div style=\"font-size: 32px; font-weight: bold; color: #556B2F; letter-spacing: 5px;\">" + verificationCode + "</div>"
                                + "</div>"
                                + "<p style=\"font-size: 16px; line-height: 1.5; margin-bottom: 25px;\">If you didn't request this verification, please ignore this email or contact our support team if you have any concerns.</p>"
                                + "</div>"
                                + "<div style=\"background-color: #f0f0f0; color: #888; text-align: center; padding: 20px; font-size: 14px;\">"
                                + "&copy; 2024 RallyRank. All rights reserved."
                                + "</div>"
                                + "</div>"
                                + "</body>"
                                + "</html>";

        try {
            emailService.sendVerificationEmail(email, subject, htmlMessage);
        } catch (MessagingException e) {
            throw new EmailSendingException("Failed to send verification email", e);
        }
    }

    private String generateVerificationCode() { 
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

}
