package com.example.backend.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.exception.AdminNotFoundException;
import com.example.backend.exception.InvalidStrikeException;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.model.Admin;
import com.example.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.*;

@RestController
@RequestMapping("/admins")
@RequiredArgsConstructor
public class AdminsController {

    private static final Logger logger = LoggerFactory.getLogger(AdminsController.class);
    private final AdminService adminService;  


    /**
     * Retrieves the admin profile based on the authenticated admin's name.
     * 
     * @return a ResponseEntity containing the admin object or an error message if the admin is not found or an exception occurs.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();
        
        try {
            Admin admin = adminService.getAdminByAdminName(adminName);
            logger.info("Admin profile retrieved successfully: {}", adminName);
            return ResponseEntity.ok(admin);
        } catch (AdminNotFoundException e) {
            logger.warn("Admin not found: {}", adminName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Admin account not found"));
        } catch (UsernameNotFoundException e) {
            logger.warn("Admin not authenticated: {}", adminName);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Admin not authenticated"));
        } catch (Exception e) {
            logger.error("Error retrieving admin profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while retrieving the admin profile"));
        }
    }

    /**
     * Updates an admin's details.
     *
     * @param newAdminDetails the Admin object containing the updated admin details.
     * @return a ResponseEntity containing the updated admin details or error messages if validation fails.
     * @throws Exception if an unexpected error occurs during the update process.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateAdmin(@RequestBody Admin newAdminDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        try {
            Map<String, Object> response = adminService.updateAdmin(adminName, newAdminDetails);

            if (response.containsKey("errors")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response.get("errors"));
            }

            return ResponseEntity.ok(response.get("admin"));
        } catch (Exception e) {
            logger.error("Unexpected error during admin update: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred during admin update!"));
        }
    }

    /**
     * Deletes the authenticated admin's account.
     * 
     * @return a ResponseEntity with a success message or error messages if the admin is not found or an exception occurs.
     * @throws Exception if an unexpected error occurs during the deletion process.
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        try {
            adminService.deleteAdmin(adminName);
            return ResponseEntity.ok(Map.of("message", "Admin account deleted successfully"));
        } catch (AdminNotFoundException e) {
            logger.error("Admin not found during deletion: {}", adminName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Admin account not found"));
        } catch (Exception e) {
            logger.error("Unexpected error during admin deletion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred during admin deletion"));
        }
    }

    /**
     * Issues a strike against a user in a tournament.
     * 
     * @param strikeRequest a map containing the username, tournament name, and report details for the strike.
     * @return a ResponseEntity with a success message or error messages if validation fails.
     * @throws UserNotFoundException if the specified user is not found.
     * @throws TournamentNotFoundException if the specified tournament is not found.
     * @throws InvalidStrikeException if the strike request is invalid.
     * @throws Exception if an unexpected error occurs during the strike issuance.
     */
    @PostMapping("/strikes")
    public ResponseEntity<?> strikeUser(@RequestBody Map<String, String> strikeRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminName = authentication.getName();

        String username = strikeRequest.get("username");
        String tournamentName = strikeRequest.get("tournamentName");
        String reportDetails = strikeRequest.get("reportDetails");

        if (username == null || tournamentName == null || reportDetails == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        try {
            adminService.strikeUser(adminName, username, tournamentName, reportDetails);
            return ResponseEntity.ok(Map.of("message", "Strike issued successfully"));
        } catch (UserNotFoundException | TournamentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (InvalidStrikeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during strike issuance: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while issuing the strike"));
        }
    }



}
