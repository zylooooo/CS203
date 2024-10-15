package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.TournamentRepository;

import jakarta.validation.constraints.NotNull;

import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentService tournamentService;

    private final LocalValidatorFactoryBean validator;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * Fetch all the users from the database.
     *
     * @return a list of Users. The list will be empty if no users are found.
     * @throws RuntimeException if there is an error fetching users from the
     *                          database.
     */
    public List<User> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            logger.info("Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            logger.error("Error fetching all users", e);
            throw new RuntimeException("Error fetching users", e);
        }
    }

    /**
     * Retrieves a user from the databsae based on the user name
     * 
     * @param username the username of the user to be retrieved, must not be null or
     *                 empty
     * @return the user object associated with the specified username
     * @throws UserNotFoundException if no user with the username is found in the
     *                               database
     */
    public User getUserByUsername(String username) throws UserNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    /**
     * Checks if the provided username exists in the database.
     *
     * @param username the username to check
     * @return true if the username exists, false otherwise
     * @throws IllegalArgumentException if the username is null or empty
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
     * @param email the email to check
     * @return true if the email exists, false otherwise
     * @throws IllegalArgumentException if the email is null or empty
     */
    public boolean checkIfEmailExists(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email must be provided!");
        }
        return userRepository.existsByEmail(email);
    }

    /**
     * Create a new user in the database.
     * This method performs validation on the user data and checks for the
     * uniqueness of the email and username.
     *
     * @param user the User object containing the details of the user to be created.
     * @return the newly created User.
     * @throws IllegalArgumentException if the user data is invalid or if the email
     *                                  or username already exists
     * @throws RuntimeException         if there is an unexpected error during user
     *                                  creation
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

            // Encode the password before saving the user
            user.setPassword(passwordEncoder.encode(user.getPassword()));

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
     * Updates a user's details based on the provided user name
     * 
     * This method retrieves the user, validates the new details, and updates the
     * user's information.
     * The strikeReport and participatedTournaments field are intentionally left out
     * because the users should not be able to update that.
     * It returns an updated User Object.
     * 
     * @param username
     * @param newUserDetails
     * @return the updated User Object
     * @throws UserNotFoundException
     * @throws IllegalArgumentException
     * @throws RuntimeException
     */
    public Map<String, Object> updateUser(@NotNull String username, @NotNull User newUserDetails)
            throws UserNotFoundException, IllegalArgumentException, RuntimeException {
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

            if (newUserDetails.getEmail() != null && !user.getEmail().equals(newUserDetails.getEmail()) && userRepository.existsByEmail(newUserDetails.getEmail())) {
                errors.put("email", "Email already exists!");
            }

            if (newUserDetails.getUsername() != null && !user.getUsername().equals(newUserDetails.getUsername()) && userRepository.existsByUsername(newUserDetails.getUsername())) {
                errors.put("username", "Username already exists!");
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

            // Update only non-null fields
            Optional.ofNullable(newUserDetails.getEmail()).ifPresent(user::setEmail);
            Optional.ofNullable(newUserDetails.getPassword())
                    .ifPresent(password -> user.setPassword(passwordEncoder.encode(password)));
            Optional.ofNullable(newUserDetails.getPhoneNumber()).ifPresent(user::setPhoneNumber);
            if (newUserDetails.getElo() != 0)
                user.setElo(newUserDetails.getElo());
            Optional.ofNullable(newUserDetails.getGender()).ifPresent(user::setGender);
            Optional.ofNullable(newUserDetails.getDateOfBirth()).ifPresent(user::setDateOfBirth);
            Optional.ofNullable(newUserDetails.getMedicalInformation()).ifPresent(user::setMedicalInformation);
            Optional.ofNullable(newUserDetails.getProfilePic()).ifPresent(user::setProfilePic);
            Optional.ofNullable(newUserDetails.getUsername()).ifPresent(user::setUsername);
            Optional.ofNullable(newUserDetails.getFirstName()).ifPresent(user::setFirstName);
            Optional.ofNullable(newUserDetails.getLastName()).ifPresent(user::setLastName);
            user.setAvailable(newUserDetails.isAvailable());

            response.put("user", userRepository.save(user));
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred during user update");
            throw e;
        }

        return response;
    }

    /**
     * Updates the availability of a user based on the user name
     * 
     * @param username  the username of the user to update, must not be null or
     *                  empty
     * @param available the new availability status of the user
     * @return the updated user object
     * @throws UserNotFoundException if no user with the username is found in the
     *                               database
     * @throws RuntimeException      if there is an unexpected error during the
     *                               update process
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
     * @param username the username of the user to be deleted
     * @throws UserNotFoundException if the user does not exist
     * @throws RuntimeException      for any unexpected errors during the deletion
     *                               process
     */
    public void deleteUser(@NotNull String username) throws UserNotFoundException, RuntimeException {
        try {
            // Retrieve the user by username, throwing an exception if not found
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException(username));

            // Fetch ongoing and future tournaments the user is part of
            List<Tournament> ongoingAndFutureTournaments = tournamentService.getOngoingTournaments();
            logger.info("Found {} ongoing and future tournaments", ongoingAndFutureTournaments.size());

            // If there are tournaments, update them to remove the user
            if (!ongoingAndFutureTournaments.isEmpty()) {
                updateTournaments(ongoingAndFutureTournaments, username);
            } else {
                logger.info("No ongoing tournaments found. Proceeding with user deletion.");
            }

            // Delete the user from the user repository
            userRepository.delete(user);
            logger.info("User deleted successfully: {}", username);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            throw e; // Rethrow the exception for handling upstream
        } catch (Exception e) {
            logger.error("Unexpected error during user deletion: {}", e.getMessage());
            throw new RuntimeException("Error deleting user: " + e.getMessage(), e);
        }
    }

    /**
     * Updates the tournaments by removing the specified user from the players pool
     * and handling any incomplete matches they are part of.
     *
     * This method checks each tournament for the specified user and performs the
     * following actions:
     * 1. Removes the user from the players pool if they are present.
     * 2. For each match in the tournament, if the match is incomplete and the user
     *    is a participant, removes the user and determines the match winner if
     *    applicable.
     * 3. Saves any modified tournaments back to the database.
     *
     * @param tournaments the list of tournaments to update
     * @param username    the username of the user to be removed from the tournaments
     */
    private void updateTournaments(List<Tournament> tournaments, String username) {
        for (Tournament tournament : tournaments) {
            boolean tournamentModified = false; // Flag to track if the tournament was modified

            // Remove the user from the players pool if present
            List<String> playersPool = tournament.getPlayersPool();
            if (playersPool != null && playersPool.remove(username)) {
                tournamentModified = true; // Mark tournament as modified
                logger.info("Removed user {} from players pool of tournament {}", username,
                        tournament.getTournamentName());
            }

            // Check each match in the tournament for the user
            List<Tournament.Match> matches = tournament.getMatches();
            if (matches != null) {
                for (Tournament.Match match : matches) {
                    List<String> players = match.getPlayers();
                    // If the match is incomplete and the user is a participant
                    if (!match.isCompleted() && players != null && players.contains(username)) {
                        players.remove(username); // Remove the user from the match
                        tournamentModified = true; // Mark tournament as modified
                        logger.info("Removed user {} from incomplete match in tournament {}", username,
                                tournament.getTournamentName());

                        // Determine the match winner if there are remaining players
                        if (!players.isEmpty()) {
                            String winner = players.get(0);
                            match.setMatchWinner(winner);
                            match.setCompleted(true);
                            match.setRounds(new ArrayList<>());
                            logger.info("Set {} as winner and deleted all rounds for match in tournament {}", winner,
                                    tournament.getTournamentName());
                        } else {
                            // If no players are left, mark the match as completed without a winner
                            match.setCompleted(true);
                            match.setRounds(new ArrayList<>());
                            logger.info(
                                    "Marked match as completed without a winner and deleted all rounds in tournament {}",
                                    tournament.getTournamentName());
                        }
                    }
                }
            }

            // If the tournament was modified, save the changes
            if (tournamentModified) {
                Tournament updatedTournament = tournamentRepository.save(tournament);
                logger.info("Updated tournament {}: players pool size = {}, matches size = {}",
                        updatedTournament.getTournamentName(),
                        updatedTournament.getPlayersPool() != null ? updatedTournament.getPlayersPool().size() : 0,
                        updatedTournament.getMatches() != null ? updatedTournament.getMatches().size() : 0);
            }
        }
    }

    // Function to show top 10 players in the database based on their elo rating and the gender of the user
    public List<User> getDefaultLeaderboard(String username) throws IllegalArgumentException, UserNotFoundException, RuntimeException {
        try {
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username must be provided!");
            }

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

            List<User> allUsers = userRepository.findAll();
            if (allUsers.isEmpty()) {
                throw new UserNotFoundException("No users found in the database");
            }

            List<User> leaderboard = allUsers.stream()
                .filter(u -> u.getGender().equals(user.getGender()))
                .sorted(Comparator.comparingInt(User::getElo).reversed())
                .limit(10)
                .collect(Collectors.toList());

            return leaderboard;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            throw e;
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    // Function to show top 10 players in the databse based on their elo rating and the opposite gender of the user
    public List<User> getOppositeGenderLeaderboard(String username) throws IllegalArgumentException, UserNotFoundException, RuntimeException {
        try {
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username must be provided!");
            }

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

            List<User> allUsers = userRepository.findAll();
            if (allUsers.isEmpty()) {
                throw new UserNotFoundException("No users found in the database");
            }

            List<User> oppositeGenderLeaderboard = allUsers.stream()
                .filter(u -> !u.getGender().equals(user.getGender()))
                .sorted(Comparator.comparingInt(User::getElo).reversed())
                .limit(10)
                .collect(Collectors.toList());
            
            return oppositeGenderLeaderboard;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            throw e;
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    // Method to show top 10 players in the database based on their elo rating regardless of gender
    public List<User> getMixedGenderLeaderboard(String username) throws IllegalArgumentException, UserNotFoundException, RuntimeException {
        try {
            if (username == null || username.isEmpty()) {
                throw new IllegalArgumentException("Username must be provided!");
            }

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
            
            List<User> allUsers = userRepository.findAll();
            if (allUsers.isEmpty()) {
                throw new UserNotFoundException();
            }

            List<User> mixedGenderLeaderboard = allUsers.stream()
                .sorted(Comparator.comparingInt(User::getElo).reversed())
                .limit(10)
                .collect(Collectors.toList());
            
            if (!mixedGenderLeaderboard.contains(user)) {
                mixedGenderLeaderboard.add(user);
                mixedGenderLeaderboard.sort(Comparator.comparingInt(User::getElo).reversed());
                if (mixedGenderLeaderboard.size() > 10) {
                    mixedGenderLeaderboard = mixedGenderLeaderboard.subList(0, 10);
                }
            }

            return mixedGenderLeaderboard;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            throw e;
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

}