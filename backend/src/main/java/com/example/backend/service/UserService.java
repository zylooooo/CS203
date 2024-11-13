package com.example.backend.service;

import com.example.backend.model.*;
import com.example.backend.repository.*;

import jakarta.validation.constraints.NotNull;

import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.MatchNotFoundException;
import com.example.backend.exception.TournamentNotFoundException;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int STRIKE_LIMIT = 3;

    /**
     * Enum representing different types of leaderboards available in the system.
     * SAME_GENDER: Leaderboard filtered by the user's gender
     * OPPOSITE_GENDER: Leaderboard filtered by the opposite gender
     * MIXED: Leaderboard including all genders
     */
    private enum LeaderboardType {
        SAME_GENDER,
        OPPOSITE_GENDER,
        MIXED
    }

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentService tournamentService;
    

    private final LocalValidatorFactoryBean validator;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * Fetch all the users from the database.
     *
     * @return a list of Users. The list will be empty if no users are found.
     * @throws RuntimeException if there is an error fetching users from the database.
     */
    public List<User> getAllUsers() {
        try {
            List<User> users = userRepository.findAll(); // Fetch all users from the repository
            logger.info("Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            logger.error("Error fetching all users", e);
            throw new RuntimeException("Error fetching users", e);
        }
    }

    /*
     * Checks if a user has exceeded the strike limit.
     *
     * @param username the username of the user to check.
     * @return true if the user has exceeded the strike limit, false otherwise.
     */
    public boolean hasExceededStrikeLimit(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return user.getStrikeReports().size() >= STRIKE_LIMIT;
    }

    /**
     * Retrieves a user from the database based on the username.
     *
     * @param username the username of the user to be retrieved, must not be null or empty.
     * @return the user object associated with the specified username.
     * @throws UserNotFoundException if no user with the username is found in the database.
     */
    public User getUserByUsername(String username) throws UserNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    /**
     * Checks if the provided username exists in the database.
     *
     * @param username the username to check.
     * @return true if the username exists, false otherwise.
     * @throws IllegalArgumentException if the username is null or empty.
     */
    public boolean checkIfUsernameExists(String username) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username must be provided!");
        }
        return userRepository.existsByUsername(username);
    }

    /**
     * Checks if the provided email exists in the database.
     *
     * @param email the email to check.
     * @return true if the email exists, false otherwise.
     * @throws IllegalArgumentException if the email is null or empty.
     */
    public boolean checkIfEmailExists(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email must be provided!");
        }
        return userRepository.existsByEmail(email);
    }

    /**
     * Create a new user in the database.
     * This method performs validation on the user data and checks for the uniqueness of the email and username.
     *
     * @param user the User object containing the details of the user to be created.
     * @return the newly created User.
     * @throws IllegalArgumentException if the user data is invalid or if the email or username already exists.
     * @throws RuntimeException         if there is an unexpected error during user creation.
     */
    public User createUser(@NotNull User user) throws IllegalArgumentException, RuntimeException {
        try {
            Errors errors = new BeanPropertyBindingResult(user, "user");
            validator.validate(user, errors);

            if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
                errors.rejectValue("email", "duplicate.email", "Email already exists");
            }
            if (user.getUsername() != null && userRepository.existsByUsername(user.getUsername())) {
                errors.rejectValue("username", "duplicate.username", "Username already exists");
            }

            if (errors.hasErrors()) {
                List<String> errorMessages = errors.getAllErrors().stream()
                        .map(error -> error.getDefaultMessage())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                throw new IllegalArgumentException(String.join(", ", errorMessages));
            }

            user.setPassword(passwordEncoder.encode(user.getPassword())); // Encode the password
            User createdUser = userRepository.save(user);
            logger.info("User created successfully: {}", createdUser.getUsername());
            return createdUser;
        } catch (IllegalArgumentException e) {
            logger.error("Validation errors during user creation: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Error creating user: " + e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    /**
     * Updates a user's details based on the provided username.
     * This method retrieves the user, validates the new details, and updates the user's information.
     * The strikeReport and participatedTournaments fields are intentionally left out
     * because the users should not be able to update that.
     * It returns an updated User Object.
     *
     * @param username      the username of the user to be updated.
     * @param newUserDetails the User object containing the new details.
     * @return a map containing the updated User object or errors if any.
     * @throws UserNotFoundException if no user with the username is found.
     * @throws IllegalArgumentException if the new user details are invalid.
     * @throws RuntimeException if there is an unexpected error during the update.
     */
    public Map<String, Object> updateUser(@NotNull String username, @NotNull User newUserDetails)
            throws UserNotFoundException, IllegalArgumentException, RuntimeException, MatchNotFoundException {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        try {
            Errors validationErrors = new BeanPropertyBindingResult(newUserDetails, "user");
            validator.validate(newUserDetails, validationErrors);

            if (validationErrors.hasErrors()) {
                validationErrors.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
                );
            }

            if (newUserDetails.getEmail() != null && !user.getEmail().equals(newUserDetails.getEmail()) && (userRepository.existsByEmail(newUserDetails.getEmail()) || adminRepository.existsByEmail(newUserDetails.getEmail()))) {
                errors.put("email", "Email already exists!");
            }

            if (newUserDetails.getUsername() != null && !user.getUsername().equals(newUserDetails.getUsername()) && (userRepository.existsByUsername(newUserDetails.getUsername()) || adminRepository.existsByAdminName(newUserDetails.getUsername()))) {
                errors.put("username", "Username already exists!");
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

             // Check if username is being updated
            boolean isUsernameUpdated = newUserDetails.getUsername() != null && !user.getUsername().equals(newUserDetails.getUsername());

            if (isUsernameUpdated) {
                // Get all the tournaments and filter out the ones that the user is participating in
                List<Tournament> tournaments = tournamentService.getAllTournaments().stream()
                    .filter(tournament -> tournament.getPlayersPool().contains(username))
                    .collect(Collectors.toList());
                
                // For each tournament, update the username in the players pool
                for (Tournament tournament : tournaments) {
                    tournament.getPlayersPool().set(tournament.getPlayersPool().indexOf(username), newUserDetails.getUsername());
                    tournamentRepository.save(tournament);

                    // Update matches for this tournament
                    updateMatchesForTournament(tournament.getTournamentName(), username, newUserDetails.getUsername());
                }
            }

            // Update only non-null fields
            Optional.ofNullable(newUserDetails.getEmail()).ifPresent(user::setEmail);

            // Handle password update
            if (newUserDetails.getPassword() != null) {
                // Check if the new password is different from the current hashed password
                if (!newUserDetails.getPassword().equals(user.getPassword())) {
                    // If different, assume it's a new plaintext password and encode it
                    user.setPassword(passwordEncoder.encode(newUserDetails.getPassword()));
                }
                // If it's the same as the current hashed password, do nothing
            }


            Optional.ofNullable(newUserDetails.getPhoneNumber()).ifPresent(user::setPhoneNumber);
            if (newUserDetails.getElo() != 0)
                user.setElo(newUserDetails.getElo());
            Optional.ofNullable(newUserDetails.getGender()).ifPresent(user::setGender);
            Optional.ofNullable(newUserDetails.getDateOfBirth()).ifPresent(user::setDateOfBirth);
            // Optional.ofNullable(newUserDetails.getProfilePic()).ifPresent(user::setProfilePic);
            Optional.ofNullable(newUserDetails.getUsername()).ifPresent(user::setUsername);
            Optional.ofNullable(newUserDetails.getFirstName()).ifPresent(user::setFirstName);
            Optional.ofNullable(newUserDetails.getLastName()).ifPresent(user::setLastName);

            response.put("user", userRepository.save(user));
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred during user update");
            throw e;
        }

        return response;
    }


    /**
     * Helper method used by updateUser to update the matches for a tournament.
     * 
     * @param tournamentName the name of the tournament.
     * @param oldUsername the old username to be replaced.
     * @param newUsername the new username to replace the old username.
     * @throws MatchNotFoundException if no matches are found for the tournament.
     */
    private void updateMatchesForTournament(String tournamentName, String oldUsername, String newUsername) throws MatchNotFoundException {
        List<Match> matches = matchRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new MatchNotFoundException(tournamentName));
    
        for (Match match : matches) {
            boolean matchUpdated = false;
            
            // Update players list
            if (match.getPlayers().contains(oldUsername)) {
                match.getPlayers().set(match.getPlayers().indexOf(oldUsername), newUsername);
                matchUpdated = true;
            }
    
            // Update sets
            for (Match.Set set : match.getSets()) {
                if (set.getSetWinner().equals(oldUsername)) {
                    set.setSetWinner(newUsername);
                    matchUpdated = true;
                }
            }
    
            // Update match winner
            if (match.getMatchWinner() != null && match.getMatchWinner().equals(oldUsername)) {
                match.setMatchWinner(newUsername);
                matchUpdated = true;
            }
    
            // Save the match if any updates were made
            if (matchUpdated) {
                matchRepository.save(match);
            }
        }
    }



    /**
     * Updates the availability of a user based on the username.
     *
     * @param username  the username of the user to update, must not be null or empty.
     * @param available the new availability status of the user.
     * @return the updated user object.
     * @throws UserNotFoundException if no user with the username is found in the database.
     * @throws RuntimeException if there is an unexpected error during the update process.
     */
    public User updateUserAvailability(String username, boolean available)
            throws UserNotFoundException, RuntimeException {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException(username));
            user.setAvailable(available);
            logger.info("User availability updated successfully: {}", username);
            return userRepository.save(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            throw new UserNotFoundException(username);
        } catch (Exception e) {
            logger.error("Unexpected error during user update: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    /**
     * Deletes a user from the user database and removes them from any ongoing or
     * future tournaments they are participating in.
     *
     * This method performs the following actions:
     * 1. Retrieves the user by their username.
     * 2. Fetches all ongoing and future tournaments.
     * 3. Removes the user from the players pool of each tournament.
     * 4. Handles incomplete matches by removing the user and determining the
     * winner.
     * 5. Updates the tournament in the database if any modifications were made.
     * 6. Deletes the user from the user database.
     *
     * @param username the username of the user to be deleted.
     * @throws UserNotFoundException if the user does not exist.
     * @throws RuntimeException for any unexpected errors during the deletion process.
     */
    public void deleteUser(@NotNull String username) throws UserNotFoundException, RuntimeException {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException(username));

            List<Tournament> currentAndFutureTournaments = tournamentService.getCurrentAndFutureTournaments();
            logger.info("Found {} current and future tournaments", currentAndFutureTournaments.size());

            if (!currentAndFutureTournaments.isEmpty()) {
                updateTournamentsWhenUserIsDeleted(currentAndFutureTournaments, username);
            } else {
                logger.info("No current and future tournaments found. Proceeding with user deletion.");
            }

            userRepository.delete(user);
            logger.info("User deleted successfully: {}", username);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during user deletion: {}", e.getMessage());
            throw new RuntimeException("Error deleting user: " + e.getMessage(), e);
        }
    }

    /**
     * Private helper method to update tournaments when a user is deleted.
     * Updates the tournaments by removing the specified user from the players pool
     * and handling any incomplete matches they are part of.
     *
     * @param tournaments the list of tournaments to update
     * @param username the username of the user to be removed
     * @throws MatchNotFoundException if matches for a tournament cannot be found
     */
    private void updateTournamentsWhenUserIsDeleted(List<Tournament> tournaments, String username) {

        for (Tournament tournament : tournaments) {
            boolean tournamentModified = false;
            int matchesModified = 0; // for logging purposes
    
            // Remove user from players pool
            if (tournament.getPlayersPool().remove(username)) {
                tournamentModified = true;
                logger.info("Removed user {} from players pool of tournament {}", username, tournament.getTournamentName());
            }
    
            // Fetch all matches for this tournament
            List<Match> tournamentMatches = matchRepository.findByTournamentName(tournament.getTournamentName())
                .orElseThrow(() -> new MatchNotFoundException(tournament.getTournamentName()));
            
            // Update each match
            for (Match match : tournamentMatches) {

                // If the match is not completed and the user is a participant
                if (!match.isCompleted() && match.getPlayers().contains(username)) {
                    List<String> players = match.getPlayers();
                    players.remove(username);
                    matchesModified++; // for logging purposes
                    
                    // Automatically set the match winner if there is only one player left
                    if (players.size() == 1) {
                        String winner = players.get(0);
                        match.setMatchWinner(winner);
                        match.setCompleted(true);
                    } else if (players.isEmpty()) { // If no players are left, mark the match as completed without a winner
                        match.setCompleted(true);
                    }
    
                    match.setSets(new ArrayList<>()); // Reset the sets for the match
                    matchRepository.save(match);
                    tournamentModified = true;
                }
            }
    
            // Save the tournament if modified
            if (tournamentModified) {
                tournamentRepository.save(tournament);
                logger.info("Updated tournament {}: removed user from players pool, modified {} matches", 
                            tournament.getTournamentName(), matchesModified);
            } else {
                logger.info("No changes made to tournament {}", tournament.getTournamentName());
            }
        }
    }

    /**
     * Private helper method to handle all leaderboard requests.
     * This method filters and sorts users based on the specified leaderboard type.
     *
     * @param username the username of the user requesting the leaderboard
     * @param type the type of leaderboard to generate (SAME_GENDER, OPPOSITE_GENDER, or MIXED)
     * @return a list of up to 10 users sorted by ELO rating
     * @throws IllegalArgumentException if the username is null or empty
     * @throws UserNotFoundException if the requesting user is not found
     * @throws RuntimeException if there is an unexpected error during processing
     */
    private List<User> getLeaderboard(String username, LeaderboardType type) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username must be provided!");
        }

        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

            List<User> allUsers = userRepository.findAll();
            if (allUsers.isEmpty()) {
                throw new UserNotFoundException("No users found in the database");
            }

            Stream<User> filteredUsers = allUsers.stream();
            
            // Apply gender filter based on type
            if (type == LeaderboardType.SAME_GENDER) {
                filteredUsers = filteredUsers.filter(u -> u.getGender().equals(user.getGender()));
            } else if (type == LeaderboardType.OPPOSITE_GENDER) {
                filteredUsers = filteredUsers.filter(u -> !u.getGender().equals(user.getGender()));
            }

            List<User> leaderboard = filteredUsers
                .sorted(Comparator.comparingInt(User::getElo).reversed())
                .limit(10)
                .collect(Collectors.toList());

            // For mixed leaderboard, ensure user is included if they qualify
            if (type == LeaderboardType.MIXED && !leaderboard.contains(user)) {
                leaderboard.add(user);
                leaderboard.sort(Comparator.comparingInt(User::getElo).reversed());
                if (leaderboard.size() > 10) {
                    leaderboard = leaderboard.subList(0, 10);
                }
            }

            return leaderboard;
        } catch (IllegalArgumentException | UserNotFoundException e) {
            logger.error("{}: {}", e.getClass().getSimpleName(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    /**
     * Function to show top 10 players in the database based on their elo rating and the gender of the user.
     *
     * @param username the username of the user requesting the leaderboard.
     * @return a list of top 10 users based on elo rating and matching gender.
     * @throws IllegalArgumentException if the username is null or empty.
     * @throws UserNotFoundException if the user is not found in the database.
     * @throws RuntimeException if there is an unexpected error during the process.
     */
    public List<User> getDefaultLeaderboard(String username) {
        return getLeaderboard(username, LeaderboardType.SAME_GENDER);
    }

    /**
     * Function to show top 10 players in the database based on their elo rating and the opposite gender of the user.
     *
     * @param username the username of the user requesting the leaderboard.
     * @return a list of top 10 users based on elo rating and opposite gender.
     * @throws IllegalArgumentException if the username is null or empty.
     * @throws UserNotFoundException if the user is not found in the database.
     * @throws RuntimeException if there is an unexpected error during the process.
     */
    public List<User> getOppositeGenderLeaderboard(String username) {
        return getLeaderboard(username, LeaderboardType.OPPOSITE_GENDER);
    }

    /**
     * Method to show top 10 players in the database based on their elo rating regardless of gender.
     *
     * @param username the username of the user requesting the leaderboard.
     * @return a list of top 10 users based on elo rating.
     * @throws IllegalArgumentException if the username is null or empty.
     * @throws UserNotFoundException if the user is not found in the database.
     * @throws RuntimeException if there is an unexpected error during the process.
     */
    public List<User> getMixedGenderLeaderboard(String username) {
        return getLeaderboard(username, LeaderboardType.MIXED);
    }

    /**
     * Allows a user to leave a tournament.
     *
     * @param tournamentName the name of the tournament to leave.
     * @param username the name of the player to leave the tournament.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     * @throws UserNotFoundException if the user is not found.
     * @throws IllegalArgumentException if the user is not in the tournament.
     */
    public void leaveTournament(String tournamentName, String username) {
        try {
            Tournament tournament = tournamentService.getTournamentByName(tournamentName);

            // Check if the user is already in the tournament
            if (tournament.getPlayersPool() == null || !tournament.getPlayersPool().contains(username)) {
                throw new IllegalArgumentException("User is not in the tournament!");
            }

            // Remove the user from the tournament
            tournament.getPlayersPool().remove(username);

            tournamentRepository.save(tournament);

            logger.info("User {} left tournament {}", username, tournamentName);
        } catch (TournamentNotFoundException | UserNotFoundException | IllegalArgumentException e) {
            logger.error("Error leaving tournament: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error leaving tournament: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}