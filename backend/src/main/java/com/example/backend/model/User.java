// package com.example.backend.model;

// import lombok.Data;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;
// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;
// import java.util.List;
// import java.time.LocalDate;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Document(collection = "user")
// public class User {
//     @Id
//     private String id;
//     private String email;
//     private String password;
//     private LocalDate dateOfBirth;
//     private int elo;
//     private String gender;
//     private List<String> participatedTournaments;
//     private MedicalInformation medicalInformation;
//     private String profilePic;

//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class TournamentHistory {
//         private int tournamentId;
//         private int tournamentRank;
//     }

//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class MedicalInformation {
//         private String emergencyContact;
//         private String relationship;
//         private String medicalHistory;
//         private String medications;
//     }
// }

package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
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
    private String userId;
    private String email;
    private String password;
    private String phoneNumber;
    private String elo;
    private String gender;
    private LocalDate dateOfBirth;
    private List<String> participatedTournaments;
    private MedicalInformation medicalInformation;
    private String profilePic;
    private String suspensions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalInformation {
        private String emergencyContact;
        private String relationship;
        private String medicalHistory;
        private String medications;
    }
}