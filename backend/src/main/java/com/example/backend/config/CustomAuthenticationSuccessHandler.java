package com.example.backend.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private RequestCache requestCache = new HttpSessionRequestCache();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth) throws IOException, ServletException {
        String targetUrl = null;

        // Determine target URL based on user role
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            targetUrl = "/admin/home";
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"))) {
            targetUrl = "/user/home";
        } else {
            targetUrl = "/";
        }

        // Check if there is a saved request and it is not a static resource
        SavedRequest savedRequest = requestCache.getRequest(req, res);
        if (savedRequest != null) {
            String requestedUrl = savedRequest.getRedirectUrl();
            if (!requestedUrl.endsWith(".css") && !requestedUrl.endsWith(".js") && !requestedUrl.endsWith(".png") && !requestedUrl.endsWith(".jpg")) {
                targetUrl = requestedUrl;
            }
        }

        res.sendRedirect(targetUrl);
    }
}
