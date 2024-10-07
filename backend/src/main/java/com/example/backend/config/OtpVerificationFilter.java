package com.example.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class OtpVerificationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("OtpVerificationFilter: Processing request for " + path);

        if (path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/images/")) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpSession session = request.getSession(false);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && session != null) {
            Boolean otpVerified = (Boolean) session.getAttribute("otpVerified");
            System.out.println("OtpVerificationFilter: OTP verified = " + otpVerified);
            if (otpVerified == null || !otpVerified) {
                if (!path.equals("/otp/verify") && !path.equals("/otp/send") && !path.equals("/login")) {
                    System.out.println("OtpVerificationFilter: Redirecting to OTP verification page");
                    response.sendRedirect("/otp/verify");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
