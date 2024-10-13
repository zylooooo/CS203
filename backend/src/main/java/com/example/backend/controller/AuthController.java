package com.example.backend.controller;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.responses.ErrorResponse;
import com.example.backend.dto.LoginDto;
import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.VerificationDto;
import com.example.backend.exception.EmailAlreadyExistsException;
import com.example.backend.exception.InvalidVerificationCodeException;
import com.example.backend.exception.UserAlreadyVerifiedException;
import com.example.backend.exception.UserNotEnabledException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.UsernameAlreadyExistsException;
import com.example.backend.exception.VerificationCodeExpiredException;
import com.example.backend.model.User;
import com.example.backend.responses.LoginResponse;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.AuthenticationService;
import com.example.backend.service.JwtService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    // for debugging
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
 
    public AuthController(AuthenticationService authenticationService, JwtService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    @PostMapping("/user-signup")
    public ResponseEntity<?> userSignup(@RequestBody RegisterUserDto registerUserDto) {
        try {
            User registeredUser = authenticationService.userSignup(registerUserDto);
            return ResponseEntity.ok(registeredUser);
        } catch (UsernameAlreadyExistsException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("The username is already taken."));
        } catch (EmailAlreadyExistsException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("The email address is already registered."));
        } catch (IllegalArgumentException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during signup", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during signup."));
        }
    
    }

    @PostMapping("/user-login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            UserPrincipal authenticatedUser = authenticationService.authenticate(loginDto);
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
        } catch (Exception e) {
            logger.error("Error occurred during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during login"));
        }
    }

    @PostMapping("/user-verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerificationDto verificationDto) {

        try {
            authenticationService.verifyUser(verificationDto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User verified successfully");
            response.put("redirectUrl", "/");
            return ResponseEntity.ok(response);
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

    @PostMapping("/user-resend")
    public ResponseEntity<?> resendUserVerificationCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Email is required"));
        }
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent successfully");
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("User not found"));
        } catch (UserAlreadyVerifiedException e) {
            logger.error("User already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("User is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during resend verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred during resend verification"));
        }
    }
}
