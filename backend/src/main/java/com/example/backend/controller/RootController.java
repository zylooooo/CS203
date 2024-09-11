package com.example.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class RootController {
    @GetMapping("/")
    public String redirectToAppropriateEndpoint(Authentication authentication, HttpServletRequest request) {
        if (authentication != null && authentication.isAuthenticated()) {
            String referer = request.getHeader("Referer");
            return referer != null ? "redirect:" + referer : "redirect:/user/hello";
        }
        return "redirect:/login";
    }
}
