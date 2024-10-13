package com.example.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.LoginUserDto;
import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.VerifyUserDto;
import com.example.backend.exception.EmailAlreadyExistsException;
import com.example.backend.exception.InvalidVerificationCodeException;
import com.example.backend.exception.UserAlreadyVerifiedException;
import com.example.backend.exception.UserNotEnabledException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.UsernameAlreadyExistsException;
import com.example.backend.exception.VerificationCodeExpiredException;
import com.example.backend.model.Admin;
import com.example.backend.model.User;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.responses.LoginResponse;
import com.example.backend.security.UserPrincipal;

import jakarta.mail.MessagingException;

@Service
public class AuthenticationService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder, EmailService emailService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
    }

    public User signup(RegisterUserDto registerUserDto) throws UsernameAlreadyExistsException, EmailAlreadyExistsException {
        if (userRepository.existsByUsername(registerUserDto.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(registerUserDto.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
    
        User user = new User();

        // Default role is USER FOR JWT
        user.setRole("ROLE_USER");
        
        user.setUsername(registerUserDto.getUsername());
        user.setEmail(registerUserDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerUserDto.getPassword()));
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15)); // 15 minutes
        user.setEnabled(false);

        user.setFirstName(registerUserDto.getFirstName());
        user.setLastName(registerUserDto.getLastName());
        user.setPhoneNumber(registerUserDto.getPhoneNumber());
        user.setElo(registerUserDto.getElo());
        user.setGender(registerUserDto.getGender());
        user.setDateOfBirth(registerUserDto.getDateOfBirth());
        user.setAge(registerUserDto.getAge());

        sendVerificationEmail(user);
    
        return userRepository.save(user);
    }

    public UserPrincipal authenticate(LoginUserDto loginUserDto) {

        Optional<User> userOptional = userRepository.findByUsername(loginUserDto.getUsername());
        Optional<Admin> adminOptional = adminRepository.findByAdminName(loginUserDto.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!user.isEnabled()) {
                throw new UserNotEnabledException("Account not verified. Please check your email to enable your account.");
            }
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUserDto.getUsername(), loginUserDto.getPassword()));
            return UserPrincipal.create(user);
            
        } else if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUserDto.getUsername(), loginUserDto.getPassword()));
            return UserPrincipal.create(admin);
        } else {
            throw new UserNotFoundException(loginUserDto.getUsername());
        }
    }

    public void verifyUser(VerifyUserDto verifyUserDto) {

        // User user = userRepository.findByUsername(verifyUserDto.getUsername())
        // .orElseThrow(() -> new UserNotFoundException("User not found with username: " + verifyUserDto.getUsername()));

        // if (user.getVerificationCodeExpiration().isBefore(LocalDateTime.now())) {
        //     throw new VerificationCodeExpiredException("Verification code has expired");
        // }

        // if (!user.getVerificationCode().equals(verifyUserDto.getVerificationCode())) {
        //     throw new InvalidVerificationCodeException("Invalid verification code");
        // }

        // user.setEnabled(true);
        // user.setVerificationCode(null);
        // user.setVerificationCodeExpiration(null);
        // userRepository.save(user);

        User user = userRepository.findByUsername(verifyUserDto.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new UserAlreadyVerifiedException("User is already verified");
        }

        if (user.getVerificationCodeExpiration() == null || 
            user.getVerificationCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new VerificationCodeExpiredException("Verification code has expired");
        }

        if (!user.getVerificationCode().equals(verifyUserDto.getVerificationCode())) {
            throw new InvalidVerificationCodeException("Invalid verification code");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
            user.setVerificationCodeExpiration(null);
            userRepository.save(user);

    }

    public void resendVerificationCode(String email) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new UserAlreadyVerifiedException("Account is already verified");
        }

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(15));

        sendVerificationEmail(user);
        userRepository.save(user);
    }

    public void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to RallyRank!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() { 
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    public LoginResponse login(LoginUserDto loginUserDto) {
        throw new UnsupportedOperationException("Unimplemented method 'login'");
    }
}
