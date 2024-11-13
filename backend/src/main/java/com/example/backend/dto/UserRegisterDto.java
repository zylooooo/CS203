package com.example.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;
import lombok.Data;



/**
 * DTO for registering a new user.
 */

@Data
public class UserRegisterDto {
    
    @NotBlank(message = "Username is required!")
    private String username;

    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Invalid email!")
    private String email;

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters long!")
    private String password;

    @NotBlank(message = "First name is required!")
    private String firstName;

    @NotBlank(message = "Last name is required!")
    private String lastName;

    @NotBlank(message = "Phone number is required!")
    @Pattern(regexp = "^(?:6\\d{7}|[89]\\d{7}|1800\\d{7}|1900\\d{7})$", message = "Invalid phone number!")
    private String phoneNumber;

    @NotBlank(message = "Gender is required!")
    @Pattern(regexp = "^(M|F|Male|Female)$", message = "Gender must be either 'M', 'F', 'Male', or 'Female'.")
    private String gender;

    @NotNull(message = "Date of birth is required!")
    @Past(message = "Date of birth must be in the past!")
    private LocalDate dateOfBirth;

    @NotNull(message = "Age is required!")
    @Min(value = 0, message = "Age must be greater than 0!")
    private int age;
}
