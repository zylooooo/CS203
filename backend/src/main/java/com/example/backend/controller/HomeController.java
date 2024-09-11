package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;


@Controller
public class HomeController {

    @GetMapping("/")
    public String showStatus(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/hello";
        }
        return "redirect:/login";
    }  
}
