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
        
        try {
            String otp = otpService.generateOTP(username).get();
            boolean emailSent = emailService.sendOtpEmail(email, otp).get();
            
            if (emailSent) {
                HttpSession session = request.getSession();
                session.setAttribute("needOtpVerification", true);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\": \"OTP sent successfully\", \"redirect\": \"/otp/verify\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Failed to send OTP email\"}");
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error during OTP generation or email sending", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"An internal error occurred\"}");
        }
    }
}
