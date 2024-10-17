package com.example.backend.service;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.example.backend.exception.AdminNotFoundException;
import com.example.backend.model.Admin;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

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

            // Update only non-null fields
            Optional.ofNullable(newAdminDetails.getEmail()).ifPresent(admin::setEmail);
            Optional.ofNullable(newAdminDetails.getPassword())
                    .ifPresent(password -> admin.setPassword(passwordEncoder.encode(password)));
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




    
}
