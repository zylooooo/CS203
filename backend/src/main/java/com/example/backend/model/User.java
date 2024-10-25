package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {

    private final int BASE_ELO = 1200;

    @Id
    private String id;

    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Invalid email!")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters long!") 
    private String password;

    @NotBlank(message = "Phone number is required!")
    // Test if the phone number is a valid Singapore number
    @Pattern(regexp = "^(?:6\\d{7}|[89]\\d{7}|1800\\d{7}|1900\\d{7})$", message = "Invalid phone number!") 
    private String phoneNumber;

    // Default elo is 400
    private int elo = BASE_ELO;

    @NotBlank(message = "Gender is required!")
    @Pattern(regexp = "^(M|F|Male|Female)$", message = "Gender must be either 'M', 'F', 'Male', or 'Female'.")
    private String gender;

    @NotNull(message = "Date of birth is required!")
    @Past(message = "Date of birth must be in the past!")
    private LocalDate dateOfBirth;

    @NotNull(message = "Age is required!")
    @Min(value = 0, message = "Age must be greater than 0!")
    private int age;

    @NotBlank(message = "Username is required!")
    @Indexed(unique = true)
    private String username;

    @NotBlank(message = "First name is required!")   
    private String firstName;

    @NotBlank(message = "Last name is required!")    
    private String lastName;

    private boolean isAvailable;
    
    @Valid
    private List<StrikeReport> strikeReports = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StrikeReport {
        @NotBlank(message = "Report details is required!")
        private String reportDetails;

        @NotNull(message = "Date created is required!")
        private LocalDateTime dateCreated;

        @NotBlank(message = "Admin Name is required!")
        private String issuedBy;
    }

    // Default role is USER FOR JWT
    private String role = "USER";

    // Enabled is used for email verification
    private boolean enabled;

    // Verification code is used for email verification
    private String verificationCode;

    // Time when the verification code expires
    private LocalDateTime verificationCodeExpiration;
}
