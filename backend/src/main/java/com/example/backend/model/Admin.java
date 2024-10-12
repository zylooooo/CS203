package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin")
public class Admin {
    @Id
    private String id;

    @Indexed(unique = true)
    @NotNull(message = "Email is required!")
    @Email(message = "Invalid email format!")
    private String email;

    @NotNull(message = "First name is required!")
    private String firstName;

    @NotNull(message = "Last name is required!")
    private String lastName;

    @NotNull(message = "Password is required!")
    private String password;

    private List<String> createdTournaments;

    private String profilePic;

    @Indexed(unique = true)
    @NotNull(message = "Admin name is required!")
    private String adminName;

    // Default role is ADMIN FOR JWT
    private String role = "ADMIN";
}
