package com.example.backend.controller;

import com.example.backend.model.Tournament;
import com.example.backend.service.TournamentService;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/tournaments")
@RequiredArgsConstructor
public class TournamentsController {
    private final TournamentService tournamentService;

    private static final Logger logger = LoggerFactory.getLogger(TournamentsController.class);

    /**
     * Retrieves all tournaments from the database.
     * 
     * @return a ResponseEntity containing a list of all tournaments or an error message if an exception occurs.
     * @throws RuntimeException if there's an error during the database operation.
     */
    @GetMapping
    public ResponseEntity<?> getAllTournaments() {
        try {
            logger.info("Received request to get all tournaments");
            List<Tournament> tournaments = tournamentService.getAllTournaments();
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            logger.error("Error getting all tournaments", e);
            return ResponseEntity.internalServerError().body("An error occurred while fetching tournaments");
        }
    }

    /**
     * Retrieves a tournament by its name.
     * 
     * @param tournamentName the name of the tournament to retrieve.
     * @return a ResponseEntity containing the tournament object or an error message if the tournament is not found or an exception occurs.
     * @throws TournamentNotFoundException if no tournament with the specified name is found.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/{tournamentName}")
    public ResponseEntity<?> getTournamentByName(@PathVariable String tournamentName) {
        try {
            logger.info("Received request to get tournament by name: {}", tournamentName);
            Tournament tournament = tournamentService.getTournamentByName(tournamentName);
            return ResponseEntity.ok(tournament);
        } catch (TournamentNotFoundException e) {
            logger.error("Tournament not found with name: {}", tournamentName, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting tournament by name: {}", tournamentName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred while fetching the tournament"));
        }
    }

    /**
     * Creates a new tournament in the database.
     * 
     * @param tournament the tournament object to be created.
     * @return a CompletableFuture containing a ResponseEntity with the created tournament or error messages if validation fails.
     * @throws RuntimeException if there's an unexpected error during the creation process.
     */
    @PostMapping("/create")
    public CompletableFuture<ResponseEntity<?>> createTournament(@RequestBody Tournament tournament) {
        return tournamentService.createTournament(tournament)
            .<ResponseEntity<?>>thenApply(result -> {
                if (result.getFirst().isPresent()) {
                    return ResponseEntity.ok(result.getFirst().get());
                } else {
                    return ResponseEntity.badRequest().body(result.getSecond());
                }
            })
            .exceptionally(e -> {
                logger.error("Unexpected error in createTournament", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
            });
    }

    /**
     * Checks if a tournament name is available for use.
     * 
     * @param tournamentName the name of the tournament to check for availability.
     * @return a CompletableFuture containing a ResponseEntity with the availability status or error messages if validation fails.
     * @throws IllegalArgumentException if the tournament name is null or empty.
     * @throws RuntimeException for any unexpected errors during the availability check.
     */
    @GetMapping("/check-name-availability")
    public CompletableFuture<ResponseEntity<?>> checkTournamentNameAvailability(@RequestParam String tournamentName) {
        logger.info("Received request to check availability for tournament name: {}", tournamentName);
        return tournamentService.checkTournamentNameAvailability(tournamentName)
            .<ResponseEntity<?>>thenApply(isAvailable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("isAvailable", isAvailable);
                return ResponseEntity.ok(response);
            })
            .exceptionally(e -> {
                if (e.getCause() instanceof IllegalArgumentException) {
                    logger.error("Invalid tournament name provided", e);
                    return ResponseEntity.badRequest().body(Map.of("error", e.getCause().getMessage()));
                } else {
                    logger.error("Unexpected error while checking tournament name availability", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while checking tournament name availability"));
                }
            });
    }

    /**
     * Retrieves ongoing tournaments from the database.
     * 
     * @return a CompletableFuture containing a ResponseEntity with the list of ongoing tournaments or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no ongoing tournaments are found.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/ongoing")
    public CompletableFuture<ResponseEntity<?>> getOngoingTournaments() {
        return tournamentService.getOngoingTournaments()
            .<ResponseEntity<?>>thenApply(ongoingTournaments -> {
                logger.info("Total ongoing tournaments: {}", ongoingTournaments.size());
                return ResponseEntity.ok(ongoingTournaments);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof TournamentNotFoundException) {
                    logger.error("No ongoing tournaments found!", e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error getting ongoing tournaments!", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while fetching ongoing tournaments"));
                }
            });
    }

    // Async method to get all current tournaments
    @GetMapping("/current")
    public CompletableFuture<ResponseEntity<?>> getCurrentTournaments() {
        return tournamentService.getCurrentTournaments()
            .<ResponseEntity<?>>thenApply(currentTournaments -> {
                logger.info("Total current tournaments: {}", currentTournaments.size());
                return ResponseEntity.ok(currentTournaments);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof TournamentNotFoundException) {
                    logger.error("No current tournaments found!", e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error getting current tournaments!", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while fetching current tournaments"));
                }
            });
    }

    /**
     * Asynchronously retrieves all tournaments history.
     * 
     * @return a CompletableFuture containing a ResponseEntity with the list of all tournaments history or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no tournaments are found in history.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/history")
    public CompletableFuture<ResponseEntity<?>> getAllTournamentsHistory() {
        return tournamentService.getAllHistory()
            .<ResponseEntity<?>>thenApply(allTournamentsHistory -> {
                logger.info("Total tournaments history: {}", allTournamentsHistory.size());
                return ResponseEntity.ok(allTournamentsHistory);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof TournamentNotFoundException) {
                    logger.error("No tournaments found!", e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error getting all tournaments history!", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while fetching all tournaments history"));
                }
            });
    }

    /**
     * Asynchronously retrieves the tournaments history for a specific user.
     * 
     * @param userName the name of the user to retrieve the tournaments history for.
     * @return a CompletableFuture containing a ResponseEntity with the list of tournaments history for the user or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no tournaments are found for the specified user.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/{userName}/history")
    public CompletableFuture<ResponseEntity<?>> getTournamentsHistoryByUserName(@PathVariable String userName) {
        return tournamentService.getUserHistory(userName)
            .<ResponseEntity<?>>thenApply(userTournamentHistory -> {
                logger.info("Total tournaments history by user: {}", userTournamentHistory.size());
                return ResponseEntity.ok(userTournamentHistory);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof TournamentNotFoundException) {
                    logger.error("No tournaments found for user: {}", userName, e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error getting tournaments history by user: {}", userName, e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while fetching tournaments history by user"));
                }
            });
    }

    // Async router to get all of the tournaments that a user can participate in
    @GetMapping("/{userName}/availableTournaments")
    public CompletableFuture<ResponseEntity<?>> getUserAvailableTournaments(@PathVariable String userName) {
        return tournamentService.getUserAvailableTournaments(userName)
            .<ResponseEntity<?>>thenApply(userAvailableTournaments -> {
                logger.info("Total available tournaments for user: {}", userName);
                return ResponseEntity.ok(userAvailableTournaments);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof UserNotFoundException) {
                    logger.error("User not found!", e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", cause.getMessage()));
                } else if (cause instanceof TournamentNotFoundException) {
                    logger.error("No tournaments found!", e);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error getting user available tournaments!", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while fetching user available tournaments"));
                }
            });
    }


}