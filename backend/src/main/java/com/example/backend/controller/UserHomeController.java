package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserHomeController {
    @GetMapping("/users/home")
    public String userHome() {
        return "userHome";
    }
}
