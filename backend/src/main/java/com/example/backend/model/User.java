package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.*;
import java.time.LocalDate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {
    @Id
    private String id;

    @NotNull(message = "Email is required!")
    @Email(message = "Invalid email")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Invalid email!")
    @Indexed(unique = true)
    private String email;

    @NotNull(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters long!")
    private String password;

    @NotNull(message = "Phone number is required!")
    // Test if the phone number is a valid Singapore number
    @Pattern(regexp = "^(?:6\\d{7}|[89]\\d{7}|1800\\d{7}|1900\\d{7})$", message = "Invalid phone number!") 
    private String phoneNumber;

    // Default elo is 400
    private int elo = 400;

    @NotNull(message = "Gender is required!")
    private String gender;

    @NotNull(message = "Date of birth is required!")
    @Past(message = "Date of birth must be in the past!")
    private LocalDate dateOfBirth;

    @NotNull(message = "Age is required!")
    @Min(value = 0, message = "Age must be greater than 0!")
    private int age;

    private List<String> participatedTournaments;

    @Valid
    private MedicalInformation medicalInformation;

    private String profilePic;

    @NotNull(message = "Username is required!")
    @Indexed(unique = true)
    private String userName;

    @NotNull(message = "First name is required!")   
    private String firstName;

    @NotNull(message = "Last name is required!")    
    private String lastName;

    private boolean isAvailable;
    
    private List<StrikeReport> strikeReport;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalInformation {
        @NotNull(message = "Emergency contact number is required!")
        @Pattern(regexp = "^(?:6\\d{7}|[89]\\d{7}|1800\\d{7}|1900\\d{7})$", message = "Invalid phone number!") 
        private String emergencyContactNumber;

        @NotNull(message = "Emergency contact name is required!")
        private String emergencyContactName;

        @NotNull(message = "Relationship is required!")
        private String relationship;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StrikeReport {
        @NotNull(message = "Report details is required!")
        private String reportDetails;
        private String dateCreated;
        @NotNull(message = "Admin Name is required!")
        private String issuedBy;
    }
}