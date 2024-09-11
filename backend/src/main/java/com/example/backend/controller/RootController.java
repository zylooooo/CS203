package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;

@Controller
public class RootController {
    @GetMapping("/")
    public String redirectToLogin(Authentication authentication) {
        return authentication != null ? "redirect:/user/hello" : "redirect:/login";
    }
}
