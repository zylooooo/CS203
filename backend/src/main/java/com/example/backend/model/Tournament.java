// package com.example.backend.model;

// import lombok.Data;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;
// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// import java.time.LocalDate;
// import java.util.List;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Document(collection = "tournament")
// public class Tournament {
//     @Id
//     private String id;
//     private String name;
//     private LocalDate startDate;
//     private LocalDate endDate;
//     private String location;
//     private String eloRange;
//     private String gender;
//     private List<String> playersPool;
//     private List<Match> matches;

//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class Match {
//         private String matchId;
//         private LocalDate startDate;
//         private List<String> players;
//         private List<Round> rounds;
//         private String matchWinner;
//         private boolean isCompleted;

//         @Data
//         @NoArgsConstructor
//         @AllArgsConstructor
//         public static class Round {
//             private String score;
//             private String roundWinner;
//         }
//     }
// }

package com.example.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String eloRange;
    private String gender;
    private List<String> playersPool;
    private List<Match> matches;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Match {
        private LocalDate startDate;
        private List<String> players;
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