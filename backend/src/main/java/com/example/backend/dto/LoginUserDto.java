package com.example.backend.dto;

import lombok.Data;

/**
 * DTO for logging in a user.
 */

@Data
public class LoginUserDto {
    private String username;
    private String password;
}
