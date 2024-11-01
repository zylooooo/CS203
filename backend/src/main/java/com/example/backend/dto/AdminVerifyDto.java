package com.example.backend.dto;

import lombok.Data;

@Data
public class AdminVerifyDto {
    private String adminName;
    private String verificationCode;
}
