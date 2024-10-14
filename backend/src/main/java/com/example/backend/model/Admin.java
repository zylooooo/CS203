package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.*;

import java.util.List;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin")
public class Admin {
    @Id
    private String id;

    @Indexed(unique = true)
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

    private List<String> createdTournaments;

    private String profilePic;

    @Indexed(unique = true)
    @NotBlank(message = "Admin name is required!")
    private String adminName;

    // Default role is ADMIN FOR JWT
    private String role = "ADMIN";

    // Enabled is used for email verification
    private boolean enabled;

    // Verification code is used for email verification
    private String verificationCode;

    // Time when the verification code expires
    private LocalDateTime verificationCodeExpiration;
}
