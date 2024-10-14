package com.example.backend.dto;

import lombok.Data;

@Data
public class AdminRegisterDto {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String adminName;
}
