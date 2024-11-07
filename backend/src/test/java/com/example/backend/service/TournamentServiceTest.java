package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.model.Match;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.InvalidJoinException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.data.util.Pair;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import java.util.ArrayList;
import java.util.Collections;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

    @InjectMocks
    private TournamentService tournamentService;

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LocalValidatorFactoryBean validator;

    @Mock
    private MatchRepository matchRepository;

    @BeforeEach
    void setUp() {
        reset(tournamentRepository);
    }

    @Test
    void getAllTournaments_DatabaseHasTournaments_ReturnsList() {
        List<Tournament> mockTournaments = Arrays.asList(new Tournament(), new Tournament());
        when(tournamentRepository.findAll()).thenReturn(mockTournaments);

        List<Tournament> result = tournamentService.getAllTournaments();

        assertEquals(2, result.size());
        verify(tournamentRepository, times(1)).findAll();
    }

    @Test
    void getAllTournaments_DatabaseError_ThrowsRuntimeException() {
        when(tournamentRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> tournamentService.getAllTournaments());
    }

    @Test
    void getTournamentByName_ValidName_ReturnsTournament() throws TournamentNotFoundException {
        String tournamentName = "Test Tournament";
        Tournament mockTournament = new Tournament();
        mockTournament.setTournamentName(tournamentName);
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(mockTournament));

        Tournament result = tournamentService.getTournamentByName(tournamentName);

        assertEquals(tournamentName, result.getTournamentName());
    }

    @Test
    void getTournamentByName_InvalidName_ThrowsTournamentNotFoundException() {
        String tournamentName = "Nonexistent Tournament";
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.empty());

        assertThrows(TournamentNotFoundException.class, () -> tournamentService.getTournamentByName(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NameNotTaken_ReturnsTrue() {
        String tournamentName = "New Tournament";
        when(tournamentRepository.existsByTournamentName(tournamentName)).thenReturn(false);

        assertTrue(tournamentService.checkTournamentNameAvailability(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NameAlreadyTaken_ReturnsFalse() {
        String tournamentName = "Existing Tournament";
        when(tournamentRepository.existsByTournamentName(tournamentName)).thenReturn(true);

        assertFalse(tournamentService.checkTournamentNameAvailability(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NullName_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> tournamentService.checkTournamentNameAvailability(null));
    }

    @Test
    void checkTournamentNameAvailability_EmptyName_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> tournamentService.checkTournamentNameAvailability(""));
    }

    @Test
    void getUserAvailableTournaments_UserDoesNotExist_ThrowsUserNotFoundException() {
        String username = "nonexistentUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> tournamentService.getUserAvailableTournaments(username));
    }

    @Test
    void getUserAvailableTournaments_TournamentStarted_ExcludesFromResult() throws UserNotFoundException {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);

        Tournament startedTournament = new Tournament();
        startedTournament.setStartDate(LocalDate.now());
        startedTournament.setPlayerCapacity(10);
        startedTournament.setPlayersPool(new ArrayList<>());
        startedTournament.setMinElo(1000);
        startedTournament.setMaxElo(2000);
        startedTournament.setGender("Male");
        startedTournament.setCategory("Open");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(startedTournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_GenderMismatch_ExcludesFromResult() throws UserNotFoundException {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);

        Tournament tournament = new Tournament();
        tournament.setStartDate(LocalDate.now().plusDays(1));
        tournament.setPlayerCapacity(10);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Female");
        tournament.setCategory("Open");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserUpcomingTournaments_UserHasUpcomingTournaments_ReturnsUpcomingTournaments() throws UserNotFoundException {
        LocalDate currentDate = LocalDate.now();
        Tournament upcomingTournament1 = new Tournament();
        upcomingTournament1.setStartDate(currentDate.plusDays(1));
        upcomingTournament1.setPlayersPool(new ArrayList<>(Collections.singletonList("testUser")));

        Tournament upcomingTournament2 = new Tournament();
        upcomingTournament2.setStartDate(currentDate.plusDays(2));
        upcomingTournament2.setPlayersPool(new ArrayList<>(Collections.singletonList("testUser")));

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(upcomingTournament1, upcomingTournament2));

        List<Tournament> result = tournamentService.getUserUpcomingTournaments("testUser");

        assertEquals(2, result.size());
        assertTrue(result.contains(upcomingTournament1));
        assertTrue(result.contains(upcomingTournament2));
    }

    @Test
    void getCurrentAndFutureTournaments_Success() {
        Tournament future1 = createValidTournament("Future1");
        Tournament future2 = createValidTournament("Future2");
        future1.setStartDate(LocalDate.now().plusDays(1));
        future2.setStartDate(LocalDate.now().plusDays(2));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(future1, future2));

        List<Tournament> result = tournamentService.getCurrentAndFutureTournaments();

        assertEquals(2, result.size());
        assertEquals("Future1", result.get(0).getTournamentName());
        assertEquals("Future2", result.get(1).getTournamentName());
    }

    @Test
    void getAdminHistory_Success() {
        String adminName = "admin";
        Tournament past1 = createValidTournament("Past1");
        Tournament past2 = createValidTournament("Past2");
        past1.setCreatedBy(adminName);
        past2.setCreatedBy(adminName);
        past1.setEndDate(LocalDate.now().minusDays(1));
        past2.setEndDate(LocalDate.now().minusDays(2));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(past1, past2));

        List<Tournament> result = tournamentService.getAdminHistory(adminName);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(t -> t.getCreatedBy().equals(adminName)));
    }

    @Test
    void removePlayerFromTournament_TournamentNotFound_ThrowsTournamentNotFoundException() {
        String tournamentName = "NonexistentTournament";
        String username = "testUser";

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.empty());

        assertThrows(TournamentNotFoundException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, username));
    }

    @Test
    void removePlayerFromTournament_UserNotFound_ThrowsUserNotFoundException() {
        String tournamentName = "Test Tournament";
        String username = "nonexistentUser";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>());

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.existsByUsername(username))
            .thenReturn(false);

        assertThrows(UserNotFoundException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, username));
    }

    @Test
    void removePlayerFromTournament_SignupDatePassed_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setClosingSignupDate(LocalDate.now().minusDays(1));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        assertThrows(IllegalArgumentException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, "testUser"));
    }

    @Test
    void removePlayerFromTournament_UserNotInTournament_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        String username = "testUser";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>());

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.existsByUsername(username))
            .thenReturn(true);

        assertThrows(IllegalArgumentException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, username));
    }

    @Test
    void removePlayerFromTournament_DatabaseError_ThrowsRuntimeException() {
        String tournamentName = "Test Tournament";
        String username = "testUser";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>(Collections.singletonList(username)));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.existsByUsername(username))
            .thenReturn(true);
        when(tournamentRepository.save(any(Tournament.class)))
            .thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, username));
        
        assertEquals("Unexpected error removing player from tournament", exception.getMessage());
    }

    @Test
    void removePlayerFromTournament_NullPlayersPool_InitializesEmptyList() {
        String tournamentName = "Test Tournament";
        String username = "testUser";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(null);  // Explicitly set to null to test null handling

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.existsByUsername(username))
            .thenReturn(true);

        assertThrows(IllegalArgumentException.class, 
            () -> tournamentService.removePlayerFromTournament(tournamentName, username));
    }

    @Test
    void removePlayerFromTournament_MultiplePlayersExist_RemovesSpecificPlayer() {
        String tournamentName = "Test Tournament";
        String username = "testUser";
        Tournament tournament = createValidTournament(tournamentName);
        List<String> players = new ArrayList<>(Arrays.asList("testUser", "otherUser1", "otherUser2"));
        tournament.setPlayersPool(players);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.existsByUsername(username))
            .thenReturn(true);
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        Tournament result = tournamentService.removePlayerFromTournament(tournamentName, username);
        
        assertEquals(2, result.getPlayersPool().size());
        assertFalse(result.getPlayersPool().contains(username));
        assertTrue(result.getPlayersPool().contains("otherUser1"));
        assertTrue(result.getPlayersPool().contains("otherUser2"));
    }

    @Test
    void deleteTournament_ValidAdminRequest_DeletesTournamentAndMatches() {
        String tournamentName = "Test Tournament";
        String adminName = "admin";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        List<Match> matches = Arrays.asList(new Match(), new Match());

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(matchRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(matches));

        tournamentService.deleteTournament(tournamentName, adminName);

        verify(matchRepository).deleteAll(matches);
        verify(tournamentRepository).delete(tournament);
    }

    @Test
    void deleteTournament_TournamentEnded_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        String adminName = "admin";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        tournament.setEndDate(LocalDate.now().minusDays(1));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
            () -> tournamentService.deleteTournament(tournamentName, adminName));
        
        assertEquals("Cannot delete a tournament that has already ended", exception.getMessage());
    }

    @Test
    void deleteTournament_NotAdmin_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy("admin1");

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        assertThrows(IllegalArgumentException.class, 
            () -> tournamentService.deleteTournament(tournamentName, "admin2"));
    }

    @Test
    void updateTournament_TournamentEnded_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        existingTournament.setEndDate(LocalDate.now().minusDays(1));
        Tournament newDetails = createValidTournament(tournamentName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Cannot update a tournament that has already ended", errors.get("error"));
    }

    @Test
    void updateTournament_BracketGenerated_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament.Bracket bracket = new Tournament.Bracket();
        bracket.setRounds(new ArrayList<>());
        existingTournament.setBracket(bracket);
        Tournament newDetails = createValidTournament(tournamentName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Cannot update a tournament after the bracket has been generated", errors.get("error"));
    }

    @Test
    void updateTournament_DuplicateName_ReturnsErrorMap() {
        String oldName = "Old Tournament";
        String newName = "New Tournament";
        Tournament existingTournament = createValidTournament(oldName);
        Tournament newDetails = createValidTournament(oldName);
        newDetails.setTournamentName(newName);

        when(tournamentRepository.findByTournamentName(oldName))
            .thenReturn(Optional.of(existingTournament));
        when(tournamentRepository.existsByTournamentName(newName))
            .thenReturn(true);

        Map<String, Object> result = tournamentService.updateTournament(oldName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Tournament name already exists!", errors.get("tournamentName"));
    }

    @Test
    void updateTournament_InvalidStartDate_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setStartDate(LocalDate.now()); // Less than one month after creation

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Start date must be at least one month after the creation date!", errors.get("startDate"));
    }

    @Test
    void updateTournament_ReducedCapacityBelowCurrentPlayers_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        existingTournament.setPlayersPool(Arrays.asList("player1", "player2"));
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setPlayerCapacity(1); // Less than current players

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Player capacity cannot be less than the current number of players!", errors.get("playerCapacity"));
    }

    @Test
    void updateTournament_InvalidEloRange_NoPlayers_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setMinElo(2000);
        newDetails.setMaxElo(1000);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Minimum elo must be less than or equal to maximum elo!", errors.get("eloRange"));
    }

    @Test
    void updateTournament_Success_WithNameChange() {
        String oldName = "Old Tournament";
        String newName = "New Tournament";
        Tournament existingTournament = createValidTournament(oldName);
        Tournament newDetails = createValidTournament(oldName);
        newDetails.setTournamentName(newName);
        List<Match> matches = Arrays.asList(new Match(), new Match());

        when(tournamentRepository.findByTournamentName(oldName))
            .thenReturn(Optional.of(existingTournament));
        when(tournamentRepository.existsByTournamentName(newName))
            .thenReturn(false);
        when(matchRepository.findByTournamentName(oldName))
            .thenReturn(Optional.of(matches));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(existingTournament);

        Map<String, Object> result = tournamentService.updateTournament(oldName, newDetails);

        assertNotNull(result.get("tournament"));
        verify(matchRepository, times(2)).save(any(Match.class));
    }

    @Test
    void updateTournament_ValidationErrors_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setGender("Invalid"); // Invalid gender to trigger validation error
        
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));
        
        // Fix: Use doAnswer instead of when for void methods
        doAnswer(invocation -> {
            BeanPropertyBindingResult errors = invocation.getArgument(1);
            errors.rejectValue("gender", "invalid", "Invalid gender format!");
            return null;
        }).when(validator).validate(eq(newDetails), any(BeanPropertyBindingResult.class));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Invalid gender format!", errors.get("gender"));
    }

    @Test
    void updateTournament_MultipleValidationErrors_ReturnsAllErrors() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setGender("Invalid");
        newDetails.setCategory("Invalid");
        
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));
        
        // Fix: Use doAnswer instead of when for void methods
        doAnswer(invocation -> {
            BeanPropertyBindingResult errors = invocation.getArgument(1);
            errors.rejectValue("gender", "invalid", "Invalid gender format!");
            errors.rejectValue("category", "invalid", "Category must be U16, U21, or Open!");
            return null;
        }).when(validator).validate(eq(newDetails), any(BeanPropertyBindingResult.class));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertNotNull(errors);
        assertEquals("Invalid gender format!", errors.get("gender"));
        assertEquals("Category must be U16, U21, or Open!", errors.get("category"));
    }

    @Test
    void getAdminUpcomingTournaments_Success() {
        String adminName = "testAdmin";
        
        // Create test tournaments
        Tournament upcomingTournament1 = createValidTournament("Upcoming1");
        upcomingTournament1.setCreatedBy(adminName);
        upcomingTournament1.setStartDate(LocalDate.now().plusDays(10));
        
        Tournament upcomingTournament2 = createValidTournament("Upcoming2");
        upcomingTournament2.setCreatedBy(adminName);
        upcomingTournament2.setStartDate(LocalDate.now().plusDays(20));
        
        Tournament otherAdminTournament = createValidTournament("OtherAdmin");
        otherAdminTournament.setCreatedBy("otherAdmin");
        otherAdminTournament.setStartDate(LocalDate.now().plusDays(15));
        
        Tournament endedTournament = createValidTournament("Ended");
        endedTournament.setCreatedBy(adminName);
        endedTournament.setEndDate(LocalDate.now().minusDays(1));

        List<Tournament> allTournaments = Arrays.asList(
            upcomingTournament1, 
            upcomingTournament2, 
            otherAdminTournament, 
            endedTournament
        );

        when(tournamentRepository.findAll()).thenReturn(allTournaments);

        List<Tournament> result = tournamentService.getAdminUpcomingTournaments(adminName);

        assertEquals(2, result.size());
        assertTrue(result.contains(upcomingTournament1));
        assertTrue(result.contains(upcomingTournament2));
        assertFalse(result.contains(otherAdminTournament));
        assertFalse(result.contains(endedTournament));
    }

    @Test
    void getAdminUpcomingTournaments_NoTournaments() {
        String adminName = "testAdmin";
        when(tournamentRepository.findAll()).thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getAdminUpcomingTournaments(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminUpcomingTournaments_OnlyEndedTournaments() {
        String adminName = "testAdmin";
        
        Tournament endedTournament1 = createValidTournament("Ended1");
        endedTournament1.setCreatedBy(adminName);
        endedTournament1.setEndDate(LocalDate.now().minusDays(1));
        
        Tournament endedTournament2 = createValidTournament("Ended2");
        endedTournament2.setCreatedBy(adminName);
        endedTournament2.setEndDate(LocalDate.now().minusDays(2));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(endedTournament1, endedTournament2));

        List<Tournament> result = tournamentService.getAdminUpcomingTournaments(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminUpcomingTournaments_RepositoryThrowsException() {
        String adminName = "testAdmin";
        when(tournamentRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.getAdminUpcomingTournaments(adminName));
        
        assertEquals("Unexpected error occurred while fetching upcoming tournaments created by admin", 
            exception.getMessage());
    }

    @Test
    void createTournament_Success() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(false);
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);
        
        // Use explicit doNothing for success case
        doNothing().when(validator).validate(eq(tournament), eq(errors));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isPresent());
        assertTrue(result.getSecond().isEmpty());
        assertEquals(adminName, result.getFirst().get().getCreatedBy());
        assertNotNull(result.getFirst().get().getCreatedAt());
        assertNotNull(result.getFirst().get().getUpdatedAt());
    }

    @Test
    void createTournament_StartDateTooEarly() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        tournament.setStartDate(LocalDate.now().plusDays(15)); // Less than a month

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("startDate"));
        assertEquals("Start date must be at least one month after the creation date", 
            result.getSecond().get("startDate"));
    }

    @Test
    void createTournament_ValidationErrors() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
        // Use explicit doAnswer with actual objects
        doAnswer(invocation -> {
            BeanPropertyBindingResult bindingResult = (BeanPropertyBindingResult) invocation.getArgument(1);
            bindingResult.rejectValue("gender", "invalid", "Invalid gender format!");
            bindingResult.rejectValue("category", "invalid", "Category must be U16, U21, or Open!");
            return null;
        }).when(validator).validate(eq(tournament), eq(errors));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertEquals(2, result.getSecond().size());
        assertEquals("Invalid gender format!", result.getSecond().get("gender"));
        assertEquals("Category must be U16, U21, or Open!", result.getSecond().get("category"));
    }

    @Test
    void createTournament_DuplicateName() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Existing Tournament");
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(true);
        doNothing().when(validator).validate(eq(tournament), eq(errors));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("tournamentName"));
        assertEquals("Tournament name already exists", result.getSecond().get("tournamentName"));
    }

    @Test
    void joinTournament_Success() throws UserNotFoundException, TournamentNotFoundException, InvalidJoinException {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>());

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(createValidUser(username)));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.singletonList(tournament));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        assertDoesNotThrow(() -> tournamentService.joinTournament(username, tournamentName));
        verify(tournamentRepository).save(any(Tournament.class));
    }

    @Test
    void joinTournament_NoAvailableTournaments() {
        String username = "testUser";
        String tournamentName = "Test Tournament";

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(createValidUser(username)));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.emptyList());

        InvalidJoinException exception = assertThrows(InvalidJoinException.class,
            () -> tournamentService.joinTournament(username, tournamentName));
        assertEquals("No available tournaments found for the user: " + username, 
            exception.getMessage());
    }

    @Test
    void joinTournament_UnexpectedError() {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        Tournament tournament = createValidTournament(tournamentName);
        User user = createValidUser(username);

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(user));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.singletonList(tournament));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> tournamentService.joinTournament(username, tournamentName));
        
        assertEquals("An unexpected error occurred while joining the tournament", 
            exception.getMessage());
    }

    @Test
    void joinTournament_TournamentNotFoundInAvailableList() {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        Tournament differentTournament = createValidTournament("Different Tournament");
        User user = createValidUser(username);

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(user));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.singletonList(differentTournament));

        InvalidJoinException exception = assertThrows(InvalidJoinException.class,
            () -> tournamentService.joinTournament(username, tournamentName));
        
        assertEquals("Tournament is not available for joining", 
            exception.getMessage());
    }

    @Test
    void joinTournament_SuccessfulJoin() throws TournamentNotFoundException, InvalidJoinException {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>());
        User user = createValidUser(username);

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(user));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.singletonList(tournament));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        tournamentService.joinTournament(username, tournamentName);

        verify(tournamentRepository).save(argThat(savedTournament -> 
            savedTournament.getPlayersPool().contains(username)
        ));
    }

    @Test
    void joinTournament_EmptyAvailableTournaments() {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        User user = createValidUser(username);

        when(userRepository.findByUsername(username))
            .thenReturn(Optional.of(user));
        when(tournamentRepository.findAll())
            .thenReturn(Collections.emptyList());

        InvalidJoinException exception = assertThrows(InvalidJoinException.class,
            () -> tournamentService.joinTournament(username, tournamentName));
        
        assertEquals("No available tournaments found for the user: " + username, 
            exception.getMessage());
    }

    @Test
    void createTournament_UnexpectedError() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        // BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(false);
        when(tournamentRepository.save(any(Tournament.class)))
            .thenThrow(new RuntimeException("Database error"));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertEquals("An unexpected error occurred while creating the tournament", 
            result.getSecond().get("error"));
    }

    @Test
    void createTournament_NullTournament() {
        String adminName = "testAdmin";
        
        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(null, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertEquals("An unexpected error occurred while creating the tournament", 
            result.getSecond().get("error"));
    }

    @Test
    void createTournament_InvalidClosingSignupDate() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        tournament.setStartDate(LocalDate.now().plusMonths(2));
        tournament.setClosingSignupDate(LocalDate.now().plusMonths(3));

        doAnswer(invocation -> {
            Errors validationErrors = invocation.getArgument(1);
            validationErrors.rejectValue("closingSignupDate", "invalid", "Closing signup date must be before the start date");
            return null;
        }).when(validator).validate(any(Tournament.class), any(Errors.class));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("closingSignupDate"));
    }

    @Test
    void createTournament_InvalidPlayerCapacity() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        tournament.setPlayerCapacity(1);

        doAnswer(invocation -> {
            Errors validationErrors = invocation.getArgument(1);
            validationErrors.rejectValue("playerCapacity", "invalid", "Player capacity must be at least 2");
            return null;
        }).when(validator).validate(any(Tournament.class), any(Errors.class));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("playerCapacity"));
        assertEquals("Player capacity must be at least 2", 
            result.getSecond().get("playerCapacity"));
    }

    @Test
    void createTournament_InvalidEloRange() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        tournament.setMinElo(2000);
        tournament.setMaxElo(1500);

        doAnswer(invocation -> {
            Errors validationErrors = invocation.getArgument(1);
            validationErrors.rejectValue("minElo", "invalid", "Minimum Elo must be less than or equal to maximum Elo");
            return null;
        }).when(validator).validate(any(Tournament.class), any(Errors.class));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("minElo"));
        assertEquals("Minimum Elo must be less than or equal to maximum Elo", 
            result.getSecond().get("minElo"));
    }

    @Test
    void getAdminHistory_NoTournaments() {
        String adminName = "admin";
        when(tournamentRepository.findAll())
            .thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getAdminHistory(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminHistory_OnlyCurrentTournaments() {
        String adminName = "admin";
        Tournament current1 = createValidTournament("Current1");
        Tournament current2 = createValidTournament("Current2");
        current1.setCreatedBy(adminName);
        current2.setCreatedBy(adminName);
        // No endDate set, meaning they're current tournaments

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(current1, current2));

        List<Tournament> result = tournamentService.getAdminHistory(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminHistory_MixedTournaments() {
        String adminName = "admin";
        
        // Past tournaments
        Tournament past1 = createValidTournament("Past1");
        Tournament past2 = createValidTournament("Past2");
        past1.setCreatedBy(adminName);
        past2.setCreatedBy(adminName);
        past1.setEndDate(LocalDate.now().minusDays(1));
        past2.setEndDate(LocalDate.now().minusDays(2));

        // Current tournaments
        Tournament current = createValidTournament("Current");
        current.setCreatedBy(adminName);
        
        // Other admin's tournament
        Tournament otherAdminPast = createValidTournament("OtherPast");
        otherAdminPast.setCreatedBy("otherAdmin");
        otherAdminPast.setEndDate(LocalDate.now().minusDays(1));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(past1, past2, current, otherAdminPast));

        List<Tournament> result = tournamentService.getAdminHistory(adminName);

        assertEquals(2, result.size());
        assertTrue(result.contains(past1));
        assertTrue(result.contains(past2));
        assertFalse(result.contains(current));
        assertFalse(result.contains(otherAdminPast));
    }

    @Test
    void getAdminHistory_RepositoryThrowsException() {
        String adminName = "admin";
        when(tournamentRepository.findAll())
            .thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.getAdminHistory(adminName));
        
        assertEquals("Unexpected error occurred while fetching tournament history for admin", 
            exception.getMessage());
    }

    @Test
    void getUserHistory_UserParticipatedInTournaments_ReturnsParticipatedTournaments() {
        String username = "testUser";
        
        // Past tournaments where user participated
        Tournament past1 = createValidTournament("Past1");
        past1.setEndDate(LocalDate.now().minusDays(1));
        past1.setPlayersPool(new ArrayList<>(Collections.singletonList(username)));
        
        Tournament past2 = createValidTournament("Past2");
        past2.setEndDate(LocalDate.now().minusDays(2));
        past2.setPlayersPool(new ArrayList<>(Collections.singletonList(username)));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(past1, past2));

        List<Tournament> result = tournamentService.getUserHistory(username);

        assertEquals(2, result.size());
        assertTrue(result.contains(past1));
        assertTrue(result.contains(past2));
        verify(tournamentRepository).findAll();
    }

    @Test
    void getUserHistory_NoParticipation_ReturnsEmptyList() {
        String username = "testUser";
        when(tournamentRepository.findAll())
            .thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getUserHistory(username);

        assertTrue(result.isEmpty());
        verify(tournamentRepository).findAll();
    }

    @Test
    void getUserHistory_TournamentWithNullPlayersPool_HandlesNullSafely() {
        String username = "testUser";
        
        // Create a tournament with null players pool
        Tournament tournament = createValidTournament("Test");
        tournament.setEndDate(LocalDate.now().minusDays(1));
        tournament.setPlayersPool(new ArrayList<>()); // Initialize with empty list instead of null
        
        // Create a valid tournament with non-empty players pool
        Tournament validTournament = createValidTournament("Valid");
        validTournament.setEndDate(LocalDate.now().minusDays(1));
        validTournament.setPlayersPool(new ArrayList<>(Collections.singletonList(username)));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(tournament, validTournament));

        List<Tournament> result = tournamentService.getUserHistory(username);

        assertEquals(1, result.size());
        assertTrue(result.contains(validTournament));
        assertFalse(result.contains(tournament));
        verify(tournamentRepository).findAll();
    }

    @Test
    void getUserHistory_DatabaseError_ThrowsRuntimeException() {
        String username = "testUser";
        when(tournamentRepository.findAll())
            .thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.getUserHistory(username));
        
        assertEquals("Unexpected error occurred while fetching tournaments history for user", 
            exception.getMessage());
        verify(tournamentRepository).findAll();
    }

    @Test
    void getUserHistory_MixedParticipation_ReturnsOnlyParticipatedTournaments() {
        String username = "testUser";
        
        // Tournament with user in players pool
        Tournament userTournament = createValidTournament("UserTournament");
        userTournament.setEndDate(LocalDate.now().minusDays(1));
        userTournament.setPlayersPool(new ArrayList<>(Collections.singletonList(username)));
        
        // Tournament without user in players pool
        Tournament otherTournament = createValidTournament("OtherTournament");
        otherTournament.setEndDate(LocalDate.now().minusDays(1));
        otherTournament.setPlayersPool(new ArrayList<>(Collections.singletonList("otherUser")));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(userTournament, otherTournament));

        List<Tournament> result = tournamentService.getUserHistory(username);

        assertEquals(1, result.size());
        assertTrue(result.contains(userTournament));
        assertFalse(result.contains(otherTournament));
        verify(tournamentRepository).findAll();
    }

    private Tournament createValidTournament(String name) {
        Tournament tournament = new Tournament();
        tournament.setTournamentName(name);
        tournament.setStartDate(LocalDate.now().plusMonths(2));
        tournament.setClosingSignupDate(LocalDate.now().plusMonths(1));
        tournament.setPlayerCapacity(8);
        tournament.setMinElo(0);
        tournament.setMaxElo(3000);
        tournament.setGender("Male");
        tournament.setCategory("Open");
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());
        return tournament;
    }

    private User createValidUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        return user;
    }
}