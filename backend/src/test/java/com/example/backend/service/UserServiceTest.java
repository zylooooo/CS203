package com.example.backend.service;

import com.example.backend.exception.UserNotFoundException;
import com.example.backend.model.User;
import com.example.backend.model.Match;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.model.Tournament;
import org.springframework.validation.Errors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchRepository matchRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private LocalValidatorFactoryBean validator;

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private TournamentService tournamentService;

    @InjectMocks
    private UserService userService;

    @Mock
    private AdminRepository adminRepository;

    @BeforeEach
    void setUp() {
        reset(userRepository);
    }

    private User createUser(String username, String gender, int elo) {
        User user = new User();
        user.setUsername(username);
        user.setGender(gender);
        user.setElo(elo);
        return user;
    }

    @Test
    void getAllUsers_DatabaseHasUsers_ReturnsUsersList() {
        // Arrange
        User user1 = new User();
        user1.setUsername("user1");
        User user2 = new User();
        user2.setUsername("user2");
        List<User> expectedUsers = Arrays.asList(user1, user2);

        when(userRepository.findAll()).thenReturn(expectedUsers);

        // Act
        List<User> actualUsers = userService.getAllUsers();

        // Assert
        assertEquals(expectedUsers, actualUsers);
        assertEquals(2, actualUsers.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getAllUsers_DatabaseError_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> userService.getAllUsers());
        assertEquals("Error fetching users", exception.getMessage());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getAllUsers_RepositoryError_ThrowsRuntimeException() {
        when(userRepository.findAll()).thenThrow(new RuntimeException("Database error"));
        assertThrows(RuntimeException.class, () -> userService.getAllUsers());
    }

    @Test
    void getUserByUsername_UserExists_ReturnsUser() {
        String username = "testUser";
        User expectedUser = new User();
        expectedUser.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(expectedUser));

        User actualUser = userService.getUserByUsername(username);

        assertEquals(expectedUser, actualUser);
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void getUserByUsername_UserDoesNotExist_ThrowsUserNotFoundException() {
        String username = "nonExistentUser";

        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserByUsername(username));
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void createUser_ValidUserDetails_CreatesAndReturnsUser() {
        User user = new User();
        user.setUsername("newUser");
        user.setEmail("new@example.com");
        user.setPassword("password");

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(user.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(user.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User createdUser = userService.createUser(user);

        assertNotNull(createdUser);
        assertEquals("encodedPassword", createdUser.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void createUser_EmailAlreadyExists_ThrowsIllegalArgumentException() {
        User user = new User();
        user.setEmail("existing@example.com");

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(user));
    }

    @Test
    void createUser_UsernameAlreadyExists_ThrowsIllegalArgumentException() {
        User user = new User();
        user.setUsername("existingUser");

        when(userRepository.existsByUsername(user.getUsername())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(user));
    }

    @Test
    void createUser_DatabaseError_ThrowsRuntimeException() {
        User user = new User();
        user.setUsername("newUser");
        user.setEmail("new@example.com");
        user.setPassword("password");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));
        assertThrows(RuntimeException.class, () -> userService.createUser(user));
    }

    @Test
    void updateUser_ValidUserDetails_UpdatesAndReturnsUser() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);
        existingUser.setEmail("old@example.com");
        existingUser.setPassword("oldPassword");

        User updatedUser = new User();
        updatedUser.setUsername(username);
        updatedUser.setEmail("new@example.com");
        updatedUser.setPassword("newPassword");
        updatedUser.setPhoneNumber("1234567890");
        updatedUser.setElo(1500);
        updatedUser.setGender("Female");
        updatedUser.setDateOfBirth(LocalDate.of(1990, 1, 1));
        updatedUser.setFirstName("Jane");
        updatedUser.setLastName("Doe");
        updatedUser.setAvailable(true);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");

        Map<String, Object> result = userService.updateUser(username, updatedUser);

        assertNotNull(result.get("user"));
        User resultUser = (User) result.get("user");

        // Verify that the password was encoded
        verify(passwordEncoder).encode("newPassword");

        // Check if the password was actually updated
        assertEquals("encodedPassword", resultUser.getPassword());

        // Other assertions
        assertEquals("new@example.com", resultUser.getEmail());
        assertEquals("1234567890", resultUser.getPhoneNumber());
        assertEquals(1500, resultUser.getElo());
        assertEquals("Female", resultUser.getGender());
        assertEquals(LocalDate.of(1990, 1, 1), resultUser.getDateOfBirth());
        assertEquals("Jane", resultUser.getFirstName());
        assertEquals("Doe", resultUser.getLastName());
        assertTrue(resultUser.isAvailable());
    }

    @Test
    void updateUser_ValidationFails_ReturnsErrorMap() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);
        existingUser.setEmail("old@example.com");

        User updatedUser = new User();
        updatedUser.setEmail("invalid-email");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));

        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            Errors errors = invocation.getArgument(1);
            if ("invalid-email".equals(user.getEmail())) {
                errors.rejectValue("email", "invalid", "Invalid email format");
            }
            return null;
        }).when(validator).validate(any(User.class), any(Errors.class));

        Map<String, Object> result = userService.updateUser(username, updatedUser);

        assertNotNull(result.get("errors"));
        @SuppressWarnings("unchecked")
        Map<String, String> errors = result.containsKey("errors") ? (Map<String, String>) result.get("errors")
                : Collections.emptyMap();
        assertTrue(errors.containsKey("email"));
        assertEquals("Invalid email format", errors.get("email"));
    }

    @Test
    void updateUser_EmailAlreadyExists_ReturnsErrorMap() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);
        existingUser.setEmail("old@example.com");

        User updatedUser = new User();
        updatedUser.setEmail("new@example.com");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

        Map<String, Object> result = userService.updateUser(username, updatedUser);

        assertNotNull(result.get("errors"));
        @SuppressWarnings("unchecked")
        Map<String, String> errors = result.containsKey("errors") ? (Map<String, String>) result.get("errors")
                : Collections.emptyMap();
        assertTrue(errors.containsKey("email"));
        assertEquals("Email already exists!", errors.get("email"));
    }

    @Test
    void updateUser_UsernameAlreadyExists_ReturnsErrorMap() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);

        User updatedUser = new User();
        updatedUser.setUsername("newUsername");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByUsername("newUsername")).thenReturn(true);

        Map<String, Object> result = userService.updateUser(username, updatedUser);

        assertNotNull(result.get("errors"));
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertTrue(errors.containsKey("username"));
        assertEquals("Username already exists!", errors.get("username"));
    }

    @Test
    void deleteUser_ValidUser_DeletesUserSuccessfully() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(tournamentService.getCurrentAndFutureTournaments()).thenReturn(Collections.emptyList());

        userService.deleteUser(username);

        verify(userRepository).delete(existingUser);
    }

    @Test
    void deleteUser_UserNotFound_ThrowsUserNotFoundException() {
        String username = "nonExistingUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(username));
    }

    @Test
    void deleteUser_NoOngoingTournaments_DeletesUserSuccessfully() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getCurrentAndFutureTournaments()).thenReturn(Collections.emptyList());

        userService.deleteUser(username);

        verify(userRepository).delete(user);
        verify(tournamentRepository, never()).save(any(Tournament.class));
    }

    @Test
    void getDefaultLeaderboard_LessThanTenSameGenderUsers_ReturnsAllUsers() {
        String username = "testUser";
        User user = createUser(username, "Male", 950);

        List<User> allUsers = IntStream.range(0, 5)
                .mapToObj(i -> createUser("user" + i, "Male", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getDefaultLeaderboard(username);

        assertEquals(6, leaderboard.size());
        assertTrue(leaderboard.contains(user));
    }

    @Test
    void getDefaultLeaderboard_MoreThanTenSameGenderUsers_ReturnsTopTenUsers() {
        String username = "testUser";
        User user = createUser(username, "Male", 900);

        List<User> allUsers = IntStream.range(0, 15)
                .mapToObj(i -> createUser("user" + i, "Male", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getDefaultLeaderboard(username);

        assertEquals(10, leaderboard.size());
        assertFalse(leaderboard.contains(user)); // User's ELO is too low to be in top 10
    }

    @Test
    void getDefaultLeaderboard_UserInTopTen_ReturnsTopTenWithUser() {
        String username = "testUser";
        User user = createUser(username, "Male", 980);

        List<User> allUsers = IntStream.range(0, 15)
                .mapToObj(i -> createUser("user" + i, "Male", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getDefaultLeaderboard(username);

        assertEquals(10, leaderboard.size());
        assertTrue(leaderboard.contains(user));
    }

    @Test
    void getDefaultLeaderboard_NoSameGenderUsers_ReturnsEmptyList() {
        String username = "testUser";
        User user = createUser(username, "Male", 1000);

        List<User> allUsers = IntStream.range(0, 5)
                .mapToObj(i -> createUser("user" + i, "Female", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getDefaultLeaderboard(username);

        assertEquals(1, leaderboard.size());
        assertTrue(leaderboard.contains(user));
    }

    @Test
    void checkIfUsernameExists_UsernameExists_ReturnsTrue() {
        String username = "existingUser";

        when(userRepository.existsByUsername(username)).thenReturn(true);

        assertTrue(userService.checkIfUsernameExists(username));
        verify(userRepository, times(1)).existsByUsername(username);
    }

    @Test
    void checkIfUsernameExists_UsernameDoesNotExist_ReturnsFalse() {
        String username = "nonExistentUser";

        when(userRepository.existsByUsername(username)).thenReturn(false);

        assertFalse(userService.checkIfUsernameExists(username));
        verify(userRepository, times(1)).existsByUsername(username);
    }

    @Test
    void checkIfUsernameExists_NullUsername_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> userService.checkIfUsernameExists(null));
    }

    @Test
    void checkIfEmailExists_EmailExists_ReturnsTrue() {
        String email = "existing@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        assertTrue(userService.checkIfEmailExists(email));
        verify(userRepository, times(1)).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_EmailDoesNotExist_ReturnsFalse() {
        String email = "nonexistent@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(false);

        assertFalse(userService.checkIfEmailExists(email));
        verify(userRepository, times(1)).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_NullEmail_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> userService.checkIfEmailExists(null));
    }

    @Test
    void hasExceededStrikeLimit_UserNotFound_ThrowsUserNotFoundException() {
        String username = "nonExistentUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        
        assertThrows(UserNotFoundException.class, () -> userService.hasExceededStrikeLimit(username));
    }

    @Test
    void hasExceededStrikeLimit_NoStrikes_ReturnsFalse() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setStrikeReports(new ArrayList<>());
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        
        assertFalse(userService.hasExceededStrikeLimit(username));
    }

    @Test
    void deleteUser_UserInOngoingTournaments_UpdatesTournaments() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("testTournament");
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherPlayer")));

        Match match = new Match();
        match.setTournamentName("testTournament");
        match.setPlayers(new ArrayList<>());
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getCurrentAndFutureTournaments())
            .thenReturn(Collections.singletonList(tournament));
        when(matchRepository.findByTournamentName("testTournament"))
            .thenReturn(Optional.of(Collections.singletonList(match)));

        userService.deleteUser(username);

        verify(tournamentRepository).save(tournament);
        assertFalse(tournament.getPlayersPool().contains(username));
    }

    @Test
    void deleteUser_UserHasMatches_UpdatesMatches() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("testTournament");
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        
        Match match = new Match();
        match.setTournamentName("testTournament");
        match.setPlayers(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        match.setCompleted(false);
        match.setSets(new ArrayList<>());

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getCurrentAndFutureTournaments())
            .thenReturn(Collections.singletonList(tournament));
        when(matchRepository.findByTournamentName("testTournament"))
            .thenReturn(Optional.of(Collections.singletonList(match)));

        userService.deleteUser(username);

        verify(matchRepository).save(match);
        assertFalse(match.getPlayers().contains(username));
    }

    @Test
    void deleteUser_DatabaseError_ThrowsRuntimeException() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getCurrentAndFutureTournaments()).thenReturn(Collections.emptyList());
        doThrow(new RuntimeException("Database error")).when(userRepository).delete(user);

        assertThrows(RuntimeException.class, () -> userService.deleteUser(username));
    }

    @Test
    void createUser_WithStrikeReports_CreatesUserWithStrikeHistory() {
        User user = new User();
        user.setUsername("newUser");
        user.setEmail("new@example.com");
        user.setPassword("password");
        
        User.StrikeReport strikeReport = new User.StrikeReport();
        strikeReport.setReportDetails("Test report");
        strikeReport.setDateCreated(LocalDateTime.now());
        strikeReport.setIssuedBy("admin");
        
        user.setStrikeReports(Collections.singletonList(strikeReport));

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(user.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(user.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User createdUser = userService.createUser(user);

        assertNotNull(createdUser.getStrikeReports());
        assertEquals(1, createdUser.getStrikeReports().size());
        assertEquals("Test report", createdUser.getStrikeReports().get(0).getReportDetails());
    }

    @Test
    void updateUser_WithStrikeReports_UpdatesStrikeHistory() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);
        existingUser.setStrikeReports(new ArrayList<>());
        
        User updatedUser = new User();
        updatedUser.setUsername(username);
        List<User.StrikeReport> strikeReports = new ArrayList<>();
        User.StrikeReport newStrike = new User.StrikeReport();
        newStrike.setReportDetails("New violation");
        newStrike.setDateCreated(LocalDateTime.now());
        newStrike.setIssuedBy("admin");
        strikeReports.add(newStrike);
        updatedUser.setStrikeReports(strikeReports);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        Map<String, Object> result = userService.updateUser(username, updatedUser);
        User resultUser = (User) result.get("user");

        assertNotNull(resultUser.getStrikeReports());
        assertEquals(1, resultUser.getStrikeReports().size());
        assertEquals("New violation", resultUser.getStrikeReports().get(0).getReportDetails());
    }

    @Test
    void leaveTournament_DatabaseError_ThrowsRuntimeException() {
        String username = "testUser";
        String tournamentName = "testTournament";
        
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        
        when(tournamentService.getTournamentByName(tournamentName)).thenReturn(tournament);
        
        when(tournamentRepository.save(any(Tournament.class)))
            .thenThrow(new RuntimeException("Database error"));
        
        assertThrows(RuntimeException.class, 
            () -> userService.leaveTournament(tournamentName, username));
    }

    @Test
    void updateUser_NullUsername_ThrowsUserNotFoundException() {
        User updatedUser = new User();
        updatedUser.setUsername("testUser");
        
        assertThrows(UserNotFoundException.class, () -> {
            userService.updateUser(null, updatedUser);
        });
    }

    @Test
    void updateUser_NullUserDetails_ThrowsUserNotFoundException() {
        String username = "testUser";
        
        assertThrows(UserNotFoundException.class, () -> {
            userService.updateUser(username, null);
        });
    }

    @Test
    void updateUser_DatabaseError_ThrowsRuntimeException() {
        String username = "testUser";
        User existingUser = new User();
        existingUser.setUsername(username);
        User updatedUser = new User();
        updatedUser.setUsername(username);
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));
        
        assertThrows(RuntimeException.class, 
            () -> userService.updateUser(username, updatedUser));
    }
}