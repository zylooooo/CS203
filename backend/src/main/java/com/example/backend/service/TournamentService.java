package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.exception.TournamentNotFoundException;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.data.util.Pair;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    private static final Logger logger = LoggerFactory.getLogger(TournamentService.class);
    private final LocalValidatorFactoryBean validator;

    /**
     * Synchronously retrieves all tournaments from the database.
     * @return a list of all tournaments in the database
     * @throws RuntimeException if there's an error during the database operation
     */
    public List<Tournament> getAllTournaments() throws RuntimeException {
        try {
            List<Tournament> tournaments = tournamentRepository.findAll();
            logger.info("Retrieved {} tournaments", tournaments.size());
            return tournaments;
        } catch (Exception e) {
            logger.error("Error fetching all tournaments", e);
            throw new RuntimeException("Unexpected error occurred while fetching all tournaments", e);
        }
    }

    /**
     * Synchronously retrieves a tournament by its name
     * @param tournamentName the name of the tournament to retrieve
     * @return the tournament object associated with the specified tournament name
     * @throws TournamentNotFoundException if no tournament with the tournament name is found in the database
     */
    public Tournament getTournamentByName(String tournamentName) throws TournamentNotFoundException {
        return tournamentRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new TournamentNotFoundException(tournamentName));
    }

    /**
     * Asynchronously checks if a tournament name is available.
     * @param tournamentName the name of the tournament to check
     * @return a CompletableFuture that will complete with a Boolean indicating if the tournament name is available
     * @throws IllegalArgumentException if the tournament name is null or empty
     */
    @Async("taskExecutor")
    public CompletableFuture<Boolean> checkTournamentNameAvailability(String tournamentName) {
        return CompletableFuture.supplyAsync(() -> {
            if (tournamentName == null || tournamentName.isEmpty()) {
                throw new IllegalArgumentException("Tournament name must be provided!");
            }
            return !tournamentRepository.existsByTournamentName(tournamentName);
        });
    }

    /**
     * Asynchronously creates a new tournament in the database.
     * @param tournament the tournament object to be created
     * @return a CompletableFuture containing a Pair with the created tournament (if successful) or error messages (if validation fails)
     */
    @Async("taskExecutor")
    public CompletableFuture<Pair<Optional<Tournament>, Map<String, String>>> createTournament(Tournament tournament) {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, String> errors = new HashMap<>();
            
            try {
                // Validate the tournament object
                Errors validationErrors = new BeanPropertyBindingResult(tournament, "tournament");
                validator.validate(tournament, validationErrors);

                if (validationErrors.hasErrors()) {
                    validationErrors.getFieldErrors().forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                    );
                    return Pair.of(Optional.empty(), errors);
                }

                // Check if tournament name already exists
                if (tournamentRepository.existsByTournamentName(tournament.getTournamentName())) {
                    errors.put("tournamentName", "Tournament name already exists");
                    return Pair.of(Optional.empty(), errors);
                }

                // Set creation and update timestamps
                LocalDateTime currentTime = LocalDateTime.now();
                tournament.setCreatedAt(currentTime);
                tournament.setUpdatedAt(currentTime);

                // Save the tournament to the database
                Tournament savedTournament = tournamentRepository.save(tournament);
                logger.info("Tournament created successfully: {}", savedTournament.getTournamentName());
                
                return Pair.of(Optional.of(savedTournament), errors);
            } catch (Exception e) {
                logger.error("Error creating tournament: {}", e.getMessage(), e);
                errors.put("error", "An unexpected error occurred while creating the tournament");
                return Pair.of(Optional.empty(), errors);
            }
        });
    }

    /**
     * Asynchronously retrieves ongoing and future tournaments from the database.
     * 
     * This method fetches all tournaments and filters them based on two criteria:
     * 1. The tournament is marked as ongoing (isOngoing = true)
     * 2. Either the start date is in the future or the end date is today or in the future
     * 
     * @return A CompletableFuture containing a List of ongoing and future tournaments
     * @throws RuntimeException if there's an error during the database operation
     * @throws Exception for any unexpected errors during the process
     */
    @Async("taskExecutor")
    public CompletableFuture<List<Tournament>> getOngoingTournaments() throws RuntimeException {
        try {
            logger.info("Attempting to fetch ongoing and future tournaments!");
            
            // Get the current date for comparison
            LocalDate currentDate = LocalDate.now();
            logger.info("Current date: {}", currentDate);
            
            // Fetch all tournaments from the database
            List<Tournament> allTournaments = tournamentRepository.findAll();
            logger.info("Total tournaments in database: {}", allTournaments.size());
            
            // Filter tournaments to get ongoing and future ones
            List<Tournament> ongoingAndFutureTournaments = allTournaments.stream()
                .filter(t -> t.isOngoing() && // Tournament must be marked as ongoing
                            (t.getStartDate().isAfter(currentDate) || // Start date is in the future
                             t.getEndDate().isAfter(currentDate.minusDays(1)))) // End date is today or in the future
                .collect(Collectors.toList());
            
            logger.info("Ongoing and future tournaments: {}", ongoingAndFutureTournaments.size());
            
            // Log details of each ongoing and future tournament
            for (Tournament t : ongoingAndFutureTournaments) {
                logger.info("Tournament: {}, Start Date: {}, End Date: {}, Is Ongoing: {}", 
                            t.getTournamentName(), t.getStartDate(), t.getEndDate(), t.isOngoing());
                
                // Determine if the tournament is future or ongoing based on its start date
                if (t.getStartDate().isAfter(currentDate)) {
                    logger.info("Tournament {} is a future tournament", t.getTournamentName());
                } else {
                    logger.info("Tournament {} is an ongoing tournament", t.getTournamentName());
                }
            }
            
            // Return the list of ongoing and future tournaments wrapped in a CompletableFuture
            return CompletableFuture.completedFuture(ongoingAndFutureTournaments);
        } catch (Exception e) {
            // Log the error and rethrow it
            logger.error("Error fetching ongoing and future tournaments", e);
            throw new RuntimeException("Unexpected error occurred while fetching ongoing and future tournaments", e);
        }
    }

}