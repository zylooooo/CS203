package com.example.backend.controller;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.responses.ErrorResponse;
import com.example.backend.dto.AdminLoginDto;
import com.example.backend.dto.AdminRegisterDto;
import com.example.backend.dto.AdminVerifyDto;
import com.example.backend.dto.UserRegisterDto;
import com.example.backend.dto.UserVerifyDto;
import com.example.backend.dto.UserLoginDto;
import com.example.backend.exception.*;
import com.example.backend.responses.LoginResponse;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.AdminService;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.JwtService;
import com.example.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    // for debugging
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final AdminService adminService;
    private final UserService userService;

    /**
     * Handles user signup by creating a new user account.
     * 
     * @param userRegisterDto the data transfer object containing user registration details.
     * @return a ResponseEntity containing the created user or error messages if validation fails.
     */
    @PostMapping("/user-signup")
    public ResponseEntity<?> userSignup(@RequestBody UserRegisterDto userRegisterDto) {
        try {
            Map<String, Object> result = authenticationService.userSignup(userRegisterDto);
            
            if (result.containsKey("errors")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.get("errors"));
            } else {
                return ResponseEntity.ok(result.get("user"));
            }
        } catch (Exception e) {
            logger.error("Unexpected error during signup", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred during signup."));
        }
    }

    /**
     * Handles admin signup by creating a new admin account.
     * 
     * @param adminRegisterDto the data transfer object containing admin registration details.
     * @return a ResponseEntity containing the created admin or error messages if validation fails.
     */
    @PostMapping("/admin-signup")
    public ResponseEntity<?> adminSignup(@RequestBody AdminRegisterDto adminRegisterDto) {
        try {
            Map<String, Object> result = authenticationService.adminSignup(adminRegisterDto);
            if (result.containsKey("errors")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.get("errors"));
            } else {
                return ResponseEntity.ok(result.get("admin"));
            }
        } catch (Exception e) {
            logger.error("Unexpected error during admin signup", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred during admin signup."));
        }
    }

    /**
     * Handles user login by authenticating the user and generating a JWT token.
     * 
     * @param loginDto the data transfer object containing user login details.
     * @return a ResponseEntity containing the login response with the JWT token or error messages if authentication fails.
     */
    @PostMapping("/user-login")
    public ResponseEntity<?> userLogin(@RequestBody UserLoginDto loginDto) {
        try {
            UserPrincipal authenticatedUser = authenticationService.userAuthenticate(loginDto);

            // Check for strike limit -> If 3 strikes, the user is banned, so prevent login
            if (userService.hasExceededStrikeLimit(authenticatedUser.getUsername())) {
                throw new UserBannedException("Your account has been banned due to having 3 strikes.");
            }

            String jwtToken = jwtService.generateToken(authenticatedUser);
            LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getJwtExpiration());
            return ResponseEntity.ok(loginResponse);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("User not found"));
        } catch (UserNotEnabledException e) {
            logger.error("User not enabled: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Your account is not enabled. Please check your email to enable your account."));
        } catch (BadCredentialsException e) {
            logger.error("Bad credentials: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid password"));
        } catch (UserBannedException e) {
            logger.error("User banned: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Your account has been banned due to having 3 strikes."));
        }
        catch (Exception e) {
            logger.error("Error occurred during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during login"));
        }
    }

    /**
     * Handles admin login by authenticating the admin and generating a JWT token.
     * 
     * @param loginDto the data transfer object containing admin login details.
     * @return a ResponseEntity containing the login response with the JWT token or error messages if authentication fails.
     */
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginDto loginDto) {
        try {
            UserPrincipal authenticatedUser = authenticationService.adminAuthenticate(loginDto);
            String jwtToken = jwtService.generateToken(authenticatedUser);
            LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getJwtExpiration());
            return ResponseEntity.ok(loginResponse);
        } catch (AdminNotFoundException e) {
            logger.error("Admin not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Admin not found"));
        } catch (AdminNotEnabledException e) {
            logger.error("Admin not enabled: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Your account is not enabled. Please check your email to enable your account."));
        } catch (BadCredentialsException e) {
            logger.error("Bad credentials: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid password"));
        } catch (Exception e) {
            logger.error("Error occurred during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during login"));
        }
    }

    /**
     * Verifies a user based on the provided verification details.
     * 
     * @param verifyDto the data transfer object containing user verification details.
     * @return a ResponseEntity with a success message or error messages if verification fails.
     */
    @PostMapping("/user-verification")
    public ResponseEntity<?> userVerify(@RequestBody UserVerifyDto verifyDto) {

        try {
            authenticationService.verifyUser(verifyDto);
            return ResponseEntity.ok("User verified successfully");
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("User not found"));
        } catch (VerificationCodeExpiredException e) {
            logger.error("Verification code expired: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Verification code has expired"));
        } catch (InvalidVerificationCodeException e) {
            logger.error("Invalid verification code: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Invalid verification code"));
        } catch (UserAlreadyVerifiedException e) {
            logger.error("User already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("User is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during user verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during user verification"));
        }
    }

    /**
     * Verifies an admin based on the provided verification details.
     * 
     * @param verifyDto the data transfer object containing admin verification details.
     * @return a ResponseEntity with a success message or error messages if verification fails.
     */
    @PostMapping("/admin-verification")
    public ResponseEntity<?> adminVerify(@RequestBody AdminVerifyDto verifyDto) {
        try {
            authenticationService.verifyAdmin(verifyDto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin verified successfully");
            response.put("redirectUrl", "/admin");
            return ResponseEntity.ok(response);
        } catch (AdminNotFoundException e) {
            logger.error("Admin not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Admin not found"));
        } catch (VerificationCodeExpiredException e) {
            logger.error("Verification code expired: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Verification code has expired"));
        } catch (InvalidVerificationCodeException e) {
            logger.error("Invalid verification code: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Invalid verification code"));
        } catch (AdminAlreadyVerifiedException e) {
            logger.error("Admin already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Admin is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during admin verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during admin verification"));
        }
    }

    /**
     * Resends the verification code to the specified email address.
     * 
     * @param payload a map containing the email address for which to resend the verification code.
     * @return a ResponseEntity with a success message or error messages if validation fails.
     */
    @PostMapping("/reverification")
    public ResponseEntity<?> resendVerificationCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Email is required"));
        }
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent successfully");
        } catch (AccountNotFoundException e) {
            logger.error("Account not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Account not found"));
        } catch (UserAlreadyVerifiedException e) {
            logger.error("Account already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("User account is already verified"));
        } catch (AdminAlreadyVerifiedException e) {
            logger.error("Account already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Admin account is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during resend verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during resend verification"));
        }
    }


    /**
     * Checks the availability of credentials (username or email) for registration.
     * 
     * @param accountName the username to check for availability.
     * @param email the email address to check for availability.
     * @return a ResponseEntity with the availability status or error messages if validation fails.
     */
    @GetMapping("/credentials-availability")
    public ResponseEntity<?> checkCredentialsAvailability(@RequestParam(required = false) String accountName, @RequestParam(required = false) String email) {
        Map<String, Object> response = new HashMap<>();

        if (accountName == null && email == null) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Either account name or email must be provided!"));
        }

        StringBuilder message = new StringBuilder();
        boolean hasError = false;

        // Check if username is provided and if it exists
        if (accountName != null) {
            boolean accountNameExists = (adminService.checkIfAdminNameExists(accountName) || userService.checkIfUsernameExists(accountName));
            response.put("accountNameAvailable", !accountNameExists);
            if (accountNameExists) {
                message.append("Account name is already taken.");
            }
        }

        // Check if email is provided and if it exists
        if (email != null) {
            boolean emailExists = (userService.checkIfEmailExists(email) || adminService.checkIfEmailExists(email));
            response.put("emailAvailable", !emailExists);
            if (emailExists) {
                message.append(" Email is already in use.");
            }
        }

        // If no errors and both username and email are provided, set both as available
        if (!hasError && message.length() == 0) {
            if (accountName != null && email != null) {
                message.append("Account name and email are available.");
            } else if (accountName != null) {
                message.append("Account name is available.");
            } else {
                message.append("Email is available.");
            }
        }

        response.put("message", message.toString().trim());

        return ResponseEntity.ok(response);
    }
}
