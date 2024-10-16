package com.example.backend.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.exception.AdminNotFoundException;
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
     * Retrieves the admin profile based on the admin name
     * @return the admin object associated with the authenticated admin
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
     * @param adminDetails the Admin object containing the updated admin details.
     * @return a ResponseEntity containing the updated admin details or error messages.
     */
    @PutMapping("/update")
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

    @DeleteMapping("/delete")
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
}
