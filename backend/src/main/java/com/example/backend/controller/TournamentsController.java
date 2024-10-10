package com.example.backend.controller;

import com.example.backend.model.Tournament;
import com.example.backend.service.TournamentService;

import com.example.backend.exception.TournamentNotFoundException;

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

    // Async method to get ongoing tournaments
    @GetMapping("/ongoing")
    public CompletableFuture<ResponseEntity<?>> getOngoingTournaments() {
        return tournamentService.getOngoingTournaments()
        .<ResponseEntity<?>>thenApply(ongoingTournaments -> {
            return ResponseEntity.ok(ongoingTournaments);
        })
        .exceptionally(e -> {
            logger.error("Unexpected error getting ongoing tournaments!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while fetching ongoing tournaments"));
        });
    }
}
