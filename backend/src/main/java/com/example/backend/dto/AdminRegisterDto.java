package com.example.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
@Data
public class AdminRegisterDto {
    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email format!")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Invalid email!")
    private String email;

    @NotBlank(message = "First name is required!")
    private String firstName;

    @NotBlank(message = "Last name is required!")
    private String lastName;

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters long!")
    private String password;

    @NotBlank(message = "Admin name is required!")
    private String adminName;
}
