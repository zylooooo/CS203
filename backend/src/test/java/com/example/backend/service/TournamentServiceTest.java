package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.util.Pair;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @BeforeEach
    void setUp() {
        reset(tournamentRepository);
    }

    @Test
    void getAllTournaments_DatabaseHasTournaments_ReturnsAllTournaments() {
        List<Tournament> mockTournaments = Arrays.asList(new Tournament(), new Tournament());
        when(tournamentRepository.findAll()).thenReturn(mockTournaments);

        List<Tournament> result = tournamentService.getAllTournaments();

        assertEquals(2, result.size());
        verify(tournamentRepository, times(1)).findAll();
    }

    @Test
    void getAllTournaments_RepositoryThrowsException_ThrowsRuntimeException() {
        when(tournamentRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> tournamentService.getAllTournaments());
    }

    @Test
    void getTournamentByName_TournamentExists_ReturnsTournament() throws TournamentNotFoundException {
        String tournamentName = "Test Tournament";
        Tournament mockTournament = new Tournament();
        mockTournament.setTournamentName(tournamentName);
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(mockTournament));

        Tournament result = tournamentService.getTournamentByName(tournamentName);

        assertEquals(tournamentName, result.getTournamentName());
    }

    @Test
    void getTournamentByName_TournamentDoesNotExist_ThrowsTournamentNotFoundException() {
        String tournamentName = "Nonexistent Tournament";
        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.empty());

        assertThrows(TournamentNotFoundException.class, () -> tournamentService.getTournamentByName(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NameIsAvailable_ReturnsTrue() {
        String tournamentName = "New Tournament";
        when(tournamentRepository.existsByTournamentName(tournamentName)).thenReturn(false);

        assertTrue(tournamentService.checkTournamentNameAvailability(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NameIsUnavailable_ReturnsFalse() {
        String tournamentName = "Existing Tournament";
        when(tournamentRepository.existsByTournamentName(tournamentName)).thenReturn(true);

        assertFalse(tournamentService.checkTournamentNameAvailability(tournamentName));
    }

    @Test
    void checkTournamentNameAvailability_NameIsNull_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> tournamentService.checkTournamentNameAvailability(null));
    }

    @Test
    void checkTournamentNameAvailability_NameIsEmpty_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> tournamentService.checkTournamentNameAvailability(""));
    }

    @Test
    void createTournament_ValidTournamentData_ReturnsSavedTournament() {
        Tournament tournament = new Tournament();
        tournament.setTournamentName("New Tournament");
        String adminName = "admin";

        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(false);
        when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

        Pair<Optional<Tournament>, Map<String, String>> result = tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isPresent());
        assertEquals(tournament, result.getFirst().get());
        assertTrue(result.getSecond().isEmpty());
    }

    @Test
    void createTournament_TournamentNameAlreadyExists_ReturnsPairWithEmptyOptionalAndErrorMap() {
        Tournament tournament = new Tournament();
        tournament.setTournamentName("Existing Tournament");
        String adminName = "admin";

        when(tournamentRepository.existsByTournamentName(tournament.getTournamentName())).thenReturn(true);

        Pair<Optional<Tournament>, Map<String, String>> result = tournamentService.createTournament(tournament, adminName);

        assertFalse(result.getFirst().isPresent());
        assertTrue(result.getSecond().containsKey("tournamentName"));
    }

    @Test
    void createTournament_ValidationErrors_ReturnsPairWithEmptyOptionalAndErrorMap() {
        Tournament invalidTournament = new Tournament();
        String adminName = "admin";

        // Simulate validation errors
        doAnswer(invocation -> {
            Errors errors = invocation.getArgument(1);
            errors.rejectValue("tournamentName", "notEmpty", "Tournament name must not be empty");
            return null;
        }).when(validator).validate(any(Tournament.class), any(Errors.class));

        Pair<Optional<Tournament>, Map<String, String>> result = tournamentService.createTournament(invalidTournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertFalse(result.getSecond().isEmpty());
        assertEquals(1, result.getSecond().size());
        assertTrue(result.getSecond().containsKey("tournamentName"));
    }

    @Test
    void createTournament_ExceptionThrown_ReturnsPairWithEmptyOptionalAndErrorMap() {
        Tournament tournament = new Tournament();
        tournament.setTournamentName("Test Tournament");
        String adminName = "admin";

        when(tournamentRepository.save(any(Tournament.class))).thenThrow(new RuntimeException("Database error"));

        Pair<Optional<Tournament>, Map<String, String>> result = tournamentService.createTournament(tournament, adminName);

        assertTrue(result.getFirst().isEmpty());
        assertFalse(result.getSecond().isEmpty());
        assertEquals(1, result.getSecond().size());
        assertTrue(result.getSecond().containsKey("error"));
        assertEquals("An unexpected error occurred while creating the tournament", result.getSecond().get("error"));
    }

    @Test
    void getCurrentTournaments_OngoingAndFutureTournamentsExist_ReturnsOngoingAndFutureTournaments() {
        LocalDate currentDate = LocalDate.now();
        
        // Create an ongoing tournament
        Tournament ongoingTournament = new Tournament();
        ongoingTournament.setTournamentName("Ongoing Tournament");
        ongoingTournament.setOngoing(true);
        ongoingTournament.setStartDate(currentDate.minusDays(1));
        ongoingTournament.setEndDate(currentDate.plusDays(1));

        // Create a future tournament
        Tournament futureTournament = new Tournament();
        futureTournament.setTournamentName("Future Tournament");
        futureTournament.setOngoing(false);
        futureTournament.setStartDate(currentDate.plusDays(1));
        futureTournament.setEndDate(currentDate.plusDays(2));

        // Create a past tournament (should not be included in results)
        Tournament pastTournament = new Tournament();
        pastTournament.setTournamentName("Past Tournament");
        pastTournament.setOngoing(false);
        pastTournament.setStartDate(currentDate.minusDays(2));
        pastTournament.setEndDate(currentDate.minusDays(1));

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(ongoingTournament, futureTournament, pastTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertEquals(1, result.size());
        assertTrue(result.stream().anyMatch(t -> t.getTournamentName().equals("Ongoing Tournament")));
        assertFalse(result.stream().anyMatch(t -> t.getTournamentName().equals("Future Tournament")));
        assertFalse(result.stream().anyMatch(t -> t.getTournamentName().equals("Past Tournament")));
    }

    @Test
    void getAllHistory_PastTournamentsExist_ReturnsPastTournaments() throws TournamentNotFoundException {
        LocalDate currentDate = LocalDate.now();
        Tournament pastTournament = new Tournament();
        pastTournament.setOngoing(false);
        pastTournament.setEndDate(currentDate.minusDays(1));

        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(pastTournament));

        List<Tournament> result = tournamentService.getAllHistory();

        assertEquals(1, result.size());
        assertEquals(pastTournament, result.get(0));
    }

    @Test
    void getAllHistory_NoPastTournamentsExist_ThrowsTournamentNotFoundException() {
        when(tournamentRepository.findAll()).thenReturn(Collections.emptyList());

        assertThrows(TournamentNotFoundException.class, () -> tournamentService.getAllHistory());
    }

    @Test
    void getUserAvailableTournaments_UserDoesNotExist_ThrowsUserNotFoundException() {
        String username = "nonexistentUser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> tournamentService.getUserAvailableTournaments(username));
    }

    @Test
    void getUserAvailableTournaments_TournamentAlreadyStarted_NotIncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
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
    void getUserAvailableTournaments_UserEloOutOfRange_NotIncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(2500);
        user.setGender("Male");
        user.setAge(20);

        Tournament tournament = new Tournament();
        tournament.setStartDate(LocalDate.now().plusDays(1));
        tournament.setPlayerCapacity(10);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("Open");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserAvailableTournaments_GenderMismatch_NotIncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
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
    void getUserAvailableTournaments_AgeCategoryU16_IncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(15);

        Tournament tournament = new Tournament();
        tournament.setStartDate(LocalDate.now().plusDays(1));
        tournament.setPlayerCapacity(10);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("U16");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertEquals(1, result.size());
        assertEquals(tournament, result.get(0));
    }

    @Test
    void getUserAvailableTournaments_AgeCategoryU21_IncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
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
        tournament.setGender("Male");
        tournament.setCategory("U21");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertEquals(1, result.size());
        assertEquals(tournament, result.get(0));
    }

    @Test
    void getUserAvailableTournaments_AgeCategoryOpen_IncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
        String username = "testUser";
        User user = new User();
        user.setUsername(username);
        user.setElo(1500);
        user.setGender("Male");
        user.setAge(30);

        Tournament tournament = new Tournament();
        tournament.setStartDate(LocalDate.now().plusDays(1));
        tournament.setPlayerCapacity(10);
        tournament.setPlayersPool(new ArrayList<>());
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);
        tournament.setGender("Male");
        tournament.setCategory("Open");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertEquals(1, result.size());
        assertEquals(tournament, result.get(0));
    }

    @Test
    void getUserAvailableTournaments_UnknownCategory_NotIncludedInResult() throws UserNotFoundException, TournamentNotFoundException {
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
        tournament.setGender("Male");
        tournament.setCategory("Unknown");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(tournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments(username);

        assertTrue(result.isEmpty());
    }

    @Test
    void getCurrentTournaments_NoOngoingOrFutureTournaments_ReturnsEmptyList() {
        LocalDate currentDate = LocalDate.now();
        Tournament pastTournament = new Tournament();
        pastTournament.setOngoing(false);
        pastTournament.setStartDate(currentDate.minusDays(2));
        pastTournament.setEndDate(currentDate.minusDays(1));

        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(pastTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertTrue(result.isEmpty());
    }

    @Test
    void getCurrentTournaments_HasOngoingTournaments_ReturnsOngoingTournaments() {
        LocalDate currentDate = LocalDate.now();
        Tournament ongoingTournament = new Tournament();
        ongoingTournament.setTournamentName("Ongoing Tournament");
        ongoingTournament.setOngoing(true);
        ongoingTournament.setStartDate(currentDate.minusDays(1));
        ongoingTournament.setEndDate(currentDate.plusDays(1));

        Tournament futureTournament = new Tournament();
        futureTournament.setTournamentName("Future Tournament");
        futureTournament.setOngoing(false);
        futureTournament.setStartDate(currentDate.plusDays(1));
        futureTournament.setEndDate(currentDate.plusDays(2));

        Tournament pastTournament = new Tournament();
        pastTournament.setTournamentName("Past Tournament");
        pastTournament.setOngoing(false);
        pastTournament.setStartDate(currentDate.minusDays(2));
        pastTournament.setEndDate(currentDate.minusDays(1));

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(ongoingTournament, futureTournament, pastTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertEquals(1, result.size());
        assertEquals("Ongoing Tournament", result.get(0).getTournamentName());
    }

    @Test
    void getCurrentTournaments_HasFutureTournaments_ReturnsFutureTournaments() {
        LocalDate currentDate = LocalDate.now();
        Tournament futureTournament = new Tournament();
        futureTournament.setTournamentName("Future Tournament");
        futureTournament.setOngoing(false);
        futureTournament.setStartDate(currentDate.plusDays(1));
        futureTournament.setEndDate(currentDate.plusDays(2));

        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(futureTournament));

        List<Tournament> result = tournamentService.getCurrentTournaments();

        assertEquals(0, result.size());
    }

    @Test
    void getUserUpcomingTournaments_UserHasUpcomingTournaments_ReturnsUpcomingTournaments() throws UserNotFoundException {
        LocalDate currentDate = LocalDate.now();
        Tournament upcomingTournament1 = new Tournament();
        upcomingTournament1.setStartDate(currentDate.plusDays(1));
        upcomingTournament1.getPlayersPool().add("testUser");

        Tournament upcomingTournament2 = new Tournament();
        upcomingTournament2.setStartDate(currentDate.plusDays(2));
        upcomingTournament2.getPlayersPool().add("testUser");

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(upcomingTournament1, upcomingTournament2));

        List<Tournament> result = tournamentService.getUserUpcomingTournaments("testUser");

        assertEquals(2, result.size());
        assertTrue(result.contains(upcomingTournament1));
        assertTrue(result.contains(upcomingTournament2));
    }

    @Test
    void getUserHistory_UserHasPastTournaments_ReturnsUserPastTournaments() throws TournamentNotFoundException {
        LocalDate now = LocalDate.now();
        Tournament userPast = new Tournament();
        userPast.setEndDate(now.minusDays(1));
        userPast.setOngoing(false);
        userPast.getPlayersPool().add("testUser");

        Tournament otherPast = new Tournament();
        otherPast.setEndDate(now.minusDays(1));
        otherPast.setOngoing(false);

        when(tournamentRepository.findAll()).thenReturn(Arrays.asList(userPast, otherPast));

        List<Tournament> result = tournamentService.getUserHistory("testUser");

        assertEquals(1, result.size());
        assertTrue(result.contains(userPast));
    }

    @Test
    void getUserAvailableTournaments_AvailableTournamentsExist_ReturnsAvailableTournaments() throws UserNotFoundException, TournamentNotFoundException {
        User user = new User();
        user.setUsername("testUser");
        user.setGender("Male");
        user.setAge(20);
        user.setElo(1500);
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));

        LocalDate currentDate = LocalDate.now();
        Tournament availableTournament = new Tournament();
        availableTournament.setStartDate(currentDate.plusDays(1));
        availableTournament.setGender("Male");
        availableTournament.setCategory("U21");
        availableTournament.setMinElo(1400);
        availableTournament.setMaxElo(1600);
        availableTournament.setPlayerCapacity(10);

        when(tournamentRepository.findAll()).thenReturn(Collections.singletonList(availableTournament));

        List<Tournament> result = tournamentService.getUserAvailableTournaments("testUser");

        assertEquals(1, result.size());
        assertTrue(result.contains(availableTournament));
    }
}