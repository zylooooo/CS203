package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Controller
public class HomeController {

    @GetMapping("/")
    public String showHome(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
                return "redirect:/admin/home";
            } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER"))) {
                return "redirect:/user/home";
            }
        }
        return "redirect:/login";
    }
}
