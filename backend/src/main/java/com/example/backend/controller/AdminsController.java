package com.example.backend.controller;

import com.example.backend.model.LoginRequest;
import com.example.backend.service.AdminService;
import com.example.backend.service.EmailService;
import com.example.backend.service.OtpService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.Map;
import java.util.concurrent.CompletableFuture;


@RestController
@RequestMapping("/admins")
@RequiredArgsConstructor
public class AdminsController {
    private final AdminService adminService;
    private final OtpService otpService;
    private final EmailService emailService;

    @PostMapping("/login")
    public CompletableFuture<ResponseEntity<Map<String, String>>> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        return adminService.authenticateAdmin(loginRequest.getUsername(), loginRequest.getPassword())
            .thenCompose(admin -> {
                if (admin != null) {
                    return otpService.generateOTP(admin.getUserName())
                        .thenCompose(otp -> emailService.sendOtpEmail(admin.getEmail(), otp))
                        .thenApply(emailSent -> {
                            if (emailSent) {
                                session.setAttribute("ADMIN_ID", admin.getId());
                                session.setAttribute("needOtpVerification", true);
                                return ResponseEntity.ok(Map.of("message", "OTP sent successfully", "redirect", "/otp/verify"));
                            } else {
                                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to send OTP"));
                            }
                        });
                } else {
                    return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials")));
                }
            })
            .exceptionally(e -> {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
            });
    }
}
