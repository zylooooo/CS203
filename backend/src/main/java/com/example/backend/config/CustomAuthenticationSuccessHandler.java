package com.example.backend.config;

import java.io.IOException;
import java.util.logging.Logger;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private static final Logger logger = Logger.getLogger(CustomAuthenticationSuccessHandler.class.getName());

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(req, res, auth);
        logger.info("Final redirect URL: " + targetUrl);
        res.sendRedirect(targetUrl);
    }

    private String determineTargetUrl(HttpServletRequest req, HttpServletResponse res, Authentication auth) {
        HttpSession session = req.getSession();
        String redirectUrl = (String) session.getAttribute("REDIRECT_URL");
        logger.info("Session REDIRECT_URL: " + redirectUrl);

        if (redirectUrl != null && !redirectUrl.isEmpty()) {
            session.removeAttribute("REDIRECT_URL");
            return redirectUrl;
        }

        // Default URLs based on role if no redirect URL is set
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return "/admin/home";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"))) {
            return "/user/home";
        }

        return "/";
    }
}
