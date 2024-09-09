package com.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class LoginController {
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
