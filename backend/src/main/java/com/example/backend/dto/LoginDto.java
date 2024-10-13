package com.example.backend.dto;

import lombok.Data;

/**
 * DTO for logging in a user OR admin.
 */

@Data
public class LoginDto {
    private String username;
    private String password;
}
