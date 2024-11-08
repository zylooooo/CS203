package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.Errors;
import org.springframework.validation.BeanPropertyBindingResult;

import com.example.backend.exception.AdminNotFoundException;
import com.example.backend.exception.InvalidStrikeException;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.model.User;
import com.example.backend.model.Admin;
import com.example.backend.model.Tournament;
import com.example.backend.model.Match;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.MatchRepository;
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private AdminRepository adminRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private TournamentRepository tournamentRepository;
    
    @Mock
    private LocalValidatorFactoryBean validator;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AdminService adminService;

    @Test
    void updateAdmin_WithValidNewDetails_ShouldUpdateSuccessfully() {
        // Arrange
        String adminName = "admin1";
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(adminName);
        existingAdmin.setEmail("old@email.com");
        existingAdmin.setPassword("oldPassword");
        
        Admin newDetails = new Admin();
        newDetails.setEmail("new@email.com");
        newDetails.setPassword("newPassword");
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(existingAdmin));
        when(adminRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(userRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(adminRepository.save(any(Admin.class))).thenReturn(existingAdmin);
        
        // Act
        Map<String, Object> result = adminService.updateAdmin(adminName, newDetails);
        
        // Assert
        assertNotNull(result.get("admin"));
        verify(adminRepository).save(any(Admin.class));
        verify(passwordEncoder).encode("newPassword");
    }

    @Test
    void updateAdmin_WithNonExistentAdmin_ShouldThrowAdminNotFoundException() {
        // Arrange
        String adminName = "nonexistent";
        Admin newDetails = new Admin();
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(AdminNotFoundException.class, () -> 
            adminService.updateAdmin(adminName, newDetails)
        );
    }

    @Test
    void updateAdmin_WithExistingEmail_ShouldReturnEmailError() {
        // Arrange
        String adminName = "admin1";
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(adminName);
        existingAdmin.setEmail("old@email.com");
        
        Admin newDetails = new Admin();
        newDetails.setEmail("existing@email.com");
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(existingAdmin));
        when(adminRepository.existsByEmail("existing@email.com")).thenReturn(true);
        
        // Act
        Map<String, Object> result = adminService.updateAdmin(adminName, newDetails);
        
        // Assert
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Email already exists!", errors.get("email"));
    }

    @Test
    void updateAdmin_WithExistingAdminName_ShouldReturnAdminNameError() {
        // Arrange
        String adminName = "admin1";
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(adminName);
        
        Admin newDetails = new Admin();
        newDetails.setAdminName("existingAdmin");
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(existingAdmin));
        when(adminRepository.existsByAdminName("existingAdmin")).thenReturn(true);
        
        // Act
        Map<String, Object> result = adminService.updateAdmin(adminName, newDetails);
        
        // Assert
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Admin name already exists!", errors.get("adminName"));
    }

    @Test
    void updateAdmin_WithAdminNameChange_ShouldUpdateTournaments() {
        // Arrange
        String oldAdminName = "oldAdmin";
        String newAdminName = "newAdmin";
        
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(oldAdminName);
        
        Admin newDetails = new Admin();
        newDetails.setAdminName(newAdminName);
        
        Tournament tournament = new Tournament();
        tournament.setCreatedBy(oldAdminName);
        List<Tournament> tournaments = Arrays.asList(tournament);
        
        when(adminRepository.findByAdminName(oldAdminName)).thenReturn(Optional.of(existingAdmin));
        when(adminRepository.existsByAdminName(newAdminName)).thenReturn(false);
        when(userRepository.existsByUsername(newAdminName)).thenReturn(false);
        when(tournamentRepository.findAllByCreatedBy(oldAdminName)).thenReturn(tournaments);
        when(adminRepository.save(any(Admin.class))).thenReturn(existingAdmin);
        
        // Act
        Map<String, Object> result = adminService.updateAdmin(oldAdminName, newDetails);
        
        // Assert
        assertNotNull(result.get("admin"));
        verify(tournamentRepository).findAllByCreatedBy(oldAdminName);
        verify(tournamentRepository).save(tournament);
        assertEquals(newAdminName, tournament.getCreatedBy());
    }

    @Test
    void updateAdmin_WithValidationErrors_ShouldReturnValidationErrors() {
        // Arrange
        String adminName = "admin1";
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(adminName);
        
        Admin newDetails = new Admin();
        Errors validationErrors = new BeanPropertyBindingResult(newDetails, "admin");
        validationErrors.rejectValue("email", "invalid", "Invalid email format");
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(existingAdmin));
        doAnswer(invocation -> {
            Errors errors = invocation.getArgument(1);
            errors.rejectValue("email", "invalid", "Invalid email format");
            return null;
        }).when(validator).validate(any(Admin.class), any(Errors.class));
        
        // Act
        Map<String, Object> result = adminService.updateAdmin(adminName, newDetails);
        
        // Assert
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Invalid email format", errors.get("email"));
    }

    @Test
    void updateAdmin_WithUnexpectedException_ShouldThrowRuntimeException() {
        // Arrange
        String adminName = "admin1";
        Admin existingAdmin = new Admin();
        existingAdmin.setAdminName(adminName);
        
        Admin newDetails = new Admin();
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(existingAdmin));
        when(adminRepository.save(any(Admin.class))).thenThrow(new RuntimeException("Database error"));
        
        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            adminService.updateAdmin(adminName, newDetails)
        );
    }

    @Test
    void strikeUser_WithValidData_ShouldAddStrike() throws UserNotFoundException, TournamentNotFoundException, InvalidStrikeException {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct during tournament";

        User user = new User();
        user.setUsername(username);
        user.setStrikeReports(new ArrayList<>());

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setEndDate(LocalDate.now().minusDays(1));
        tournament.setPlayersPool(Arrays.asList(username));
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        // Act
        adminService.strikeUser(adminName, username, tournamentName, reportDetails);
        
        // Assert
        assertEquals(1, user.getStrikeReports().size());
        assertEquals(reportDetails, user.getStrikeReports().get(0).getReportDetails());
        assertEquals(adminName, user.getStrikeReports().get(0).getIssuedBy());
        verify(userRepository).save(user);
    }

    @Test
    void strikeUser_WithNonexistentUser_ShouldThrowUserNotFoundException() {
        // Arrange
        String adminName = "admin1";
        String username = "nonexistentUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct";
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
    }

    @Test
    void strikeUser_WithNonexistentTournament_ShouldThrowTournamentNotFoundException() {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "nonexistentTournament";
        String reportDetails = "Misconduct";

        User user = new User();
        user.setUsername(username);
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(TournamentNotFoundException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
    }

    @Test
    void strikeUser_WithThreeExistingStrikes_ShouldThrowInvalidStrikeException() {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct";

        User user = new User();
        user.setUsername(username);
        List<User.StrikeReport> strikes = new ArrayList<>();
        strikes.add(new User.StrikeReport("Strike 1", LocalDateTime.now().minusDays(10), "admin1"));
        strikes.add(new User.StrikeReport("Strike 2", LocalDateTime.now().minusDays(5), "admin2"));
        strikes.add(new User.StrikeReport("Strike 3", LocalDateTime.now().minusDays(1), "admin3"));
        user.setStrikeReports(strikes);

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setEndDate(LocalDate.now().minusDays(1));
        tournament.setPlayersPool(Arrays.asList(username));
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        
        // Act & Assert
        assertThrows(InvalidStrikeException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
    }

    @Test
    void strikeUser_WithTooEarlyStrike_ShouldThrowInvalidStrikeException() {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct";

        User user = new User();
        user.setUsername(username);
        user.setStrikeReports(new ArrayList<>());

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setEndDate(LocalDate.now().minusDays(8)); // Tournament ended more than 7 days ago
        tournament.setPlayersPool(Arrays.asList(username));
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        
        // Act & Assert
        InvalidStrikeException exception = assertThrows(InvalidStrikeException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
        
        assertEquals("Strikes can only be issued after the tournament has ended, up to a week after.", exception.getMessage());
    }

    @Test
    void deleteAdmin_WithValidAdminName_ShouldDeleteSuccessfully() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        doNothing().when(adminRepository).delete(admin);
        
        // Act
        adminService.deleteAdmin(adminName);
        
        // Assert
        verify(adminRepository).findByAdminName(adminName);
        verify(adminRepository).delete(admin);
    }

    @Test
    void deleteAdmin_WithNonexistentAdmin_ShouldThrowAdminNotFoundException() {
        // Arrange
        String adminName = "nonexistentAdmin";
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.empty());
        
        // Act & Assert
        AdminNotFoundException exception = assertThrows(AdminNotFoundException.class, () -> 
            adminService.deleteAdmin(adminName)
        );
        
        assertEquals("Admin not found with name: " + adminName, exception.getMessage());
        verify(adminRepository).findByAdminName(adminName);
        verify(adminRepository, never()).delete(any());
    }

    @Test
    void deleteAdmin_WithDatabaseError_ShouldThrowRuntimeException() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        doThrow(new RuntimeException("Database error")).when(adminRepository).delete(admin);
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            adminService.deleteAdmin(adminName)
        );
        
        assertEquals("Database error", exception.getMessage());
        verify(adminRepository).findByAdminName(adminName);
    }

    @Test
    void deleteAdmin_WithNullAdminName_ShouldThrowIllegalArgumentException() {
        // Arrange
        String adminName = null;
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            adminService.deleteAdmin(adminName)
        );
        
        assertEquals("Admin name cannot be null", exception.getMessage());
        verify(adminRepository, never()).findByAdminName(any());
        verify(adminRepository, never()).delete(any());
    }

    @Test
    void getAdminByAdminName_WithValidName_ShouldReturnAdmin() throws AdminNotFoundException {
        // Arrange
        String adminName = "testAdmin";
        Admin expectedAdmin = new Admin();
        expectedAdmin.setAdminName(adminName);
        
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(expectedAdmin));
        
        // Act
        Admin result = adminService.getAdminByAdminName(adminName);
        
        // Assert
        assertNotNull(result);
        assertEquals(adminName, result.getAdminName());
        verify(adminRepository).findByAdminName(adminName);
    }

    @Test
    void getAdminByAdminName_WithNonexistentName_ShouldThrowException() {
        // Arrange
        String adminName = "nonexistent";
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.empty());
        
        // Act & Assert
        AdminNotFoundException exception = assertThrows(AdminNotFoundException.class, () -> 
            adminService.getAdminByAdminName(adminName)
        );
        
        assertEquals("Admin not found with name: " + adminName, exception.getMessage());
        verify(adminRepository).findByAdminName(adminName);
    }

    @Test
    void checkIfAdminNameExists_WithValidName_ShouldReturnTrue() {
        // Arrange
        String adminName = "existingAdmin";
        when(adminRepository.existsByAdminName(adminName)).thenReturn(true);
        
        // Act
        boolean result = adminService.checkIfAdminNameExists(adminName);
        
        // Assert
        assertTrue(result);
        verify(adminRepository).existsByAdminName(adminName);
    }

    @Test
    void checkIfAdminNameExists_WithNonexistentName_ShouldReturnFalse() {
        // Arrange
        String adminName = "nonexistentAdmin";
        when(adminRepository.existsByAdminName(adminName)).thenReturn(false);
        
        // Act
        boolean result = adminService.checkIfAdminNameExists(adminName);
        
        // Assert
        assertFalse(result);
        verify(adminRepository).existsByAdminName(adminName);
    }

    @Test
    void checkIfAdminNameExists_WithNullName_ShouldThrowException() {
        // Arrange
        String adminName = null;
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            adminService.checkIfAdminNameExists(adminName)
        );
        
        assertEquals("Admin name must be provided!", exception.getMessage());
        verify(adminRepository, never()).existsByAdminName(any());
    }

    @Test
    void checkIfAdminNameExists_WithEmptyName_ShouldThrowException() {
        // Arrange
        String adminName = "";
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            adminService.checkIfAdminNameExists(adminName)
        );
        
        assertEquals("Admin name must be provided!", exception.getMessage());
        verify(adminRepository, never()).existsByAdminName(any());
    }

    @Test
    void checkIfEmailExists_WithValidEmail_ShouldReturnTrue() {
        // Arrange
        String email = "existing@email.com";
        when(adminRepository.existsByEmail(email)).thenReturn(true);
        
        // Act
        boolean result = adminService.checkIfEmailExists(email);
        
        // Assert
        assertTrue(result);
        verify(adminRepository).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_WithNonexistentEmail_ShouldReturnFalse() {
        // Arrange
        String email = "nonexistent@email.com";
        when(adminRepository.existsByEmail(email)).thenReturn(false);
        
        // Act
        boolean result = adminService.checkIfEmailExists(email);
        
        // Assert
        assertFalse(result);
        verify(adminRepository).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_WithNullEmail_ShouldThrowException() {
        // Arrange
        String email = null;
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            adminService.checkIfEmailExists(email)
        );
        
        assertEquals("Email must be provided!", exception.getMessage());
        verify(adminRepository, never()).existsByEmail(any());
    }

    @Test
    void checkIfEmailExists_WithEmptyEmail_ShouldThrowException() {
        // Arrange
        String email = "";
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            adminService.checkIfEmailExists(email)
        );
        
        assertEquals("Email must be provided!", exception.getMessage());
        verify(adminRepository, never()).existsByEmail(any());
    }

    @Test
    void strikeUser_WithRecentStrikeFromSameAdmin_ShouldThrowInvalidStrikeException() {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct";

        User user = new User();
        user.setUsername(username);
        List<User.StrikeReport> strikes = new ArrayList<>();
        strikes.add(new User.StrikeReport("Previous strike", LocalDateTime.now().minusDays(3), adminName));
        user.setStrikeReports(strikes);

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setEndDate(LocalDate.now().minusDays(1));
        tournament.setPlayersPool(Arrays.asList(username));
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        
        // Act & Assert
        InvalidStrikeException exception = assertThrows(InvalidStrikeException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
        
        assertEquals("Admin cannot issue a strike more than once a week on the same user.", exception.getMessage());
    }

    @Test
    void strikeUser_WithUserNotInTournament_ShouldThrowUserNotFoundException() {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Misconduct";

        User user = new User();
        user.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(new ArrayList<>()); // Empty players pool
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        
        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> 
            adminService.strikeUser(adminName, username, tournamentName, reportDetails)
        );
    }

    @Test
    void strikeUser_WithOneExistingStrike_ShouldAddSecondStrike() throws UserNotFoundException, TournamentNotFoundException, InvalidStrikeException {
        // Arrange
        String adminName = "admin1";
        String username = "testUser";
        String tournamentName = "testTournament";
        String reportDetails = "Second misconduct";

        User user = new User();
        user.setUsername(username);
        List<User.StrikeReport> strikes = new ArrayList<>();
        strikes.add(new User.StrikeReport("First strike", LocalDateTime.now().minusDays(10), "admin2")); // Different admin
        user.setStrikeReports(strikes);

        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setEndDate(LocalDate.now().minusDays(1));
        tournament.setPlayersPool(Arrays.asList(username));
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        // Act
        adminService.strikeUser(adminName, username, tournamentName, reportDetails);
        
        // Assert
        assertEquals(2, user.getStrikeReports().size());
        assertEquals(reportDetails, user.getStrikeReports().get(1).getReportDetails());
        assertEquals(adminName, user.getStrikeReports().get(1).getIssuedBy());
        verify(userRepository).save(user);
    }

    @Test
    void deleteAdmin_WithActiveTournaments_ShouldDeleteAllAssociatedData() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);

        Tournament tournament1 = new Tournament();
        tournament1.setTournamentName("Tournament1");
        tournament1.setEndDate(null);  // Active tournament

        Tournament tournament2 = new Tournament();
        tournament2.setTournamentName("Tournament2");
        tournament2.setEndDate(LocalDate.now());  // Completed tournament

        List<Tournament> adminTournaments = Arrays.asList(tournament1, tournament2);
        
        Match match1 = new Match();
        match1.setTournamentName("Tournament1");
        List<Match> tournamentMatches = Arrays.asList(match1);

        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        when(tournamentRepository.findAllByCreatedBy(adminName)).thenReturn(adminTournaments);
        when(matchRepository.findByTournamentName("Tournament1")).thenReturn(Optional.of(tournamentMatches));

        // Act
        adminService.deleteAdmin(adminName);

        // Assert
        verify(matchRepository).deleteAll(tournamentMatches);
        verify(tournamentRepository).deleteAll(Arrays.asList(tournament1));  // Only active tournament
        verify(adminRepository).delete(admin);
    }

    @Test
    void deleteAdmin_WithNoTournaments_ShouldOnlyDeleteAdmin() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);

        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        when(tournamentRepository.findAllByCreatedBy(adminName)).thenReturn(Collections.emptyList());

        // Act
        adminService.deleteAdmin(adminName);

        // Assert
        verify(matchRepository, never()).deleteAll(anyList());
        verify(tournamentRepository, never()).deleteAll(anyList());
        verify(adminRepository).delete(admin);
    }

    @Test
    void deleteAdmin_WithTournamentsButNoMatches_ShouldDeleteTournamentsAndAdmin() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("Tournament1");
        tournament.setEndDate(null);
        List<Tournament> adminTournaments = Arrays.asList(tournament);

        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        when(tournamentRepository.findAllByCreatedBy(adminName)).thenReturn(adminTournaments);
        when(matchRepository.findByTournamentName("Tournament1")).thenReturn(Optional.empty());

        // Act
        adminService.deleteAdmin(adminName);

        // Assert
        verify(matchRepository, never()).deleteAll(anyList());
        verify(tournamentRepository).deleteAll(adminTournaments);
        verify(adminRepository).delete(admin);
    }

    @Test
    void deleteAdmin_WithMatchDeletionError_ShouldPropagateException() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("Tournament1");
        tournament.setEndDate(null);
        List<Tournament> adminTournaments = Arrays.asList(tournament);

        Match match = new Match();
        match.setTournamentName("Tournament1");
        List<Match> tournamentMatches = Arrays.asList(match);

        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        when(tournamentRepository.findAllByCreatedBy(adminName)).thenReturn(adminTournaments);
        when(matchRepository.findByTournamentName("Tournament1")).thenReturn(Optional.of(tournamentMatches));
        doThrow(new RuntimeException("Match deletion error")).when(matchRepository).deleteAll(anyList());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            adminService.deleteAdmin(adminName)
        );
        assertEquals("Match deletion error", exception.getMessage());
    }

    @Test
    void deleteAdmin_WithTournamentDeletionError_ShouldPropagateException() {
        // Arrange
        String adminName = "admin1";
        Admin admin = new Admin();
        admin.setAdminName(adminName);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("Tournament1");
        tournament.setEndDate(null);
        List<Tournament> adminTournaments = Arrays.asList(tournament);

        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));
        when(tournamentRepository.findAllByCreatedBy(adminName)).thenReturn(adminTournaments);
        when(matchRepository.findByTournamentName("Tournament1")).thenReturn(Optional.empty());
        doThrow(new RuntimeException("Tournament deletion error")).when(tournamentRepository).deleteAll(anyList());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            adminService.deleteAdmin(adminName)
        );
        assertEquals("Tournament deletion error", exception.getMessage());
    }



    
    

    

}
