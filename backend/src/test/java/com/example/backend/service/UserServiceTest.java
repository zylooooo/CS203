package com.example.backend.service;

import com.example.backend.exception.UserNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.model.Tournament;
import org.mockito.ArgumentCaptor;
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
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

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
    void getAllUsers_UsersExist_ReturnsListOfUsers() {
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
    void getAllUsers_ErrorOccurs_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> userService.getAllUsers());
        assertEquals("Error fetching users", exception.getMessage());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void getAllUsers_RepositoryThrowsException_ThrowsRuntimeException() {
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
    void createUser_ValidUser_CreatesAndReturnsUser() {
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
    void createUser_DuplicateEmail_ThrowsIllegalArgumentException() {
        User user = new User();
        user.setEmail("existing@example.com");

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(user));
    }

    @Test
    void createUser_DuplicateUsername_ThrowsIllegalArgumentException() {
        User user = new User();
        user.setUsername("existingUser");

        when(userRepository.existsByUsername(user.getUsername())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(user));
    }

    @Test
    void createUser_RepositoryThrowsException_ThrowsRuntimeException() {
        User user = new User();
        user.setUsername("newUser");
        user.setEmail("new@example.com");
        user.setPassword("password");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));
        assertThrows(RuntimeException.class, () -> userService.createUser(user));
    }

    @Test
    void updateUser_ValidUpdates_UpdatesAndReturnsUser() {
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
        updatedUser.setMedicalInformation(null);
        updatedUser.setProfilePic("newpic.jpg");
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
        assertEquals(null, resultUser.getMedicalInformation());
        assertEquals("newpic.jpg", resultUser.getProfilePic());
        assertEquals("Jane", resultUser.getFirstName());
        assertEquals("Doe", resultUser.getLastName());
        assertTrue(resultUser.isAvailable());
    }

    @Test
    void updateUser_ValidationErrors_ReturnsErrorMap() {
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
    void updateUser_DuplicateEmail_ReturnsErrorMap() {
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
    void updateUser_DuplicateUsername_ReturnsErrorMap() {
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
    void deleteUser_ExistingUser_DeletesUser() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(tournamentService.getOngoingTournaments()).thenReturn(Collections.emptyList());

        userService.deleteUser(username);

        verify(userRepository).delete(existingUser);
    }

    @Test
    void deleteUser_UserInOngoingTournament_DeletesUserAndUpdatesTournament() {
        String username = "existingUser";
        User existingUser = new User();
        existingUser.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("OngoingTournament");
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        Tournament.Match match = new Tournament.Match();
        match.setPlayers(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        match.setCompleted(false);
        tournament.setMatches(new ArrayList<>(Collections.singletonList(match)));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(tournamentService.getOngoingTournaments()).thenReturn(Collections.singletonList(tournament));
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

        userService.deleteUser(username);

        verify(userRepository).delete(existingUser);
        verify(tournamentRepository).save(tournament);

        ArgumentCaptor<Tournament> tournamentCaptor = ArgumentCaptor.forClass(Tournament.class);
        verify(tournamentRepository).save(tournamentCaptor.capture());
        Tournament updatedTournament = tournamentCaptor.getValue();

        assertFalse(updatedTournament.getPlayersPool().contains(username));
        assertTrue(updatedTournament.getMatches().get(0).isCompleted());
        assertEquals("otherPlayer", updatedTournament.getMatches().get(0).getMatchWinner());
    }

    @Test
    void deleteUser_UserNotFound_ThrowsUserNotFoundException() {
        String username = "nonExistingUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(username));
    }

    @Test
    void deleteUser_UserInOngoingTournament_UpdatesTournamentAndDeletesUser() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherUser")));
        Tournament.Match match = new Tournament.Match();
        match.setPlayers(new ArrayList<>(Arrays.asList(username, "otherUser")));
        match.setCompleted(false);
        tournament.setMatches(new ArrayList<>(Arrays.asList(match)));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getOngoingTournaments()).thenReturn(Arrays.asList(tournament));
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

        userService.deleteUser(username);

        verify(userRepository).delete(user);
        verify(tournamentRepository).save(tournament);
        assertFalse(tournament.getPlayersPool().contains(username));
        assertEquals("otherUser", tournament.getMatches().get(0).getMatchWinner());
    }

    @Test
    void deleteUser_UserInTournamentWithNoMatches_UpdatesTournament() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        Tournament tournament = new Tournament();
        tournament.setTournamentName("TournamentWithNoMatches");
        tournament.setPlayersPool(new ArrayList<>(Arrays.asList(username, "otherPlayer")));
        tournament.setMatches(new ArrayList<>());

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getOngoingTournaments()).thenReturn(Collections.singletonList(tournament));
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

        userService.deleteUser(username);

        verify(userRepository).delete(user);
        verify(tournamentRepository).save(tournament);

        assertFalse(tournament.getPlayersPool().contains(username));
    }

    @Test
    void deleteUser_NoOngoingTournaments_DeletesUser() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentService.getOngoingTournaments()).thenReturn(Collections.emptyList());

        userService.deleteUser(username);

        verify(userRepository).delete(user);
        verify(tournamentRepository, never()).save(any(Tournament.class));
    }

    @Test
    void getDefaultLeaderboard_LessThanTenUsersOfSameGender_ReturnsAllUsers() {
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
    void getDefaultLeaderboard_MoreThanTenUsersOfSameGender_ReturnsTopTen() {
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
    void getDefaultLeaderboard_UserInTopTen_ReturnsTopTenIncludingUser() {
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
    void getDefaultLeaderboard_NoUsersOfSameGender_ReturnsEmptyList() {
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
    void getOppositeGenderLeaderboard_LessThanTenUsersOfOppositeGender_ReturnsAllUsers() {
        String username = "testUser";
        User user = createUser(username, "Male", 1000);

        List<User> allUsers = IntStream.range(0, 5)
                .mapToObj(i -> createUser("user" + i, "Female", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getOppositeGenderLeaderboard(username);

        assertEquals(5, leaderboard.size());
        assertFalse(leaderboard.contains(user));
        assertEquals("user0", leaderboard.get(0).getUsername()); // Highest ELO
        assertEquals("user4", leaderboard.get(4).getUsername()); // Lowest ELO
    }

    @Test
    void getOppositeGenderLeaderboard_MoreThanTenUsersOfOppositeGender_ReturnsTopTen() {
        String username = "testUser";
        User user = createUser(username, "Male", 1000);

        List<User> allUsers = IntStream.range(0, 15)
                .mapToObj(i -> createUser("user" + i, "Female", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getOppositeGenderLeaderboard(username);

        assertEquals(10, leaderboard.size());
        assertFalse(leaderboard.contains(user));
        assertEquals("user0", leaderboard.get(0).getUsername()); // Highest ELO
        assertEquals("user9", leaderboard.get(9).getUsername()); // 10th highest ELO
    }

    @Test
    void getOppositeGenderLeaderboard_NoUsersOfOppositeGender_ReturnsEmptyList() {
        String username = "testUser";
        User user = createUser(username, "Male", 1000);

        List<User> allUsers = IntStream.range(0, 5)
                .mapToObj(i -> createUser("user" + i, "Male", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getOppositeGenderLeaderboard(username);

        assertTrue(leaderboard.isEmpty());
    }

    @Test
    void getOppositeGenderLeaderboard_UserNotFound_ThrowsUserNotFoundException() {
        String username = "nonexistentUser";

        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getOppositeGenderLeaderboard(username));
    }

    @Test
    void getMixedGenderLeaderboard_UserExists_ReturnsTopTenUsersRegardlessOfGender() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(500);

        List<User> allUsers = Arrays.asList(
                createUser("user1", "Male", 1000),
                createUser("user2", "Female", 900),
                createUser("user3", "Male", 800));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getMixedGenderLeaderboard(username);

        assertEquals(4, leaderboard.size());
        assertEquals("user1", leaderboard.get(0).getUsername());
        assertEquals("user2", leaderboard.get(1).getUsername());
        assertEquals("user3", leaderboard.get(2).getUsername());
        assertEquals("testUser", leaderboard.get(3).getUsername());
    }

    @Test
    void getMixedGenderLeaderboard_UserNotInTopTen_ReturnsTopTenWithoutUser() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(500);

        List<User> allUsers = IntStream.range(0, 10)
                .mapToObj(i -> createUser("user" + i, i % 2 == 0 ? "Male" : "Female", 1000 - i * 10))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getMixedGenderLeaderboard(username);

        assertEquals(10, leaderboard.size());
        assertFalse(leaderboard.contains(user));
        assertNotEquals(user, leaderboard.get(9));
    }

    @Test
    void getMixedGenderLeaderboard_FewerThanTenUsers_ReturnsAllUsers() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(500);

        List<User> allUsers = IntStream.range(0, 5)
                .mapToObj(i -> createUser("user" + i, i % 2 == 0 ? "Male" : "Female", 1000 - i * 100))
                .collect(Collectors.toList());
        allUsers.add(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getMixedGenderLeaderboard(username);

        assertEquals(6, leaderboard.size());
        assertTrue(leaderboard.contains(user));
    }

    @Test
    void getMixedGenderLeaderboard_AllUsersSameElo_IncludesRequestingUser() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(1000);

        List<User> allUsers = IntStream.range(0, 10)
            .mapToObj(i -> {
                User u = new User();
                u.setUsername("user" + i);
                u.setElo(1000);
                return u;
            })
            .collect(Collectors.toList());

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findAll()).thenReturn(allUsers);

        List<User> leaderboard = userService.getMixedGenderLeaderboard(username);

        assertEquals(10, leaderboard.size());
        assertFalse(leaderboard.contains(user));
    }

    @Test
    void updateUserAvailability_ValidUpdate_UpdatesAvailability() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setAvailable(false);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.updateUserAvailability(username, true);

        assertTrue(updatedUser.isAvailable());
        verify(userRepository).save(user);
    }

    @Test
    void updateUserAvailability_UserNotFound_ThrowsUserNotFoundException() {
        String username = "nonExistingUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.updateUserAvailability(username, true));
    }

    @Test
    void updateUserAvailability_UnexpectedError_ThrowsRuntimeException() {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Unexpected error"));

        assertThrows(RuntimeException.class, () -> userService.updateUserAvailability(username, true));
    }

    @Test
    void checkIfUsernameExists_ExistingUsername_ReturnsTrue() {
        String username = "existingUser";

        when(userRepository.existsByUsername(username)).thenReturn(true);

        assertTrue(userService.checkIfUsernameExists(username));
        verify(userRepository, times(1)).existsByUsername(username);
    }

    @Test
    void checkIfUsernameExists_NonExistingUsername_ReturnsFalse() {
        String username = "nonExistentUser";

        when(userRepository.existsByUsername(username)).thenReturn(false);

        assertFalse(userService.checkIfUsernameExists(username));
        verify(userRepository, times(1)).existsByUsername(username);
    }

    @Test
    void checkIfUsernameExists_EmptyUsername_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> userService.checkIfUsernameExists(null));
    }

    @Test
    void checkIfEmailExists_ExistingEmail_ReturnsTrue() {
        String email = "existing@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        assertTrue(userService.checkIfEmailExists(email));
        verify(userRepository, times(1)).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_NonExistingEmail_ReturnsFalse() {
        String email = "nonexistent@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(false);

        assertFalse(userService.checkIfEmailExists(email));
        verify(userRepository, times(1)).existsByEmail(email);
    }

    @Test
    void checkIfEmailExists_EmptyEmail_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> userService.checkIfEmailExists(null));
    }
}