package com.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class AdminController {
    @GetMapping("/admin/home")
    public String adminHome() {
        return "adminHome";
    } 
}
