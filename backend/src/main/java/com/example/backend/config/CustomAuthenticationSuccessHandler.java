package com.example.backend.config;

import com.example.backend.service.OtpService;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;


@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String username = authentication.getName();
        String email = userService.getUserByUsername(username).getEmail();
        CompletableFuture<String> otpFuture = otpService.generateOTP(username);
        CompletableFuture<Boolean> emailSentFuture = otpFuture.thenCompose(otp -> emailService.sendOtpEmail(email, otp));

        HttpSession session = request.getSession();
        session.setAttribute("needOtpVerification", true);

        try {
            String otp = otpFuture.get();
            boolean emailSent = emailSentFuture.get();
            if (emailSent) {
                response.sendRedirect("/otp/verify");
            } else {
                response.sendRedirect("/login?error=email");
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error during OTP generation or email sending", e);
            response.sendRedirect("/login?error=otp");
        }
    }
}
