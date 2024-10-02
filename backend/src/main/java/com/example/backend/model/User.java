package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String phoneNumber;
    private int elo;
    private String gender;
    private LocalDate dateOfBirth;
    private List<String> participatedTournaments;
    private MedicalInformation medicalInformation;
    private String profilePic;
    @Indexed(unique = true)
    private String userName;
    private String firstName;
    private String lastName;
    private boolean isAvailable;
    private List<StrikeReport> strikeReport;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalInformation {
        private String emergencyContact;
        private String relationship;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StrikeReport {
        private String reportDetails;
        private String dateCreated;
        private String issuedBy;
    }
}