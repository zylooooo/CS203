package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.time.LocalDate;

@Data // Lombok annotation to generate getters, setters, equals, and hashCode methods
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
@AllArgsConstructor // Lombok annotation to generate a constructor with all fields
@Document(collection = "user")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private int elo;
    private String gender;
    private List<TournamentHistory> tournamentHistory;

    @Data 
    @NoArgsConstructor 
    @AllArgsConstructor 
    public static class TournamentHistory {
        private int tournamentId;
        private int tournamentRank;
    }
}
