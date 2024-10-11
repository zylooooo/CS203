package com.example.backend.dto;

import lombok.Data;

/**
 * DTO for verifying a user's email address.
 */

@Data
public class VerifyUserDto {
    private String username;
    private String verificationCode;
}
