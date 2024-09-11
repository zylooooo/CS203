package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {
    @GetMapping("/login")
    public String authenticateUser(Authentication authentication, @RequestParam(value = "redirect", required = false) String redirect) {
        if (authentication != null && authentication.isAuthenticated()) {
            return redirect != null ? "redirect:" + redirect : "redirect:/";
        }
        return "login";
    }
}
