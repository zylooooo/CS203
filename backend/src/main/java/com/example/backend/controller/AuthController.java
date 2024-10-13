package com.example.backend.controller;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.responses.ErrorResponse;
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

    @Autowired
    public AuthController(AuthenticationService authenticationService, JwtService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    @PostMapping("/user-signup")
    public ResponseEntity<?> signup(@RequestBody RegisterUserDto registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            return ResponseEntity.ok(registeredUser);
        } catch (UsernameAlreadyExistsException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("USERNAME_EXISTS", "The username is already taken."));
        } catch (EmailAlreadyExistsException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("EMAIL_EXISTS", "The email address is already registered."));
        } catch (IllegalArgumentException e) {
            logger.error("Signup error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during signup", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred during signup."));
        }
    
    }

    @PostMapping("/user-login")
    public ResponseEntity<?> login(@RequestBody LoginUserDto loginUserDto) {
        try {
            UserPrincipal authenticatedUser = authenticationService.authenticate(loginUserDto);
            String jwtToken = jwtService.generateToken(authenticatedUser);
            LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getJwtExpiration());
            return ResponseEntity.ok(loginResponse);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("USER_NOT_FOUND", "User not found"));
        } catch (UserNotEnabledException e) {
            logger.error("User not enabled: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("USER_NOT_ENABLED", "Your account is not enabled. Please check your email to enable your account."));
        } catch (BadCredentialsException e) {
            logger.error("Bad credentials: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("INVALID_CREDENTIALS", "Invalid password"));
        } catch (Exception e) {
            logger.error("Error occurred during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred during login"));
        }
    }

    @PostMapping("/user-verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {

        try {
            authenticationService.verifyUser(verifyUserDto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User verified successfully");
            response.put("redirectUrl", "/");
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("USER_NOT_FOUND", "User not found"));
        } catch (VerificationCodeExpiredException e) {
            logger.error("Verification code expired: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("CODE_EXPIRED", "Verification code has expired"));
        } catch (InvalidVerificationCodeException e) {
            logger.error("Invalid verification code: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_CODE", "Invalid verification code"));
        } catch (UserAlreadyVerifiedException e) {
            logger.error("User already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("USER_ALREADY_VERIFIED", "User is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during user verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred during user verification"));
        }
    }

    @PostMapping("/user-resend")
    public ResponseEntity<?> resendUserVerificationCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", "Email is required"));
        }
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent successfully");
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("USER_NOT_FOUND", "User not found"));
        } catch (UserAlreadyVerifiedException e) {
            logger.error("User already verified: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("USER_ALREADY_VERIFIED", "User is already verified"));
        } catch (Exception e) {
            logger.error("Unexpected error during resend verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred during resend verification"));
        }
    }
}
