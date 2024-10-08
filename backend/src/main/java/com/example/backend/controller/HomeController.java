package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class HomeController {

    @GetMapping("/")
    public String redirectToAppropriateEndpoint(Authentication authentication, HttpServletRequest request) {
        if (authentication != null && authentication.isAuthenticated()) {
            String referer = request.getHeader("Referer");
            if (referer != null) {
                return "redirect:" + referer;
            } else {
                if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
                    return "redirect:/admins/home";
                } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER"))) {
                    return "redirect:/users/home";
                }
            }
        }
        return "redirect:/users/login";
    }
}
