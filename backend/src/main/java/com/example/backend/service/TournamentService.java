package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.data.util.Pair;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final LocalValidatorFactoryBean validator;

    private static final Logger logger = LoggerFactory.getLogger(TournamentService.class);

    /**
     * Retrieves all tournaments from the database.
     *
     * @return a list of all tournaments. The list will be empty if no tournaments are found.
     * @throws RuntimeException if there is an error fetching tournaments from the database.
     */
    public List<Tournament> getAllTournaments() {
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
     * Retrieves a tournament by its name.
     *
     * @param tournamentName the name of the tournament to retrieve.
     * @return the tournament object associated with the specified tournament name.
     * @throws TournamentNotFoundException if no tournament with the specified name is found in the database.
     */
    public Tournament getTournamentByName(String tournamentName) throws TournamentNotFoundException {
        return tournamentRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new TournamentNotFoundException(tournamentName));
    }

    /**
     * Checks if a tournament name is available.
     *
     * @param tournamentName the name of the tournament to check.
     * @return true if the tournament name is available, false otherwise.
     * @throws IllegalArgumentException if the tournament name is null or empty.
     */
    public Boolean checkTournamentNameAvailability(String tournamentName) {
        if (tournamentName == null || tournamentName.isEmpty()) {
            throw new IllegalArgumentException("Tournament name must be provided!");
        }
        return !tournamentRepository.existsByTournamentName(tournamentName);
    }

    /**
     * Creates a new tournament.
     *
     * @param tournament the tournament object to be created.
     * @param adminName  the name of the admin creating the tournament.
     * @return a Pair with the created tournament (if successful) or error messages (if validation fails).
     * @throws RuntimeException if there's an unexpected error during the creation process.
     */
    public Pair<Optional<Tournament>, Map<String, String>> createTournament(Tournament tournament, String adminName) {
        Map<String, String> errors = new HashMap<>();

        try {
            tournament.setCreatedBy(adminName); // Set the creator of the tournament

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
            if (!checkTournamentNameAvailability(tournament.getTournamentName())) {
                errors.put("tournamentName", "Tournament name already exists");
                return Pair.of(Optional.empty(), errors);
            }

            // Set creation and update timestamps
            LocalDateTime currentTime = LocalDateTime.now();
            tournament.setCreatedAt(currentTime);
            tournament.setUpdatedAt(currentTime);

            Tournament savedTournament = tournamentRepository.save(tournament);
            logger.info("Tournament created successfully: {}", savedTournament.getTournamentName());

            return Pair.of(Optional.of(savedTournament), errors);
        } catch (Exception e) {
            logger.error("Error creating tournament: {}", e.getMessage(), e);
            errors.put("error", "An unexpected error occurred while creating the tournament");
            return Pair.of(Optional.empty(), errors);
        }
    }

    /**
     * Retrieves ongoing and future tournaments for users to participate in.
     *
     * @return a List of ongoing and future tournaments.
     * @throws TournamentNotFoundException if no ongoing or future tournaments are found.
     * @throws RuntimeException if there's an error during the database operation or any unexpected errors during the process.
     */
    public List<Tournament> getOngoingTournaments() {
        LocalDate currentDate = LocalDate.now();
        List<Tournament> ongoingAndFutureTournaments = tournamentRepository.findAll().stream()
            .filter(t -> t.isOngoing() || 
                         (t.getStartDate().isBefore(currentDate) && t.getEndDate().isAfter(currentDate)) ||
                         (t.getStartDate().isAfter(currentDate) && t.getEndDate().isAfter(currentDate)))
            .collect(Collectors.toList());

        logger.info("Found {} ongoing and future tournaments", ongoingAndFutureTournaments.size());

        // Log details of each ongoing and future tournament
        for (Tournament t : ongoingAndFutureTournaments) {
            logger.info("Tournament: {}, Start Date: {}, End Date: {}, Is Ongoing: {}", 
                        t.getTournamentName(), t.getStartDate(), t.getEndDate(), t.isOngoing());
        }

        return ongoingAndFutureTournaments;
    }

    /**
     * Retrieves all current tournaments.
     *
     * @return a List of current tournaments.
     * @throws TournamentNotFoundException if no tournaments are found.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getCurrentTournaments() throws RuntimeException {
        try {
            logger.info("Attempting to fetch all current tournaments!");
            LocalDate currentDate = LocalDate.now();
            List<Tournament> allTournaments = getAllTournaments();

            List<Tournament> currentTournaments = allTournaments.stream()
                .filter(t -> t.isOngoing() &&
                            (t.getStartDate().isBefore(currentDate) || t.getStartDate().isEqual(currentDate)) && 
                            (t.getEndDate().isAfter(currentDate) || t.getEndDate().isEqual(currentDate)))
                .collect(Collectors.toList());

            if (currentTournaments.isEmpty()) {
                logger.info("No current tournaments found");
            } else {
                logger.info("Found {} current tournaments", currentTournaments.size());
            }

            return currentTournaments;
        } catch (RuntimeException e) {
            logger.error("Unexpected error occurred while fetching current tournaments", e);
            throw new RuntimeException("Unexpected error occurred while fetching current tournaments", e);
        }
    }

    /**
     * Retrieves upcoming tournaments for a specific user.
     *
     * @param username the name of the user to retrieve upcoming tournaments for.
     * @return a List of upcoming tournaments for the specified user.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getUserUpcomingTournaments(String username) throws RuntimeException {
        try {
            logger.info("Starting getUserUpcomingTournaments for user: {}", username);
            List<Tournament> ongoingTournaments = this.getOngoingTournaments();
            logger.info("Retrieved {} ongoing tournaments", ongoingTournaments.size());

            List<Tournament> userUpcomingTournaments = ongoingTournaments.stream()
                .filter(tournament -> tournament.getPlayersPool().contains(username))
                .collect(Collectors.toList());

            if (userUpcomingTournaments.isEmpty()) {
                logger.info("No upcoming tournaments found for user: {}", username);
            } else {
                logger.info("Found {} upcoming tournaments for user: {}", userUpcomingTournaments.size(), username);
            }

            return userUpcomingTournaments;
        } catch (Exception e) {
            logger.error("Error in getUserUpcomingTournaments for user: {}", username, e);
            throw new RuntimeException("Unexpected error occurred while fetching user upcoming tournaments", e);
        }
    }

    /**
     * Retrieves all tournaments history.
     *
     * @return a List of tournaments that have ended and are not ongoing.
     * @throws TournamentNotFoundException if no tournaments are found in history.
     * @throws RuntimeException if there's an error during the database operation or any unexpected errors during the process.
     */
    public List<Tournament> getAllHistory() throws TournamentNotFoundException {
        try {
            logger.info("Attempting to fetch all tournaments history!");

            LocalDate currentDate = LocalDate.now();
            List<Tournament> allTournaments = getAllTournaments();
            if (allTournaments.isEmpty()) {
                throw new TournamentNotFoundException();
            }

            List<Tournament> allTournamentsHistory = allTournaments.stream()
                .filter(t -> t.getEndDate().isBefore(currentDate) && !t.isOngoing())
                .collect(Collectors.toList());

            if (allTournamentsHistory.isEmpty()) {
                throw new TournamentNotFoundException();
            }

            logger.info("Total tournaments history: {}", allTournamentsHistory.size());
            return allTournamentsHistory;
        } catch (TournamentNotFoundException e) {
            logger.error("No tournaments found!", e);
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching all tournaments history", e);
            throw new RuntimeException("Unexpected error occurred while fetching all tournaments history", e);
        }
    }

    /**
     * Retrieves the tournaments history for a specific user.
     *
     * @param username the name of the user to retrieve the tournaments history for.
     * @return a List of tournaments history for the specified user.
     * @throws TournamentNotFoundException if no tournaments are found for the specified user.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getUserHistory(String username) {
        try {
            List<Tournament> allTournamentsHistory = getAllHistory();
            List<Tournament> userTournamentsHistory = allTournamentsHistory.stream()
                .filter(t -> t.getPlayersPool().contains(username))
                .collect(Collectors.toList());

            if (userTournamentsHistory.isEmpty()) {
                logger.info("No tournament history found for user: {}", username);
            } else {
                logger.info("Found {} tournaments in history for user: {}", userTournamentsHistory.size(), username);
            }

            return userTournamentsHistory;
        } catch (Exception e) {
            logger.error("Error fetching tournaments history for user: {}", username, e);
            throw new RuntimeException("Unexpected error occurred while fetching tournaments history for user", e);
        }
    }

    /**
     * Retrieves all of the tournaments that a user can participate in.
     *
     * @param username the name of the user to retrieve the available tournaments for.
     * @return a List of tournaments that the user can participate in.
     * @throws UserNotFoundException if the user is not found in the database.
     * @throws TournamentNotFoundException if no tournaments are found in the database.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getUserAvailableTournaments(String username) throws UserNotFoundException, TournamentNotFoundException {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

            List<Tournament> allTournaments = getAllTournaments();
            LocalDate currentDate = LocalDate.now();

            List<Tournament> userAvailableTournaments = allTournaments.stream()
                .filter(tournament -> {
                    // Check if the tournament has already started or ended
                    if (tournament.getStartDate().isBefore(currentDate) || tournament.getStartDate().isEqual(currentDate)) {
                        return false; // Tournament has started or is starting today, so it's not available
                    }

                    // Check if the tournament is not full
                    if (tournament.getPlayersPool().size() >= tournament.getPlayerCapacity()) {
                        return false;
                    }

                    // Check if the user is not already in the tournament
                    if (tournament.getPlayersPool().contains(username)) {
                        return false;
                    }

                    // Check if the user's ELO is within the tournament's range
                    if (user.getElo() < tournament.getMinElo() || user.getElo() > tournament.getMaxElo()) {
                        return false;
                    }

                    // Check if the tournament's gender requirement matches the user's gender
                    if (!tournament.getGender().equalsIgnoreCase(user.getGender())) {
                        return false;
                    }

                    // Check if the user's age matches the tournament category
                    int userAge = user.getAge();
                    switch (tournament.getCategory()) {
                        case "U16":
                            return userAge <= 16;
                        case "U21":
                            return userAge <= 21;
                        case "Open":
                            return true;
                        default:
                            logger.warn("Unknown tournament category: {}", tournament.getCategory());
                            return false;
                    }
                })
                .collect(Collectors.toList());

            logger.info("Found {} available tournaments for user: {}", userAvailableTournaments.size(), username);
            return userAvailableTournaments;

        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            throw e;
        } catch (TournamentNotFoundException e) {
            logger.error("No tournaments found");
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching user available tournaments", e);
            throw new RuntimeException("Unexpected error occurred while fetching user available tournaments", e);
        }
    }
}