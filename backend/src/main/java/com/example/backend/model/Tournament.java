package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.time.LocalDateTime;
import java.time.LocalDate;

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

    @PastOrPresent(message = "Tournament must be created in the past or the present!")
    private LocalDateTime createdAt;

    @PastOrPresent(message = "Tournament must be updated in the past or the present!")
    private LocalDateTime updatedAt;

    @NotNull(message = "Admin who created the tournament is required!")
    private String createdBy;

    @NotNull(message = "Start date is required!")
    @FutureOrPresent(message = "Start date must be today or in the future!")
    private LocalDate startDate;

    @NotNull(message = "End date is required!")
    private LocalDate endDate;
    
    @NotNull(message = "Location is required!")
    private String location;

    @Min(value = 0, message = "Minimum elo must be at least 0!")
    private Integer minElo;

    @Min(value = 0, message = "Maximum elo must be at least 0!")
    private Integer maxElo;

    @NotNull(message = "Gender is required!")
    @Pattern(regexp = "^(M|F|Male|Female)$", message = "Invalid gender format!")
    private String gender;

    private List<String> playersPool;

    @Valid
    private List<Match> matches;

    private String remarks;

    @NotNull(message = "Category is required!")
    private String category;

    @NotNull(message = "Player capacity is required!")
    @Min(value = 2, message = "Player capacity must be at least 2!")
    private int playerCapacity;

    private boolean isOngoing = true;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Match {
        @NotNull(message = "Start date is required")
        private LocalDateTime startDate;
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

    @AssertTrue(message = "End date of the tournament must be after the start date!")
    private boolean isEndDateAfterStartDate() {
        return endDate.isAfter(startDate);
    }

    @AssertTrue(message = "Minimum elo must be less than maximum elo!")
    private boolean isValidEloRange() {
        if (minElo != null && maxElo != null) {
            return minElo <= maxElo;
        }
        return true;
    }

    @AssertTrue(message = "Either minimum elo or maximum elo must be provided!")
    private boolean isEloRangeProvided() {
        if (minElo == null && maxElo == null) {
            return false;
        }
        return true;
    }
}
