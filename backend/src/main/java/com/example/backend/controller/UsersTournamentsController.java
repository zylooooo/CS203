package com.example.backend.controller;

import com.example.backend.model.Tournament;
import com.example.backend.responses.ErrorResponse;
import com.example.backend.service.TournamentService;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/users/tournaments")
@RequiredArgsConstructor
public class UsersTournamentsController {

    private final TournamentService tournamentService;

    private static final Logger logger = LoggerFactory.getLogger(UsersTournamentsController.class);

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
            logger.info("Tournament not found with name: {}", tournamentName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Tournament not found with name: " + tournamentName));
        } catch (Exception e) {
            logger.error("Unexpected error getting tournament by name: {}", tournamentName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching the tournament"));
        }
    }

    /**
     * Retrieves ongoing tournaments from the database.
     * 
     * @return a ResponseEntity with the list of ongoing tournaments or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no ongoing tournaments are found.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/ongoing")
    public ResponseEntity<?> getOngoingTournaments() {
        try {
            List<Tournament> ongoingTournaments = tournamentService.getOngoingTournaments();
            logger.info("Total ongoing tournaments: {}", ongoingTournaments.size());
            return ResponseEntity.ok(ongoingTournaments);
        } catch (Exception e) {
            logger.error("Unexpected error getting ongoing tournaments!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching ongoing tournaments"));
        }
    }

    /**
     * Retrieves current tournaments from the database.
     * 
     * @return a ResponseEntity containing the list of current tournaments or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no current tournaments are found.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentTournaments() {
        try {
            List<Tournament> currentTournaments = tournamentService.getCurrentTournaments();
            logger.info("Total current tournaments: {}", currentTournaments.size());
            return ResponseEntity.ok(currentTournaments);
        } catch (TournamentNotFoundException e) {
            logger.error("No current tournaments found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting current tournaments!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching current tournaments"));
        }
    }

    // Router to get the user's scheduled tournaments
    @GetMapping("/scheduled")
    public ResponseEntity<?> getUserUpcomingTournaments() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        try {
            List<Tournament> userScheduledTournaments = tournamentService.getUserUpcomingTournaments(username);
            return ResponseEntity.ok(userScheduledTournaments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

     /**
     * Retrieves the tournaments history for a specific user.
     * 
     * @param username the name of the user to retrieve the tournaments history for.
     * @return a ResponseEntity with the list of tournaments history for the user or an error message if an exception occurs.
     * @throws TournamentNotFoundException if no tournaments are found for the specified user.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getTournamentsHistoryByUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        try {
            List<Tournament> userTournamentHistory = tournamentService.getUserHistory(username);
            logger.info("Total tournaments history by user: {}", userTournamentHistory.size());
            return ResponseEntity.ok(userTournamentHistory);
        } catch (TournamentNotFoundException e) {
            logger.error("No tournaments found for user: {}", username, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting tournaments history by user: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching tournaments history by user"));
        }
    }


    /**
     * Retrieves the available tournaments for a specific user.
     * 
     * @param username the name of the user to retrieve the available tournaments for.
     * @return a ResponseEntity with the list of available tournaments for the user or an error message if an exception occurs.
     * @throws UserNotFoundException if the user is not found.
     * @throws TournamentNotFoundException if no tournaments are found for the specified user.
     * @throws RuntimeException for any unexpected errors during the retrieval process.
     */
    @GetMapping("/available-tournaments")
    public ResponseEntity<?> getUserAvailableTournaments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            List<Tournament> userAvailableTournaments = tournamentService.getUserAvailableTournaments(username);
            logger.info("Total available tournaments for user: {}", username);
            return ResponseEntity.ok(userAvailableTournaments);
        } catch (UserNotFoundException e) {
            logger.error("User not found!", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (TournamentNotFoundException e) {
            logger.error("No tournaments found!", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting user available tournaments!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while fetching user available tournaments"));
        }
    }




    
}
