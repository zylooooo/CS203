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
        User user = createValidUser(username);
        user.setEnabled(true);
        user.setAvailable(true);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        user.setStrikeReports(new ArrayList<>());

        Tournament startedTournament = createValidTournament("Started Tournament");
        startedTournament.setStartDate(LocalDate.now());
        startedTournament.setBracket(null);
        startedTournament.setClosingSignupDate(LocalDate.now().minusDays(14));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(startedTournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_BracketGenerated_ExcludesFromResult() throws UserNotFoundException {
        String username = "testUser";
        User user = createValidUser(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        user.setStrikeReports(new ArrayList<>());

        Tournament tournament = createValidTournament("Tournament");
        tournament.setPlayerCapacity(8);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("Open");
        tournament.setClosingSignupDate(LocalDate.now().plusDays(1));
        
        // Create bracket to make tournament ineligible
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round = new Tournament.Round();
        round.setMatches(Arrays.asList("match1"));
        bracket.setRounds(Arrays.asList(round));
        tournament.setBracket(bracket); // Tournament has started, should be excluded

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_UserStriked_ExcludesFromResult() throws UserNotFoundException {
        String username = "testUser";
        User user = createValidUser(username);
        user.setEnabled(true);
        user.setAvailable(true);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        
        User.StrikeReport strike = new User.StrikeReport();
        strike.setIssuedBy("admin");
        strike.setDateCreated(LocalDateTime.now().minusDays(15));
        user.setStrikeReports(Collections.singletonList(strike));

        Tournament tournament = createValidTournament("Tournament");
        tournament.setStartDate(LocalDate.now().plusMonths(2));
        tournament.setBracket(null);
        tournament.setCreatedBy("admin");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_SignupClosed_ExcludesFromResult() throws UserNotFoundException {
        String username = "testUser";
        User user = createValidUser(username);
        user.setEnabled(true);
        user.setAvailable(true);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        user.setStrikeReports(new ArrayList<>());

        Tournament tournament = createValidTournament("Tournament");
        tournament.setStartDate(LocalDate.now().plusMonths(2));
        tournament.setBracket(null);
        tournament.setClosingSignupDate(LocalDate.now().minusDays(1));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_availableEligibleTournament_returnsTournament() throws UserNotFoundException {
        String username = "testUser";
        User user = createValidUser(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        user.setStrikeReports(new ArrayList<>());

        Tournament eligibleTournament = createValidTournament("Eligible Tournament");
        eligibleTournament.setPlayerCapacity(8);
        eligibleTournament.setPlayersPool(new ArrayList<>());
        eligibleTournament.setMinElo(1000);
        eligibleTournament.setMaxElo(2000);
        eligibleTournament.setGender("Male");
        eligibleTournament.setCategory("Open");
        eligibleTournament.setBracket(null);
        eligibleTournament.setCreatedBy("admin");
        eligibleTournament.setClosingSignupDate(LocalDate.now().plusDays(1));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(eligibleTournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertEquals(1, result.size());
        assertTrue(result.contains(eligibleTournament));
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
    void getCurrentAndFutureTournaments_validTournaments_returnsListofTournaments() {
        Tournament future1 = createValidTournament("Future1");
        Tournament future2 = createValidTournament("Future2");
        future1.setStartDate(LocalDate.now().minusDays(1));
        future2.setStartDate(LocalDate.now().plusDays(2));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(future1, future2));

        List<Tournament> result = tournamentService.getCurrentAndFutureTournaments();

        assertEquals(2, result.size());
        assertEquals("Future1", result.get(0).getTournamentName());
        assertEquals("Future2", result.get(1).getTournamentName());
    }

    @Test
    void getAdminHistory_withPastTournaments_returnsListofTournaments() {
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
        existingTournament.setCreatedAt(LocalDateTime.now());
        
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setStartDate(LocalDate.now()); // Invalid start date
        
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);
        
        assertNotNull(result.get("errors"));
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) result.get("errors");
        assertTrue(errors.containsKey("startDate"));
    }

    @Test
    void updateTournament_ReducedCapacityBelowCurrentPlayers_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        existingTournament.setPlayersPool(Arrays.asList("player1", "player2"));
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setPlayerCapacity(1);

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
        String tournamentName = "Original Name";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament("New Name");
        
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));
        when(tournamentRepository.existsByTournamentName("New Name"))
            .thenReturn(false);
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(existingTournament);
        when(matchRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(Collections.emptyList()));

        Map<String, Object> result = tournamentService.updateTournament(tournamentName, newDetails);
        
        assertFalse(result.containsKey("errors"));
        assertNotNull(result.get("tournament"));
    }

    @Test
    void updateTournament_ValidationErrors_ReturnsErrorMap() {
        String tournamentName = "Test Tournament";
        Tournament existingTournament = createValidTournament(tournamentName);
        Tournament newDetails = createValidTournament(tournamentName);
        newDetails.setGender("Invalid");
        
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(existingTournament));
        
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
    void getAdminUpcomingTournaments_withMixedUpcomingTournaments_returnsListofAdminTournaments() {
        String adminName = "testAdmin";
        
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
    void getAdminUpcomingTournaments_NoTournaments_ReturnsEmptyList() {
        String adminName = "testAdmin";
        when(tournamentRepository.findAll()).thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getAdminUpcomingTournaments(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminUpcomingTournaments_OnlyEndedTournaments_ReturnsEmptyList() {
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
    void getAdminUpcomingTournaments_emptyRepository_ThrowsRuntimeException() {
        String adminName = "testAdmin";
        when(tournamentRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.getAdminUpcomingTournaments(adminName));
        
        assertEquals("Unexpected error occurred while fetching upcoming tournaments created by admin", 
            exception.getMessage());
    }

    @Test
    void createTournament_validTournamentCreated_returnsValidTournament() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(false);
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);
        
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
    void createTournament_StartDateTooEarly_returnsErrorMap() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        tournament.setStartDate(LocalDate.now().plusDays(15));

        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertTrue(result.getSecond().containsKey("startDate"));
        assertEquals("Start date must be at least one month after the creation date", 
            result.getSecond().get("startDate"));
    }

    @Test
    void createTournament_ValidationErrors_returnsErrorMap() {
        String adminName = "testAdmin";
        Tournament tournament = createValidTournament("Test Tournament");
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(tournament, "tournament");
        
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
    void createTournament_DuplicateName_returnsErrorMap() {
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
    void joinTournament_userJoinedSucessfully_returnsUpdatedTournament() throws TournamentNotFoundException, InvalidJoinException {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        
        User user = createValidUser(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(22);
        user.setStrikeReports(new ArrayList<>());

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayerCapacity(8);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("Open");
        tournament.setBracket(null);
        tournament.setCreatedBy("admin");
        tournament.setClosingSignupDate(LocalDate.now().plusMonths(1));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(tournament));
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

        tournamentService.joinTournament(username, tournamentName);

        assertTrue(tournament.getPlayersPool().contains(username));
        verify(tournamentRepository).save(tournament);
    }

    @Test
    void joinTournament_TournamentNotFoundInAvailableList_throwsTournamentNotFoundException() {
        String username = "testUser";
        String tournamentName = "Test Tournament";
        
        User user = createValidUser(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayerCapacity(8);
        tournament.setPlayersPool(Arrays.asList(username)); // User already in tournament
        tournament.setBracket(null);
        tournament.setStartDate(LocalDate.now().plusMonths(1));
        tournament.setClosingSignupDate(LocalDate.now().plusWeeks(2));

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(tournament)); // This is needed for getUserAvailableTournaments

        assertThrows(InvalidJoinException.class, 
            () -> tournamentService.joinTournament(username, tournamentName));
    }

    @Test
    void joinTournament_SuccessfulJoin_returnsUpdatedTournament() throws TournamentNotFoundException, InvalidJoinException {
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
    void joinTournament_noAvailableTournaments_throwsInvalidJoinException() {
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
    void createTournament_UnexpectedError_returnsErrorMap() {
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
    void createTournament_NullTournament_returnsErrorMap() {
        String adminName = "testAdmin";
        
        Pair<Optional<Tournament>, Map<String, String>> result = 
            tournamentService.createTournament(null, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertEquals("An unexpected error occurred while creating the tournament", 
            result.getSecond().get("error"));
    }

    @Test
    void createTournament_InvalidClosingSignupDate_returnsErrorMap() {
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
    void createTournament_InvalidPlayerCapacity_returnsErrorMap() {
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
    void createTournament_InvalidEloRange_returnsErrorMap() {
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
    void getAdminHistory_NoTournaments_returnsEmptyList() {
        String adminName = "admin";
        when(tournamentRepository.findAll())
            .thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getAdminHistory(adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAdminHistory_OnlyCurrentTournaments_returnsEmptyList() {
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
    void getAdminHistory_MixedTournaments_returnsPastTournaments() {
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
    void getAdminHistory_noTournamentsinRepository_throwsRuntimeException() {
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

    @Test
    void getCurrentTournaments_NoTournaments_ReturnsEmptyList() {
        when(tournamentRepository.findAll()).thenReturn(Collections.emptyList());

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertTrue(result.isEmpty());
        verify(tournamentRepository).findAll();
    }

    @Test
    void getCurrentTournaments_OnlyEndedTournaments_ReturnsEmptyList() {
        Tournament endedTournament = createValidTournament("Ended Tournament");
        endedTournament.setEndDate(LocalDate.now().minusDays(1));

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(endedTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertTrue(result.isEmpty());
    }

    @Test
    void getCurrentTournaments_OnlyFutureTournaments_ReturnsEmptyList() {
        Tournament futureTournament = createValidTournament("Future Tournament");
        futureTournament.setStartDate(LocalDate.now().plusDays(1));
        futureTournament.setEndDate(null);

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(futureTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertTrue(result.isEmpty());
    }

    @Test
    void getCurrentTournaments_CurrentTournaments_ReturnsCurrentList() {
        // Create a current tournament (started but not ended)
        Tournament currentTournament = createValidTournament("Current Tournament");
        currentTournament.setStartDate(LocalDate.now());
        currentTournament.setEndDate(null);

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(currentTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertEquals(1, result.size());
        assertEquals("Current Tournament", result.get(0).getTournamentName());
    }

    @Test
    void getCurrentTournaments_MixedTournaments_ReturnsOnlyCurrentOnes() {
        // Create a current tournament
        Tournament currentTournament = createValidTournament("Current Tournament");
        currentTournament.setStartDate(LocalDate.now());
        currentTournament.setEndDate(null);

        // Create an ended tournament
        Tournament endedTournament = createValidTournament("Ended Tournament");
        endedTournament.setEndDate(LocalDate.now().minusDays(1));

        // Create a future tournament
        Tournament futureTournament = createValidTournament("Future Tournament");
        futureTournament.setStartDate(LocalDate.now().plusDays(1));

        when(tournamentRepository.findAll())
            .thenReturn(Arrays.asList(currentTournament, endedTournament, futureTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertEquals(1, result.size());
        assertEquals("Current Tournament", result.get(0).getTournamentName());
    }

    @Test
    void getCurrentTournaments_RepositoryThrowsException_ThrowsRuntimeException() {
        when(tournamentRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> tournamentService.getCurrentTournaments());
        
        assertEquals("Unexpected error occurred while fetching current tournaments", exception.getMessage());
    }

    @Test
    void getAvailableUsersForTournament_Success_ReturnsEligibleUsers() throws TournamentNotFoundException {
        String tournamentName = "Test Tournament";
        String adminName = "admin";
        
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        tournament.setEndDate(null);
        
        User eligibleUser1 = createValidUser("user1");
        User eligibleUser2 = createValidUser("user2");
        User ineligibleUser = createValidUser("user3");
        ineligibleUser.setGender("Female"); // Different gender makes user ineligible

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findAll())
            .thenReturn(Arrays.asList(eligibleUser1, eligibleUser2, ineligibleUser));

        List<User> result = tournamentService.getAvailableUsersForTournament(tournamentName, adminName);

        assertEquals(2, result.size());
        assertTrue(result.contains(eligibleUser1));
        assertTrue(result.contains(eligibleUser2));
        assertFalse(result.contains(ineligibleUser));
    }

    @Test
    void getAvailableUsersForTournament_TournamentNotFound_ThrowsTournamentNotFoundException() {
        String tournamentName = "Nonexistent Tournament";
        String adminName = "admin";

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.empty());

        assertThrows(TournamentNotFoundException.class, 
            () -> tournamentService.getAvailableUsersForTournament(tournamentName, adminName));
    }

    @Test
    void getAvailableUsersForTournament_WrongAdmin_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        String adminName = "admin1";
        String wrongAdmin = "admin2";

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> tournamentService.getAvailableUsersForTournament(tournamentName, wrongAdmin));
        
        assertEquals("This tournament was not created by the specified admin", exception.getMessage());
    }

    @Test
    void getAvailableUsersForTournament_TournamentEnded_ThrowsIllegalArgumentException() {
        String tournamentName = "Test Tournament";
        String adminName = "admin";

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        tournament.setEndDate(LocalDate.now().minusDays(1));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> tournamentService.getAvailableUsersForTournament(tournamentName, adminName));
        
        assertEquals("Cannot get available users for a tournament that has already ended", exception.getMessage());
    }

    @Test
    void getAvailableUsersForTournament_NoEligibleUsers_ReturnsEmptyList() throws TournamentNotFoundException {
        String tournamentName = "Test Tournament";
        String adminName = "admin";

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        tournament.setEndDate(null);
        tournament.setGender("Male");

        User ineligibleUser1 = createValidUser("user1");
        ineligibleUser1.setGender("Female");
        User ineligibleUser2 = createValidUser("user2");
        ineligibleUser2.setEnabled(false);
        User ineligibleUser3 = createValidUser("user3");
        ineligibleUser3.setAvailable(false);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findAll())
            .thenReturn(Arrays.asList(ineligibleUser1, ineligibleUser2, ineligibleUser3));

        List<User> result = tournamentService.getAvailableUsersForTournament(tournamentName, adminName);

        assertTrue(result.isEmpty());
    }

    @Test
    void getAvailableUsersForTournament_DisabledAndUnavailableUsers_Filtered() throws TournamentNotFoundException {
        String tournamentName = "Test Tournament";
        String adminName = "admin";

        Tournament tournament = createValidTournament(tournamentName);
        tournament.setCreatedBy(adminName);
        tournament.setEndDate(null);

        User eligibleUser = createValidUser("user1");
        User disabledUser = createValidUser("user2");
        disabledUser.setEnabled(false);
        User unavailableUser = createValidUser("user3");
        unavailableUser.setAvailable(false);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findAll())
            .thenReturn(Arrays.asList(eligibleUser, disabledUser, unavailableUser));

        List<User> result = tournamentService.getAvailableUsersForTournament(tournamentName, adminName);

        assertEquals(1, result.size());
        assertTrue(result.contains(eligibleUser));
        assertFalse(result.contains(disabledUser));
        assertFalse(result.contains(unavailableUser));
    }

    @Test
    void updatePlayersPool_Success_AddsNewPlayers() {
        String tournamentName = "Test Tournament";
        List<String> players = Arrays.asList("player1", "player2");
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>());

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(createValidUser("player1")));
        when(userRepository.findByUsername("player2"))
            .thenReturn(Optional.of(createValidUser("player2")));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("Players pool updated successfully", result.get("message"));
        @SuppressWarnings("unchecked")
        List<String> addedPlayers = (List<String>) result.get("addedPlayers");
        assertEquals(2, addedPlayers.size());
        assertTrue(addedPlayers.containsAll(players));
    }

    @Test
    void updatePlayersPool_TournamentNotFound_ReturnsError() {
        String tournamentName = "Nonexistent Tournament";
        List<String> players = Arrays.asList("player1");

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.empty());

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("Tournament not found with name: " + tournamentName, result.get("error"));
    }

    @Test
    void updatePlayersPool_NoPlayersAdded_ReturnsNoChangesMessage() {
        String tournamentName = "Test Tournament";
        List<String> players = Arrays.asList("player1", "player2");
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>(players)); // Players already in tournament

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername(anyString()))
            .thenReturn(Optional.of(createValidUser("player1")));

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("No changes made to the players pool", result.get("message"));
        @SuppressWarnings("unchecked")
        List<String> skippedPlayers = (List<String>) result.get("skippedPlayers");
        assertEquals(2, skippedPlayers.size());
    }

    @Test
    void updatePlayersPool_MixedResults_ReturnsCorrectLists() {
        String tournamentName = "Test Tournament";
        List<String> players = Arrays.asList("validPlayer", "invalidPlayer", "existingPlayer");
        Tournament tournament = createValidTournament(tournamentName);
        tournament.setPlayersPool(new ArrayList<>(Collections.singletonList("existingPlayer")));

        User validUser = createValidUser("validPlayer");
        User existingUser = createValidUser("existingPlayer");

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("validPlayer"))
            .thenReturn(Optional.of(validUser));
        when(userRepository.findByUsername("invalidPlayer"))
            .thenReturn(Optional.empty());
        when(userRepository.findByUsername("existingPlayer"))
            .thenReturn(Optional.of(existingUser));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("Players pool updated successfully", result.get("message"));
        @SuppressWarnings("unchecked")
        List<String> addedPlayers = (List<String>) result.get("addedPlayers");
        @SuppressWarnings("unchecked")
        List<String> skippedPlayers = (List<String>) result.get("skippedPlayers");
        assertEquals(1, addedPlayers.size());
        assertEquals(2, skippedPlayers.size());
        assertTrue(addedPlayers.contains("validPlayer"));
        assertTrue(skippedPlayers.contains("invalidPlayer (user not found)"));
        assertTrue(skippedPlayers.contains("existingPlayer (already in tournament)"));
    }

    @Test
    void updatePlayersPool_SaveFails_ReturnsError() {
        String tournamentName = "Test Tournament";
        List<String> players = Arrays.asList("player1");
        Tournament tournament = createValidTournament(tournamentName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(createValidUser("player1")));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenThrow(new RuntimeException("Database error"));

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("Failed to save tournament after updating players pool", result.get("error"));
    }

    @Test
    void updatePlayersPool_EmptyPlayersList_ReturnsNoChanges() {
        String tournamentName = "Test Tournament";
        List<String> players = Collections.emptyList();
        Tournament tournament = createValidTournament(tournamentName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        Map<String, Object> result = tournamentService.updatePlayersPool(tournamentName, players);

        assertEquals("No changes made to the players pool", result.get("message"));
        @SuppressWarnings("unchecked")
        List<String> addedPlayers = (List<String>) result.get("addedPlayers");
        @SuppressWarnings("unchecked")
        List<String> skippedPlayers = (List<String>) result.get("skippedPlayers");
        assertTrue(addedPlayers.isEmpty());
        assertTrue(skippedPlayers.isEmpty());
    }

    private Tournament createValidTournament(String name) {
        Tournament tournament = new Tournament();
        tournament.setTournamentName(name);
        tournament.setPlayerCapacity(8);
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("Open");
        tournament.setStartDate(LocalDate.now().plusMonths(2));
        tournament.setLocation("Test Location");
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setBracket(null);
        tournament.setCreatedAt(LocalDateTime.now().minusMonths(1));
        tournament.setUpdatedAt(LocalDateTime.now());
        tournament.setCreatedBy("admin");
        tournament.setClosingSignupDate(LocalDate.now().plusDays(1));
        return tournament;
    }

    private User createValidUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setEnabled(true);
        user.setAvailable(true);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(20);
        user.setStrikeReports(new ArrayList<>());
        return user;
    }
}