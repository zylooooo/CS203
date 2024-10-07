package com.example.backend.controller;

import java.util.Map;
import com.example.backend.service.EmailService;
import com.example.backend.service.OtpService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public String showOtpVerificationPage() {
        return "otp-verification";
    }

    @PostMapping("/verify")
    public String verifyOtp(@RequestParam String otp, HttpSession session, Authentication authentication, RedirectAttributes redirectAttributes) {
        String username = authentication.getName();
        System.out.println("Verifying OTP for user: " + username);
        if (otpService.validateOTP(username, otp)) {
            System.out.println("OTP verified successfully for user: " + username);
            session.removeAttribute("needOtpVerification");
            session.setAttribute("otpVerified", true);
            if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return "redirect:/admin/home";
            } else {
                return "redirect:/user/home";
            }
        } else {
            System.out.println("OTP verification failed for user: " + username);
            redirectAttributes.addFlashAttribute("error", "Invalid OTP. Please try again.");
            return "redirect:/otp/verify";
        }
    }

    @PostMapping("/send")
    @ResponseBody
    public ResponseEntity<?> sendOtp(Authentication authentication) {
        String username = authentication.getName();
        String email = userService.getUserByUsername(username).getEmail();
        String otp = otpService.generateOTP(username);
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok().body(Map.of("message", "OTP sent successfully. It will expire in 5 minutes."));
    }
}