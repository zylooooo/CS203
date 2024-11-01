package com.example.backend.service;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.example.backend.exception.*;
import com.example.backend.model.Admin;
import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.TournamentRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TournamentRepository tournamentRepository;
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    private final LocalValidatorFactoryBean validator;
    private final PasswordEncoder passwordEncoder;

    private final Logger logger = LoggerFactory.getLogger(AdminService.class);

    /**
     * Updates an admin's details based on the provided username.
     * This method retrieves the admin, validates the new details, and updates the admin's information.
     * It returns an updated Admin Object.
     *
     * @param adminName       the username of the admin to be updated.
     * @param newAdminDetails the User object containing the new details.
     * @return a map containing the updated Admin object or errors if any.
     * @throws AdminNotFoundException if no admin with the username is found.
     * @throws IllegalArgumentException if the new admin details are invalid.
     * @throws RuntimeException if there is an unexpected error during the update.
     */
    public Map<String, Object> updateAdmin(@NotNull String adminName, @NotNull Admin newAdminDetails)
            throws AdminNotFoundException, IllegalArgumentException, RuntimeException {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        Admin admin = adminRepository.findByAdminName(adminName)
                .orElseThrow(() -> new AdminNotFoundException(adminName));

        try {
            Errors validationErrors = new BeanPropertyBindingResult(newAdminDetails, "admin");
            validator.validate(newAdminDetails, validationErrors);

            if (validationErrors.hasErrors()) {
                validationErrors.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
                );
            }

            if (newAdminDetails.getEmail() != null && !admin.getEmail().equals(newAdminDetails.getEmail()) && (adminRepository.existsByEmail(newAdminDetails.getEmail()) || userRepository.existsByEmail(newAdminDetails.getEmail()))) {
                errors.put("email", "Email already exists!");
            }

            if (newAdminDetails.getAdminName() != null && !admin.getAdminName().equals(newAdminDetails.getAdminName()) && (adminRepository.existsByAdminName(newAdminDetails.getAdminName()) || userRepository.existsByUsername(newAdminDetails.getAdminName()))) {
                errors.put("adminName", "Admin name already exists!");
            }

            if (!errors.isEmpty()) {
                response.put("errors", errors);
                return response;
            }

            // If the admin name is updated, update the tournaments where this admin is the creator
            boolean adminNameUpdated = newAdminDetails.getAdminName() != null && !admin.getAdminName().equals(newAdminDetails.getAdminName());

            if (adminNameUpdated) {
                // Update tournaments where this admin is the creator
                List<Tournament> tournaments = tournamentRepository.findAllByCreatedBy(adminName);
                for (Tournament tournament : tournaments) {
                    tournament.setCreatedBy(newAdminDetails.getAdminName());
                    tournamentRepository.save(tournament);
                }
            }

            // Update only non-null fields
            Optional.ofNullable(newAdminDetails.getEmail()).ifPresent(admin::setEmail);

            // Handle password update
            if (newAdminDetails.getPassword() != null) {
                // Check if the new password is different from the current hashed password
                if (!newAdminDetails.getPassword().equals(admin.getPassword())) {
                    // If different, assume it's a new plaintext password and encode it
                    admin.setPassword(passwordEncoder.encode(newAdminDetails.getPassword()));
                }
                // If it's the same as the current hashed password, do nothing
            }

            Optional.ofNullable(newAdminDetails.getAdminName()).ifPresent(admin::setAdminName);
            Optional.ofNullable(newAdminDetails.getFirstName()).ifPresent(admin::setFirstName);
            Optional.ofNullable(newAdminDetails.getLastName()).ifPresent(admin::setLastName);

            response.put("admin", adminRepository.save(admin));
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred during admin update");
            throw e;
        }

        return response;
    }

    /**
     * Deletes an admin by their username.
     * 
     * @param adminName the username of the admin to be deleted.
     * @throws AdminNotFoundException if the admin does not exist.
     * @throws RuntimeException for any unexpected errors during the deletion process.
     */
    public void deleteAdmin(@NotNull String adminName) throws AdminNotFoundException, RuntimeException {

        try {
            Admin admin = adminRepository.findByAdminName(adminName)
                    .orElseThrow(() -> new AdminNotFoundException(adminName));

            adminRepository.delete(admin);
            logger.info("Admin deleted successfully: {}", adminName);
        } catch (AdminNotFoundException e) {
            logger.warn("Attempt to delete non-existent admin: {}", adminName);
            throw e;
        }
    }

    /**
     * Retrieves an admin by their admin name.
     * 
     * @param adminName the admin name of the admin to retrieve
     * @return the Admin object associated with the specified admin name
     * @throws AdminNotFoundException if no admin with the admin name is found
     */
    public Admin getAdminByAdminName(String adminName) throws AdminNotFoundException {
        return adminRepository.findByAdminName(adminName)
                .orElseThrow(() -> new AdminNotFoundException(adminName));
    }

    /**
     * Checks if the provided admin name exists in the database.
     *
     * @param adminName the admin name to check.
     * @return true if the admin name exists, false otherwise.
     * @throws IllegalArgumentException if the admin name is null or empty.
     */
    public boolean checkIfAdminNameExists(String adminName) {
        if (adminName == null || adminName.isEmpty()) {
            throw new IllegalArgumentException("Admin name must be provided!");
        }
        return adminRepository.existsByAdminName(adminName);
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
        return adminRepository.existsByEmail(email);
    }

    /**
     * Issues a strike to a user. This feature is only accessible through the admin tournaments history page.
     *
     * @param adminName The name of the admin issuing the strike.
     * @param username The username of the user being struck.
     * @param tournamentName The name of the tournament related to this strike.
     * @param reportDetails The details of the strike report.
     * @throws UserNotFoundException if the user is not found.
     * @throws TournamentNotFoundException if the tournament is not found.
     * @throws InvalidStrikeException if the strike is invalid.
     */
    public void strikeUser(String adminName, String username, String tournamentName, String reportDetails) 
            throws UserNotFoundException, TournamentNotFoundException, InvalidStrikeException {

        // This username passed in must already exist in the tournament's players pool
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        
        // Get the tournament 
        Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

        // Check if the user is in the tournament's players pool
        if (!tournament.getPlayersPool().contains(username)) {
            throw new UserNotFoundException(username);
        }

        // Strikes can only be issued after the tournament has ended, up to a week after
        if (tournament.getEndDate() == null || tournament.getEndDate().plusDays(7).isBefore(LocalDate.now())) {
            throw new InvalidStrikeException("Strikes can only be issued after the tournament has ended, up to a week after.");
        }

        // Get the user's strikeReports
        List<User.StrikeReport> strikeReports = user.getStrikeReports();

        // If user has no strikes, add a new strike report
        if (strikeReports.isEmpty()) {

            logger.info("Admin {} issued a strike to user {} for tournament {}", adminName, username, tournamentName);
            strikeReports.add(new User.StrikeReport(reportDetails, LocalDateTime.now(), adminName));

            // Set the user's strikeReports
            user.setStrikeReports(strikeReports);

            // Save the user
            userRepository.save(user);
            return;
        }

        // Check if the user has already been struck 3 times
        if (strikeReports.size() >= 3) {
            throw new InvalidStrikeException("User has already been struck 3 times.");
        }

        

        // If user has 1 or 2 strikes, check if the strike is being issued within a week of the most recent strike by this admin
        LocalDateTime mostRecentStrikeDate = strikeReports.stream()
                .filter(strike -> strike.getIssuedBy().equals(adminName))
                .map(User.StrikeReport::getDateCreated)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        // Admin cannot issue a strike more than once a week on the same user
        if (mostRecentStrikeDate != null && mostRecentStrikeDate.plusDays(7).isAfter(LocalDateTime.now())) {
            throw new InvalidStrikeException("Admin cannot issue a strike more than once a week on the same user.");
        }

        // Add the new strike report
        strikeReports.add(new User.StrikeReport(reportDetails, LocalDateTime.now(), adminName));

        // Set the user's strikeReports
        user.setStrikeReports(strikeReports);

        // Save the user
        userRepository.save(user);

        logger.info("Admin {} issued a strike to user {} for tournament {}. Current strike count: {}", adminName, username, tournamentName, strikeReports.size());

    }    
}
