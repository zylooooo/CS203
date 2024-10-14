package com.example.backend.dto;

import lombok.Data;

@Data
public class UserVerifyDto {
    private String username;
    private String verificationCode;
}
