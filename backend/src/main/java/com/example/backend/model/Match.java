package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "match")
public class Match {
    @Id
    private String id;

    @NotBlank(message = "Tournament name is required!")
    private String tournamentName;
    @NotNull(message = "Start date is required!")
    private LocalDateTime startDate;

    private List<String> players; // players[0] is player 1, players[1] is player 2

    private List<Set> sets;

    private String matchWinner; // player 1 or player 2

    private boolean completed; // default value is false

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Set {
        private List<Integer> result; // result[0] is player 1 score, result[1] is player 2 score
        private String setWinner; // player 1 or player 2
    }
}
