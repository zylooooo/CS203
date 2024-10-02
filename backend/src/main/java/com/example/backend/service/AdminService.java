package com.example.backend.service;

import com.example.backend.model.Admin;
import com.example.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(String id) {
        return adminRepository.findById(id);
    }

    public Admin createAdmin(Admin admin) {
        if (adminRepository.findByEmail(admin.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        if (adminRepository.findByUserName(admin.getUserName()) != null) {
            throw new RuntimeException("Username already exists");
        }
        return adminRepository.save(admin);
    }

    public Admin updateAdmin(String id, Admin adminDetails) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        if (!admin.getEmail().equals(adminDetails.getEmail()) && adminRepository.findByEmail(adminDetails.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        if (!admin.getUserName().equals(adminDetails.getUserName()) && adminRepository.findByUserName(adminDetails.getUserName()) != null) {
            throw new RuntimeException("Username already exists");
        }

        admin.setEmail(adminDetails.getEmail());
        admin.setFirstName(adminDetails.getFirstName());
        admin.setLastName(adminDetails.getLastName());
        admin.setPassword(adminDetails.getPassword());
        admin.setCreatedTournaments(adminDetails.getCreatedTournaments());
        admin.setProfilePic(adminDetails.getProfilePic());
        admin.setUserName(adminDetails.getUserName());

        return adminRepository.save(admin);
    }

    public void deleteAdmin(String id) {
        adminRepository.deleteById(id);
    }
}