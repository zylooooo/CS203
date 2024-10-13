package com.example.backend.dto;

import lombok.Data;

@Data
public class RegisterAdminDto {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String adminName;
}
