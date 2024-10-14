package com.example.backend.dto;

import lombok.Data;

/**
 * DTO for logging in a user OR admin.
 */

@Data
public class UserLoginDto {
    private String username;
    private String password;
}
