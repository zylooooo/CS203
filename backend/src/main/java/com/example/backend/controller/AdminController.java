// package com.example.backend.controller;

// import com.example.backend.model.Admin;
// import com.example.backend.service.AdminService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/admins")
// @RequiredArgsConstructor
// public class AdminController {

//     private final AdminService adminService;

//     @GetMapping
//     public ResponseEntity<List<Admin>> getAllAdmins() {
//         return ResponseEntity.ok(adminService.getAllAdmins());
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<Admin> getAdminById(@PathVariable String id) {
//         return adminService.getAdminById(id)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

//     @PostMapping
//     public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
//         try {
//             Admin createdAdmin = adminService.createAdmin(admin);
//             return ResponseEntity.ok(createdAdmin);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(null);
//         }
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<Admin> updateAdmin(@PathVariable String id, @RequestBody Admin adminDetails) {
//         try {
//             Admin updatedAdmin = adminService.updateAdmin(id, adminDetails);
//             return ResponseEntity.ok(updatedAdmin);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(null);
//         }
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> deleteAdmin(@PathVariable String id) {
//         adminService.deleteAdmin(id);
//         return ResponseEntity.ok().build();
//     }
// }

package com.example.backend.controller;

import com.example.backend.model.Admin;
import com.example.backend.model.LoginRequest;
import com.example.backend.service.AdminService;
import com.example.backend.service.EmailService;
import com.example.backend.service.OtpService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.Map;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/admins")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OtpService otpService;
    private final EmailService emailService;

    @PostMapping("/login")
    public CompletableFuture<ResponseEntity<Map<String, String>>> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        return adminService.authenticateAdmin(loginRequest.getUsername(), loginRequest.getPassword())
            .thenCompose(admin -> {
                if (admin != null) {
                    return otpService.generateOTP(admin.getUserName())
                        .thenCompose(otp -> emailService.sendOtpEmail(admin.getEmail(), otp))
                        .thenApply(emailSent -> {
                            if (emailSent) {
                                session.setAttribute("ADMIN_ID", admin.getId());
                                session.setAttribute("needOtpVerification", true);
                                return ResponseEntity.ok(Map.of("message", "OTP sent successfully", "redirect", "/otp/verify"));
                            } else {
                                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to send OTP"));
                            }
                        });
                } else {
                    return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials")));
                }
            })
            .exceptionally(e -> {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
            });
    }
}
