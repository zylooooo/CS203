package com.example.backend.dto;

import lombok.Data;

/**
 * DTO for verifying a user OR admin email address.
 */

@Data
public class VerificationDto {
    private String username;
    private String verificationCode;
}
