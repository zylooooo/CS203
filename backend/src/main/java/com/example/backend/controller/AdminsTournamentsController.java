package com.example.backend.controller;

import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.responses.ErrorResponse;
import com.example.backend.service.TournamentService;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.MatchNotFoundException;
import com.example.backend.service.BracketService;
import com.example.backend.model.Match;
import com.example.backend.service.EloRatingService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.util.Pair;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/admins/tournaments")
@RequiredArgsConstructor
public class AdminsTournamentsController {

    private final TournamentService tournamentService;
    private final BracketService bracketService;
    private final EloRatingService eloRatingService;

    private static final Logger logger = LoggerFactory.getLogger(AdminsTournamentsController.class);

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
            logger.error("Tournament not found with name: {}", tournamentName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting tournament by name: {}", tournamentName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while fetching the tournament"));
        }
    }

        /**
     * Creates a new tournament in the database.
     * 
     * @param tournament the tournament object to be created.
     * @return a ResponseEntity with the created tournament or error messages if validation fails.
     * @throws RuntimeException if there's an unexpected error during the creation process.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createTournament(@RequestBody Tournament tournament) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();
        try {
            logger.info("Received request to create tournament: {} by admin: {}", tournament.getTournamentName(), adminName);
            Pair<Optional<Tournament>, Map<String, String>> result = tournamentService.createTournament(tournament, adminName);
            if (result.getFirst().isPresent()) {
                logger.info("Tournament created successfully: {} by admin: {}", result.getFirst().get().getTournamentName(), adminName);
                return ResponseEntity.ok(result.getFirst().get());
            } else {
                logger.warn("Tournament creation failed due to validation errors: {}", result.getSecond());
                return ResponseEntity.badRequest().body(result.getSecond());
            }
        } catch (Exception e) {
            logger.error("Unexpected error in createTournament", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while creating the tournament"));
        }
    }

        /**
     * Checks if a tournament name is available for use.
     * 
     * @param tournamentName the name of the tournament to check for availability.
     * @return a ResponseEntity with the availability status or error messages if validation fails.
     * @throws IllegalArgumentException if the tournament name is null or empty.
     * @throws RuntimeException for any unexpected errors during the availability check.
     */
    @GetMapping("/check-name-availability")
    public ResponseEntity<?> checkTournamentNameAvailability(@RequestParam String tournamentName) {
        logger.info("Received request to check availability for tournament name: {}", tournamentName);
        try {
            boolean isAvailable = tournamentService.checkTournamentNameAvailability(tournamentName);
            Map<String, Object> response = new HashMap<>();
            response.put("isAvailable", isAvailable);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid tournament name provided", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error while checking tournament name availability", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while checking tournament name availability"));
        }
    }

        /**
     * Retrieves all tournaments history.
     * 
     * @return a ResponseEntity with the list of all tournaments history or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no tournaments are found in history.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/all-history")
    public ResponseEntity<?> getAllTournamentsHistory() {
        try {
            List<Tournament> allTournamentsHistory = tournamentService.getAllHistory();
            logger.info("Total tournaments history: {}", allTournamentsHistory.size());
            return ResponseEntity.ok(allTournamentsHistory);
        } catch (Exception e) {
            logger.error("Unexpected error getting all tournaments history!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while fetching all tournaments history"));
        }
    }

    /**
     * Retrieves the history of tournaments created by the authenticated admin.
     *
     * @return a ResponseEntity with the list of past tournaments created by the admin or an error message if an exception occurs.
     */
    @GetMapping("/my-history")
    public ResponseEntity<?> getAdminTournamentHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        try {
            List<Tournament> tournamentHistory = tournamentService.getAdminHistory(adminName);
            logger.info("Retrieved {} past tournaments for admin: {}", tournamentHistory.size(), adminName);
            return ResponseEntity.ok(tournamentHistory);
        } catch (Exception e) {
            logger.error("Error getting tournament history for admin: {}", adminName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching tournament history"));
        }
    }


    /*
     * Retrieves current and future tournaments from the database.
     * 
     * @return a ResponseEntity with the list of current and future tournaments or an error message if an exception occurs.
     * 
     */
    @GetMapping("/ongoing")
    public ResponseEntity<?> getCurrentAndFutureTournaments() {
        try {
            List<Tournament> currentAndFutureTournaments = tournamentService.getCurrentAndFutureTournaments();
            logger.info("Total current and future tournaments: {}", currentAndFutureTournaments.size());
            return ResponseEntity.ok(currentAndFutureTournaments);
        } catch (Exception e) {
            logger.error("Unexpected error getting current and future tournaments!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching current and future tournaments"));
        }
    }

     /**
     * Retrieves ongoing and future tournaments created by the admin.
     *
     * @return a ResponseEntity with the list of upcoming tournaments created by the admin or an error message if an exception occurs.
     */
    @GetMapping("/scheduled")
    public ResponseEntity<?> getAdminScheduledTournaments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        try {
            logger.info("Received request to get upcoming tournaments created by admin: {}", adminName);
            List<Tournament> upcomingTournaments = tournamentService.getAdminUpcomingTournaments(adminName);
            return ResponseEntity.ok(upcomingTournaments);
        } catch (Exception e) {
            logger.error("Error getting upcoming tournaments created by admin: {}", adminName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching upcoming tournaments"));
        }
    }

     /**
     * Edit a tournament's details based on the provided tournament name and new details.
     *
     * @param tournamentName the name of the tournament to be updated.
     * @param newTournamentDetails the Tournament object containing the new details.
     * @return a ResponseEntity with the updated Tournament object or error messages if validation fails.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws IllegalArgumentException if the new tournament details are invalid.
     * @throws RuntimeException if there is an unexpected error during the update.
     */
    @PutMapping("/edit-{tournamentName}")
    public ResponseEntity<?> updateTournament(@PathVariable String tournamentName, @RequestBody Tournament newTournamentDetails) {

        logger.info("Received request to update tournament: {}", tournamentName);
        try {
            Map<String, Object> result = tournamentService.updateTournament(tournamentName, newTournamentDetails);

            if (result.containsKey("tournament")) {
                logger.info("Tournament updated successfully: {}", tournamentName);
                return ResponseEntity.ok(result.get("tournament"));
            } else {
                logger.warn("Tournament update failed due to validation errors: {}", result.get("errors"));
                return ResponseEntity.badRequest().body(result.get("errors"));
            } 

        } catch (TournamentNotFoundException e) {
            logger.error("Tournament not found: {}", tournamentName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (MatchNotFoundException e) {
            logger.error("Match not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid tournament details provided: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error in updateTournament", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while updating the tournament"));
        }
    }


    /**
     * Deletes a tournament and related matches.
     * 
     * @param tournamentName the name of the tournament to be deleted.
     * @return a ResponseEntity with a success message or error messages if validation fails.
     */

    @DeleteMapping("/{tournamentName}")
    public ResponseEntity<?> deleteTournament(@PathVariable String tournamentName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        logger.info("Received request to delete tournament: {} by admin: {}", tournamentName, adminName);
        try {
            tournamentService.deleteTournament(tournamentName, adminName);
            logger.info("Tournament deleted successfully: {}", tournamentName);
            return ResponseEntity.ok().body(Map.of("message", "Tournament deleted successfully"));
        } catch (TournamentNotFoundException e) {
            logger.error("Tournament not found: {}", tournamentName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid delete request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error in deleteTournament", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while deleting the tournament"));
        }
    }

     /**
     * Retrieves all users that are eligible to participate in a tournament.
     * @param tournamentName the name of the tournament to retrieve users for.
     * @return a ResponseEntity with the list of eligible users or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws IllegalArgumentException if the request is invalid.
     * @throws Exception if an unexpected error occurs during the retrieval process.
     */
    @GetMapping("/{tournamentName}/available-users")
    public ResponseEntity<?> getAvailableUsersForTournament(@PathVariable String tournamentName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        try {
            logger.info("Received request to get available users for tournament: {} by admin: {}", tournamentName, adminName);
            List<User> availableUsers = tournamentService.getAvailableUsersForTournament(tournamentName, adminName);
            return ResponseEntity.ok(availableUsers);
        } catch (TournamentNotFoundException e) {
            logger.error("Tournament not found: {}", tournamentName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting available users for tournament: {}", tournamentName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while fetching available users for the tournament"));
        }
    }


    // Generate bracket for tournament
    @PutMapping("/generate-bracket/{tournamentName}")
    public ResponseEntity<?> generateBracket(@PathVariable String tournamentName) {
        try {
            Map<String, Object> response = bracketService.generateBracket(tournamentName);
            return ResponseEntity.ok(response);
        } catch (TournamentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch(UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (MatchNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }   catch (Exception e) {
            logger.error("Error generating bracket: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred while generating the bracket!"));
        }
    }

    // Update the match results
    @PutMapping("/update-match")
    public ResponseEntity<?> updateMatchResults(@RequestBody Match newMatchDetails) {
        try {
            Match updatedMatch = bracketService.updateMatchResults(newMatchDetails);
            return ResponseEntity.ok(updatedMatch);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid match details provided: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating match results: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while updating the match results"));
        }
    }

    // Calculate and update the elo rating of the players after a match
    @PutMapping("/{matchId}/update-elo")
    public ResponseEntity<?> updateEloRating(@PathVariable String matchId) {
        try {
            eloRatingService.updateEloRating(matchId);
            return ResponseEntity.ok(Map.of("message", "Elo rating updated successfully"));
        } catch (MatchNotFoundException | UserNotFoundException | TournamentNotFoundException e) {
            logger.error("Error updating elo rating: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating elo rating: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while updating the elo rating"));
        }
    }

    @PutMapping("/{tournamentName}/end")
    public ResponseEntity<?> updateTournamentEndDate(@PathVariable String tournamentName) {
        try {
            Tournament updatedTournament = bracketService.updateTournamentEndDate(tournamentName);
            return ResponseEntity.ok(updatedTournament);
        } catch (TournamentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating tournament end date: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while updating the tournament end date"));
        }
    }
}
