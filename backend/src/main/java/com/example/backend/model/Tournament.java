package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournament")
public class Tournament {
    @Id
    private String id;

    @NotNull(message = "Tournament name is required!")
    @Indexed(unique = true)
    private String tournamentName;

    @NotNull(message = "Start date is required!")
    private LocalDate startDate;

    @NotNull(message = "End date is required!")
    private LocalDate endDate;
    
    @NotNull(message = "Location is required!")
    private String location;

    @NotNull(message = "Elo range is required!")
    @Pattern(regexp = "^(>=|<=|>|<|=)\\d+$", message = "Invalid elo range format!")
    private String eloRange;

    @NotNull(message = "Gender is required!")
    @Pattern(regexp = "^(M|F|Male|Female)$", message = "Invalid gender format!")
    private String gender;

    private List<String> playersPool;

    @Valid
    private List<Match> matches;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @NotNull(message = "Player capacity is required!")
    @Min(value = 2, message = "Player capacity must be at least 2!")
    private int playerCapacity;

    private boolean isOngoing = true;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Match {
        @NotNull(message = "Start date is required")
        private LocalDate startDate;
        private List<String> players;
        @Valid
        private List<Round> rounds;
        private String matchWinner;
        private boolean isCompleted;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Round {
            private String score;
            private String roundWinner;
        }
    }
}