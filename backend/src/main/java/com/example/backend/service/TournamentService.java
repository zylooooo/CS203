package com.example.backend.service;

import com.example.backend.model.*;
import com.example.backend.repository.*;

import jakarta.validation.constraints.NotNull;

import com.example.backend.exception.*;

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

/**
 * Service class responsible for managing tournaments, including creating, retrieving, updating, and deleting tournaments.
 * It also handles user participation and eligibility checks for tournaments.
 */
@Service
@RequiredArgsConstructor
public class TournamentService {


    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
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
     * Checks if a tournament name is available for use.
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
     * Creates a new tournament with the specified details.
     *
     * @param tournament the tournament object to be created.
     * @param adminName  the name of the admin creating the tournament.
     * @return a Pair containing the created tournament (if successful) or error messages (if validation fails).
     * @throws RuntimeException if there's an unexpected error during the creation process.
     */
    public Pair<Optional<Tournament>, Map<String, String>> createTournament(Tournament tournament, String adminName) {
        Map<String, String> errors = new HashMap<>();

        try {
            tournament.setCreatedBy(adminName); // Set the creator of the tournament

            // Set creation and update timestamps
            LocalDateTime currentTime = LocalDateTime.now();
            tournament.setCreatedAt(currentTime);
            tournament.setUpdatedAt(currentTime);

            // Validate start date
            LocalDate oneMonthAfterCreation = currentTime.toLocalDate().plusMonths(1);
            if (tournament.getStartDate().isBefore(oneMonthAfterCreation)) {
                errors.put("startDate", "Start date must be at least one month after the creation date");
                return Pair.of(Optional.empty(), errors);
            }

            // Now set the start date to trigger the closingSignupDate calculation
            LocalDate startDate = tournament.getStartDate();
            if (startDate != null) {
                tournament.setStartDate(startDate);
            }

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
    public List<Tournament> getCurrentAndFutureTournaments() {
        
        List<Tournament> currentAndFutureTournaments = tournamentRepository.findAll().stream()
            .filter(t -> t.getEndDate() == null)
            .sorted(Comparator.comparing(Tournament::getStartDate))
            .collect(Collectors.toList());

        logger.info("Found {} current and future tournaments", currentAndFutureTournaments.size());

        // Log details of each current and future tournament
        for (Tournament t : currentAndFutureTournaments) {
            logger.info("Tournament: {}, Start Date: {}, End Date: {}", 
                        t.getTournamentName(), t.getStartDate(), t.getEndDate());
        }

        return currentAndFutureTournaments;
    }

    /**
     * Retrieves all current tournaments that are ongoing.
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
                .filter(t -> t.getEndDate() == null &&
                            (t.getStartDate().isBefore(currentDate) || t.getStartDate().isEqual(currentDate)))
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
            List<Tournament> currentAndFutureTournaments = this.getCurrentAndFutureTournaments();
            logger.info("Retrieved {} current and future tournaments", currentAndFutureTournaments.size());

            List<Tournament> userUpcomingTournaments = currentAndFutureTournaments.stream()
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
     * Retrieves the history of all tournaments that have ended and are not ongoing.
     *
     * @return a List of tournaments that have ended.
     * @throws TournamentNotFoundException if no tournaments are found in history.
     * @throws RuntimeException if there's an error during the database operation or any unexpected errors during the process.
     */
    public List<Tournament> getAllHistory() {
        List<Tournament> allTournaments = tournamentRepository.findAll();
        List<Tournament> pastTournaments = allTournaments.stream()
            .filter(tournament -> tournament.getEndDate() != null)
            .sorted(Comparator.comparing(Tournament::getEndDate).reversed())
            .collect(Collectors.toList());
    
        logger.info("Retrieved {} past tournaments.", pastTournaments.size());
        return pastTournaments;
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
     * Retrieves all tournaments that a user can participate in based on eligibility criteria.
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
                .filter(tournament -> isUserEligibleForTournament(user, tournament, currentDate, true))
                .sorted(Comparator.comparing(Tournament::getStartDate))
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
            logger.error("Unexpected error in getUserAvailableTournaments", e);
            throw new RuntimeException("Unexpected error occurred while fetching user available tournaments", e);
        }
    }


    /**
     * Retrieves all users that are eligible to participate in a specific tournament.
     *
     * @param tournamentName the name of the tournament to retrieve users for.
     * @param adminName the name of the admin who created the tournament.
     * @return a List of users that are eligible to participate in the tournament.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     */
    public List<User> getAvailableUsersForTournament(String tournamentName, String adminName) 
            throws TournamentNotFoundException, IllegalArgumentException {
        logger.info("Getting available users for tournament: {} created by admin: {}", tournamentName, adminName);
        
        Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

        if (!tournament.getCreatedBy().equals(adminName)) {
            throw new IllegalArgumentException("This tournament was not created by the specified admin");
        }

        // Check if the tournament has already ended
        if (tournament.getEndDate() != null) {
            throw new IllegalArgumentException("Cannot get available users for a tournament that has already ended");
        }

        List<User> allUsers = userRepository.findAll();
        LocalDate currentDate = LocalDate.now();

        return allUsers.stream()
            .filter(user -> isUserEligibleForTournament(user, tournament, currentDate, false) && user.isEnabled() && user.isAvailable())
            .collect(Collectors.toList());
    }


    /*
     * Helper method used by getAvailableUsersForTournament and getUserAvailableTournaments
     * to check if a user is eligible to participate in a tournament.
     * Based on the criteria in the tournament's signup and tournament details.
     */

    private boolean isUserEligibleForTournament(User user, Tournament tournament, LocalDate currentDate, boolean isUserSignup) {
        return (isUserSignup ? isSignupOpen(tournament, currentDate) : isTournamentUpcoming(tournament, currentDate)) &&
               isTournamentNotFull(tournament) &&
               isUserNotAlreadyInTournament(user, tournament) &&
               isUserEloInRange(user, tournament) &&
               isUserGenderMatching(user, tournament) &&
               isUserNotStriked(user, tournament) &&
               isUserAgeEligible(user, tournament);
    }

    // Checks if the signup is open for the tournament
    private boolean isSignupOpen(Tournament tournament, LocalDate currentDate) {
        return currentDate.isBefore(tournament.getClosingSignupDate());
    }

    // Checks if the tournament is upcoming
    private boolean isTournamentUpcoming(Tournament tournament, LocalDate currentDate) {
        return tournament.getStartDate().isAfter(currentDate);
    }

    // Checks if the tournament is not full
    private boolean isTournamentNotFull(Tournament tournament) {
        return tournament.getPlayersPool().size() < tournament.getPlayerCapacity();
    }

    // Checks if the user is not already in the tournament
    private boolean isUserNotAlreadyInTournament(User user, Tournament tournament) {
        return !tournament.getPlayersPool().contains(user.getUsername());
    }

    // Checks if the user's elo is in the tournament's range
    private boolean isUserEloInRange(User user, Tournament tournament) {
        return user.getElo() >= tournament.getMinElo() && user.getElo() <= tournament.getMaxElo();
    }

    // Checks if the user's gender matches the tournament's gender requirement
    private boolean isUserGenderMatching(User user, Tournament tournament) {
        return tournament.getGender().equalsIgnoreCase(user.getGender());
    }

    private boolean isUserNotStriked(User user, Tournament tournament) {
        List<User.StrikeReport> strikeReports = user.getStrikeReports();
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

        long recentStrikeCount = strikeReports.stream()
            .filter(strike -> strike.getIssuedBy() != null &&strike.getIssuedBy().equals(tournament.getCreatedBy()))
            .filter(strike -> strike.getDateCreated().isAfter(oneMonthAgo))
            .count();


        if (strikeReports.size() >= 3) {
            return false; // User has at least 3 strikes
        }

        if (recentStrikeCount > 0) {
            return false; // User has at least one strike within the last month
        }

        return true;
    }

    // Checks if the user's age matches the tournament category 
    private boolean isUserAgeEligible(User user, Tournament tournament) {
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
    }

     /**
     * Allows a user to join a tournament if they meet the eligibility criteria.
     *
     * @param username the name of the user trying to join the tournament.
     * @param tournamentName the name of the tournament to join.
     * @throws UserNotFoundException if the user is not found.
     * @throws TournamentNotFoundException if the tournament is not found.
     * @throws InvalidJoinException if the user is not eligible to join the tournament.
     */
    public void joinTournament(String username, String tournamentName) 
        throws TournamentNotFoundException, InvalidJoinException {
        try {
            List<Tournament> availableTournaments = getUserAvailableTournaments(username);

            if (availableTournaments.isEmpty()) {
                logger.info("No available tournaments found for user: {}", username);
                throw new InvalidJoinException("No available tournaments found for the user: " + username);
            }

            Tournament tournamentToJoin = availableTournaments.stream()
                .filter(t -> t.getTournamentName().equals(tournamentName))
                .findFirst()
                .orElse(null);

            if (tournamentToJoin == null) {
                logger.info("Tournament '{}' is not available for user: {}", tournamentName, username);
                throw new InvalidJoinException("Tournament is not available for joining");
            }

            tournamentToJoin.getPlayersPool().add(username);
            tournamentRepository.save(tournamentToJoin);

            logger.info("User '{}' successfully joined tournament '{}'", username, tournamentName);
        } catch (TournamentNotFoundException | InvalidJoinException e) {
            logger.info("Join tournament failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during tournament join", e);
            throw new RuntimeException("An unexpected error occurred while joining the tournament", e);
        }
    }

    /**
     * Retrieves current and future tournaments created by a specific admin.
     *
     * @param adminName the name of the admin who created the tournaments.
     * @return a List of current and future tournaments created by the specified admin.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getAdminUpcomingTournaments(String adminName) {
        try {
            logger.info("Fetching upcoming tournaments created by admin: {}", adminName);
            List<Tournament> currentAndFutureTournaments = getCurrentAndFutureTournaments();
            
            List<Tournament> adminUpcomingTournaments = currentAndFutureTournaments.stream()
                .filter(t -> t.getCreatedBy().equals(adminName))
                .collect(Collectors.toList());

            logger.info("Found {} upcoming tournaments created by admin: {}", adminUpcomingTournaments.size(), adminName);
            return adminUpcomingTournaments;
        } catch (Exception e) {
            logger.error("Error fetching upcoming tournaments created by admin: {}", adminName);
            throw new RuntimeException("Unexpected error occurred while fetching upcoming tournaments created by admin", e);
        }
    }

    /**
     * Retrieves the history of tournaments created by a specific admin.
     *
     * @param adminName the name of the admin who created the tournaments.
     * @return a List of past tournaments created by the specified admin.
     * @throws RuntimeException if there's an unexpected error during the retrieval process.
     */
    public List<Tournament> getAdminHistory(String adminName) {
        try {
            List<Tournament> allHistory = getAllHistory();
            
            List<Tournament> adminTournamentHistory = allHistory.stream()
                .filter(t -> t.getCreatedBy().equals(adminName))
                .collect(Collectors.toList());

            logger.info("Found {} past tournaments for admin: {}", adminTournamentHistory.size(), adminName);
            return adminTournamentHistory;
        } catch (TournamentNotFoundException e) {
            logger.info("No tournament history found for admin: {}", adminName);
            return Collections.emptyList();
        } catch (Exception e) {
            logger.error("Error fetching tournament history for admin: {}", adminName, e);
            throw new RuntimeException("Unexpected error occurred while fetching tournament history for admin", e);
        }
    }

    /**
     * Updates a tournament's details based on the provided tournament name and new details.
     * There are two cases:
     * 1) If there is at least one user in the playersPool, only certain fields can be updated.
     * 2) If there are no players in playersPool, more fields can be updated.
     *
     * @param tournamentName    the name of the tournament to be updated.
     * @param newTournamentDetails the Tournament object containing the new details.
     * @return a map containing the updated Tournament object or errors if any.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws IllegalArgumentException if the new tournament details are invalid.
     * @throws RuntimeException if there is an unexpected error during the update.
     */
    public Map<String, Object> updateTournament(@NotNull String tournamentName, @NotNull Tournament newTournamentDetails)
            throws TournamentNotFoundException, IllegalArgumentException, MatchNotFoundException {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

        // Check if the tournament has ended
        if (tournament.getEndDate() != null) {
            errors.put("error", "Cannot update a tournament that has already ended");
            response.put("errors", errors);
            return response;
        }

        // If bracket is not null, return an error
        if (tournament.getBracket() != null) {
            errors.put("error", "Cannot update a tournament after the bracket has been generated");
            response.put("errors", errors);
            return response;
        }

        try {
            Errors validationErrors = new BeanPropertyBindingResult(newTournamentDetails, "tournament");
            validator.validate(newTournamentDetails, validationErrors);

            if (validationErrors.hasErrors()) {
                validationErrors.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
                );
            }

            boolean hasPlayers = !tournament.getPlayersPool().isEmpty();

            // Common validations for both cases

            // Check if the tournament name is already taken
            if (newTournamentDetails.getTournamentName() != null && !tournament.getTournamentName().equals(newTournamentDetails.getTournamentName())) {
                if (tournamentRepository.existsByTournamentName(newTournamentDetails.getTournamentName())) {
                    errors.put("tournamentName", "Tournament name already exists!");
                }
            }

            // Check if the start date is at least one month after the creation date
            if (newTournamentDetails.getStartDate() != null && 
                newTournamentDetails.getStartDate().isBefore(tournament.getCreatedAt().toLocalDate().plusMonths(1))) {
                errors.put("startDate", "Start date must be at least one month after the creation date!");
            }

            // Check if the player capacity is not less than the current number of players
            if (newTournamentDetails.getPlayerCapacity() != null && 
                newTournamentDetails.getPlayerCapacity() < tournament.getPlayersPool().size()) {
                errors.put("playerCapacity", "Player capacity cannot be less than the current number of players!");
            }

            // Case 2: No players in playersPool
            if (!hasPlayers) {
                // Check if the elo range is valid
                if (newTournamentDetails.getMinElo() != null && newTournamentDetails.getMaxElo() != null &&
                    newTournamentDetails.getMinElo() > newTournamentDetails.getMaxElo()) {
                    errors.put("eloRange", "Minimum elo must be less than or equal to maximum elo!");
                }
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

            // Update non null fields

            Optional.ofNullable(newTournamentDetails.getCreatedBy()).ifPresent(tournament::setCreatedBy);
            Optional.ofNullable(newTournamentDetails.getLocation()).ifPresent(tournament::setLocation);
            Optional.ofNullable(newTournamentDetails.getTournamentName()).ifPresent(name -> {
                tournament.setTournamentName(name);
                updateMatchesTournamentName(tournamentName, name);
            });
            tournament.setUpdatedAt(LocalDateTime.now());
            Optional.ofNullable(newTournamentDetails.getStartDate()).ifPresent(tournament::setStartDate);
            Optional.ofNullable(newTournamentDetails.getRemarks()).ifPresent(tournament::setRemarks);
            Optional.ofNullable(newTournamentDetails.getPlayerCapacity()).ifPresent(tournament::setPlayerCapacity);

            // Update the elo range, gender, category and closing signup date if there are no players in the playersPool
            if (!hasPlayers) {
                Optional.ofNullable(newTournamentDetails.getMinElo()).ifPresent(tournament::setMinElo);
                Optional.ofNullable(newTournamentDetails.getMaxElo()).ifPresent(tournament::setMaxElo);
                Optional.ofNullable(newTournamentDetails.getGender()).ifPresent(tournament::setGender);
                Optional.ofNullable(newTournamentDetails.getCategory()).ifPresent(tournament::setCategory);
            }

            response.put("tournament", tournamentRepository.save(tournament));
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred during tournament update");
            throw e;
        }

        return response;
    }

    /*
     * Helper method used by updateTournament to update the matches for a tournament.
     * When the tournament name is updated, the matches for the tournament must be updated as well.
     * 
     * @param oldTournamentName the old name of the tournament.
     * @param newTournamentName the new name of the tournament.
     * @throws MatchNotFoundException if no matches are found for the tournament.
     */

    private void updateMatchesTournamentName(String oldTournamentName, String newTournamentName) {
        List<Match> matches = matchRepository.findByTournamentName(oldTournamentName)
            .orElseThrow(() -> new MatchNotFoundException(oldTournamentName));
        
        for (Match match : matches) {
            match.setTournamentName(newTournamentName);
            matchRepository.save(match);
        }
    }

    /*
     * Deletes a tournament and its related matches.
     *
     * @param tournamentName the name of the tournament to be deleted.
     * @param adminName the name of the admin who created the tournament.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws IllegalArgumentException if the tournament does not belong to the admin or has already ended.
     */
    public void deleteTournament(String tournamentName, String adminName) throws TournamentNotFoundException, IllegalArgumentException {
        Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

        // Check if the tournament belongs to the admin
        if (!tournament.getCreatedBy().equals(adminName)) {
            throw new IllegalArgumentException("You did not create this tournament!");
        }

        // Check if the tournament has ended
        if (tournament.getEndDate() != null) {
            throw new IllegalArgumentException("Cannot delete a tournament that has already ended");
        }

        // Delete related matches
        List<Match> matches = matchRepository.findByTournamentName(tournamentName)
                .orElse(Collections.emptyList());
        matchRepository.deleteAll(matches);

        // Delete the tournament
        tournamentRepository.delete(tournament);

        logger.info("Tournament and related matches deleted successfully: {}", tournamentName);
    }




    /**
     * Updates the players pool for a tournament.
     *
     * @param tournamentName the name of the tournament to update.
     * @param players a List of player names to add to the tournament.
     * @return a Map containing the updated tournament and lists of added and skipped players.
     */
    public Map<String, Object> updatePlayersPool(String tournamentName, List<String> players) {
        Tournament tournament;
        List<String> addedPlayers = new ArrayList<>();
        List<String> skippedPlayers = new ArrayList<>();
        Map<String, Object> result = new HashMap<>();

        try {
            tournament = getTournamentByName(tournamentName);
        } catch (TournamentNotFoundException | IllegalArgumentException e) {
            logger.error("Error accessing tournament: {}", e.getMessage());
            result.put("error", e.getMessage());
            return result;
        }

        for (String username : players) {
            processPlayer(username, tournament, addedPlayers, skippedPlayers);
        }

        try {
            if (!addedPlayers.isEmpty()) {
                tournamentRepository.save(tournament);
                result.put("message", "Players pool updated successfully");
            } else {
                result.put("message", "No changes made to the players pool");
            }
            
            result.put("addedPlayers", addedPlayers);
            result.put("skippedPlayers", skippedPlayers);
            
            return result;
        } catch (Exception e) {
            logger.error("Error saving tournament: {}", e.getMessage());
            result.put("error", "Failed to save tournament after updating players pool");
            return result;
        }
    }

    /**
     * Processes a player to add them to the tournament if they are eligible.
     *
     * @param username the name of the player to process.
     * @param tournament the tournament to add the player to.
     * @param addedPlayers a List to store the names of players added to the tournament.
     * @param skippedPlayers a List to store the names of players not added to the tournament.
     */
    private void processPlayer(String username, Tournament tournament, List<String> addedPlayers, List<String> skippedPlayers) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

            if (isEligibleForTournament(user, tournament)) {
                List<String> playersPool = tournament.getPlayersPool();
                if (playersPool == null) {
                    playersPool = new ArrayList<>();
                    tournament.setPlayersPool(playersPool);
                }
                
                if (!playersPool.contains(username)) {
                    playersPool.add(username);
                    addedPlayers.add(username);
                    logger.info("Added player {} to tournament {}", username, tournament.getTournamentName());
                } else {
                    logger.info("Player {} is already in the tournament {}", username, tournament.getTournamentName());
                    skippedPlayers.add(username + " (already in tournament)");
                }
            } else {
                logger.info("Player {} is not eligible for the tournament {}", username, tournament.getTournamentName());
                skippedPlayers.add(username + " (not eligible)");
            }
        } catch (UserNotFoundException e) {
            logger.info("Skipped player {}: User not found", username);
            skippedPlayers.add(username + " (user not found)");
        } catch (Exception e) {
            logger.error("Unexpected error processing player {}: {}", username, e.getMessage());
            skippedPlayers.add(username + " (unexpected error)");
        }
    }

    /**
     * Checks if a user is eligible to participate in a tournament.
     *
     * @param user the user to check eligibility for.
     * @param tournament the tournament to check eligibility for.
     * @return true if the user is eligible, false otherwise.
     */
    private boolean isEligibleForTournament(User user, Tournament tournament) {
        // Check if the tournament is full
        if (tournament.getPlayersPool().size() >= tournament.getPlayerCapacity()) {
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

        // Check user's age against tournament category
        int userAge = user.getAge();
        switch (tournament.getCategory()) {
            case "U16":
                if (userAge > 16) return false;
                break;
            case "U21":
                if (userAge > 21) return false;
                break;
            case "Open":
                break;
            default:
                logger.warn("Unknown tournament category: {}", tournament.getCategory());
                return false;
        }

        // Check for recent strikes
        for (User.StrikeReport strikeReport : user.getStrikeReports()) {
            if (strikeReport.getIssuedBy().equals(tournament.getCreatedBy()) && 
                strikeReport.getDateCreated().isAfter(LocalDateTime.now().minusMonths(1))) {
                return false;
            }
        }

        return true;
    }
    
    /**
     * Removes a user from a tournament.
     *
     * @param tournamentName the name of the tournament to remove the player from.
     * @param username the name of the player to remove from the tournament.
     * @return the updated tournament.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws UserNotFoundException if the user is not found.
     * @throws IllegalArgumentException if the closing signup date has passed.
     */
    public Tournament removePlayerFromTournament(String tournamentName, String username) {
        try {
            Tournament tournament = getTournamentByName(tournamentName);

            if (tournament.getClosingSignupDate() != null && tournament.getClosingSignupDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Closing sign up date has passed!");
            }

            List<String> playersPool = tournament.getPlayersPool() == null ? new ArrayList<>() : tournament.getPlayersPool();

            // Check if the user is in the tournament
            if (!userRepository.existsByUsername(username)) {
                throw new UserNotFoundException(username);
            }
            if (!playersPool.contains(username)) {
                throw new IllegalArgumentException("User is not in the tournament!");
            }

            playersPool.remove(username);
            tournament.setPlayersPool(playersPool);
            return tournamentRepository.save(tournament);
        } catch (TournamentNotFoundException | UserNotFoundException | IllegalArgumentException e) {
            logger.error("Error removing player from tournament: {}", tournamentName, e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error removing player from tournament: {}", tournamentName, e);
            throw new RuntimeException("Unexpected error removing player from tournament", e);
        }
    }
}
