package com.example.backend.controller;

import java.util.Map;
import com.example.backend.service.EmailService;
import com.example.backend.service.OtpService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @GetMapping("/verify")
    public ResponseEntity<?> showOtpVerificationPage() {
        return ResponseEntity.ok().body(Map.of("message", "Please enter your OTP"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestParam String otp, HttpSession session, Authentication authentication) {
        String username = authentication.getName();
        System.out.println("Verifying OTP for user: " + username);
        if (otpService.validateOTP(username, otp)) {
            System.out.println("OTP verified successfully for user: " + username);
            session.removeAttribute("needOtpVerification");
            session.setAttribute("otpVerified", true);
            if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.ok().body(Map.of("message", "OTP verified successfully", "redirect", "/admin/home"));
            } else {
                return ResponseEntity.ok().body(Map.of("message", "OTP verified successfully", "redirect", "/user/home"));
            }
        } else {
            System.out.println("OTP verification failed for user: " + username);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP. Please try again."));
        }
    }

    @PostMapping("/send")
    @ResponseBody
    public ResponseEntity<?> sendOtp(Authentication authentication) {
        String username = authentication.getName();
        String email = userService.getUserByUsername(username).getEmail();
        String otp = otpService.generateOTP(username);
        boolean emailSent = emailService.sendOtpEmail(email, otp);
        if (emailSent) {
            return ResponseEntity.ok().body(Map.of("message", "OTP sent successfully. It will expire in 5 minutes."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to send OTP. Please try again."));
        }
    }
}