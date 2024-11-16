package com.example.backend.service;

import com.example.backend.exception.MatchNotFoundException;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;
// Existing imports
import com.example.backend.model.Match;
import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class BracketServiceTest {

    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private MatchRepository matchRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LocalValidatorFactoryBean validator;

    @InjectMocks
    private BracketService bracketService;

    @Test
    void generateBracket_WithNewTournament_ShouldCreateFirstRound() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3", "player4"));

        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player2 = new User();
        player2.setUsername("player2");
        player2.setElo(1400);
        User player3 = new User();
        player3.setUsername("player3");
        player3.setElo(1300);
        User player4 = new User();
        player4.setUsername("player4");
        player4.setElo(1200);

        Match match1 = new Match();
        match1.setId("match1");
        match1.setPlayers(Arrays.asList("player1", "player4"));
        Match match2 = new Match();
        match2.setId("match2");
        match2.setPlayers(Arrays.asList("player2", "player3"));

        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1")).thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player2")).thenReturn(Optional.of(player2));
        when(userRepository.findByUsername("player3")).thenReturn(Optional.of(player3));
        when(userRepository.findByUsername("player4")).thenReturn(Optional.of(player4));
        when(matchRepository.save(any(Match.class))).thenReturn(match1).thenReturn(match2);

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository, times(2)).save(any(Match.class));
    }

    @Test
    void generateBracket_WithNonPowerOfTwoPlayers_ShouldCreatePreliminaryRound() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3"));

        Match match = new Match();
        match.setId("match1");
        match.setPlayers(Arrays.asList("player2", "player3"));

        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));
        when(matchRepository.save(any(Match.class))).thenReturn(match);

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void generateBracket_WithTournamentNotFound_ShouldReturnError() {
        // Arrange
        String tournamentName = "NonexistentTournament";
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenThrow(new TournamentNotFoundException(tournamentName));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("error");
        assertEquals("An unexpected error occurred while generating the bracket!", errorMap.get("error"));
    }

    @Test
    void generateBracket_WithNoEligiblePlayers_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(new ArrayList<>()); // Empty players pool

        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals("No matches can be generated for the new round!", result.get("error"));
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateBracket_WithUnexpectedError_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenThrow(new RuntimeException("Unexpected database error"));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertTrue(((Map<String, String>)result.get("error"))
            .containsValue("An unexpected error occurred while generating the bracket!"));
    }

    @Test
    void generateBracket_WithEmptyNewMatches_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(new ArrayList<>()); // Empty players pool

        when(tournamentRepository.findByTournamentName(tournamentName)).thenReturn(Optional.of(tournament));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals("No matches can be generated for the new round!", result.get("error"));
    }

    @Test
    void generateBracket_WithNullBracket_ShouldInitializeBracket() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2"));
        tournament.setBracket(null); // Explicitly set bracket to null

        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player2 = new User();
        player2.setUsername("player2");
        player2.setElo(1400);

        Match match = new Match();
        match.setId("match1");
        match.setPlayers(Arrays.asList("player1", "player2"));

        // Mock first findByTournamentName for initial tournament state
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player2"))
            .thenReturn(Optional.of(player2));
        when(matchRepository.save(any(Match.class)))
            .thenReturn(match);

        // Create the updated tournament state with a round and match
        Tournament updatedTournament = new Tournament();
        updatedTournament.setTournamentName(tournamentName);
        Tournament.Bracket bracket = new Tournament.Bracket();
        List<Tournament.Round> rounds = new ArrayList<>();
        Tournament.Round round = new Tournament.Round(Arrays.asList(match.getId()));
        rounds.add(round);
        bracket.setRounds(rounds);
        updatedTournament.setBracket(bracket);

        // Mock the save and second findByTournamentName for the updated state
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(updatedTournament);
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament))
            .thenReturn(Optional.of(updatedTournament));
        when(matchRepository.findAllById(any()))
            .thenReturn(Arrays.asList(match));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        assertTrue(result.containsKey("rounds"));
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void generateBracket_WithNullRounds_ShouldInitializeRounds() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2"));
        Tournament.Bracket bracket = new Tournament.Bracket();
        bracket.setRounds(null);  // Explicitly set rounds to null
        tournament.setBracket(bracket);

        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player2 = new User();
        player2.setUsername("player2");
        player2.setElo(1400);

        Match match = new Match();
        match.setId("match1");
        match.setPlayers(Arrays.asList("player1", "player2"));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player2"))
            .thenReturn(Optional.of(player2));
        when(matchRepository.save(any(Match.class)))
            .thenReturn(match);

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        verify(tournamentRepository).save(any(Tournament.class));
    }

    @Test
    void generateBracket_WithUserNotFoundException_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2"));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1"))
            .thenThrow(new UserNotFoundException("player1")); // Just pass the username

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("error");
        assertEquals("User not found with username: player1", errorMap.get("error"));
    }

    @Test
    void generateBracket_WithMatchNotFoundException_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round = new Tournament.Round(Arrays.asList("match1"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round)));
        tournament.setBracket(bracket);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(matchRepository.findAllById(any()))
            .thenThrow(new MatchNotFoundException("match1")); // Just pass the match ID

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("error");
        assertEquals("No matches found for tournament match1!", errorMap.get("error"));
    }

    @Test
    void generateBracket_WithFirstRound_ShouldReturnAllPlayers() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3", "player4"));
        tournament.setBracket(null); // First round, no bracket yet

        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player2 = new User();
        player2.setUsername("player2");
        player2.setElo(1400);
        User player3 = new User();
        player3.setUsername("player3");
        player3.setElo(1300);
        User player4 = new User();
        player4.setUsername("player4");
        player4.setElo(1200);

        Match match1 = new Match();
        match1.setId("match1");
        match1.setPlayers(Arrays.asList("player1", "player4"));
        Match match2 = new Match();
        match2.setId("match2");
        match2.setPlayers(Arrays.asList("player2", "player3"));

        // Mock initial tournament state
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(userRepository.findByUsername("player1")).thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player2")).thenReturn(Optional.of(player2));
        when(userRepository.findByUsername("player3")).thenReturn(Optional.of(player3));
        when(userRepository.findByUsername("player4")).thenReturn(Optional.of(player4));
        when(matchRepository.save(any(Match.class)))
            .thenReturn(match1)
            .thenReturn(match2);

        // Create updated tournament state with bracket and matches
        Tournament updatedTournament = new Tournament();
        updatedTournament.setTournamentName(tournamentName);
        Tournament.Bracket bracket = new Tournament.Bracket();
        List<Tournament.Round> rounds = new ArrayList<>();
        Tournament.Round round = new Tournament.Round(Arrays.asList("match1", "match2"));
        rounds.add(round);
        bracket.setRounds(rounds);
        updatedTournament.setBracket(bracket);

        // Mock the save and second findByTournamentName for viewTournamentBracket
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(updatedTournament);
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament))
            .thenReturn(Optional.of(updatedTournament));
        when(matchRepository.findAllById(any()))
            .thenReturn(Arrays.asList(match1, match2));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        assertTrue(result.containsKey("rounds"));
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository, times(2)).save(any(Match.class));
    }

    @Test
    void generateBracket_WithSecondRound_ShouldIncludeWinners() {
        // Arrange
        String tournamentName = "TestTournament";
        
        // Setup initial tournament state
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3", "player4"));
        
        // Create first round with completed matches
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round1 = new Tournament.Round(Arrays.asList("match1", "match2"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round1)));
        tournament.setBracket(bracket);

        // Setup completed matches
        Match match1 = new Match();
        match1.setId("match1");
        match1.setPlayers(Arrays.asList("player1", "player2"));
        match1.setMatchWinner("player1");
        match1.setCompleted(true);

        Match match2 = new Match();
        match2.setId("match2");
        match2.setPlayers(Arrays.asList("player3", "player4"));
        match2.setMatchWinner("player3");
        match2.setCompleted(true);

        // Setup users with ELO
        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player3 = new User();
        player3.setUsername("player3");
        player3.setElo(1300);

        // Setup second round match
        Match finalMatch = new Match();
        finalMatch.setId("match3");
        finalMatch.setPlayers(Arrays.asList("player1", "player3"));

        // Mock repository calls
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        
        // Important: Mock ALL findAllById calls with specific arguments
        when(matchRepository.findAllById(Arrays.asList("match1", "match2")))
            .thenReturn(Arrays.asList(match1, match2));
        when(matchRepository.findAllById(Arrays.asList("match3")))
            .thenReturn(Arrays.asList(finalMatch));
        
        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player3"))
            .thenReturn(Optional.of(player3));

        when(matchRepository.save(any(Match.class)))
            .thenReturn(finalMatch);

        // Setup updated tournament with both rounds
        Tournament updatedTournament = new Tournament();
        updatedTournament.setTournamentName(tournamentName);
        updatedTournament.setPlayersPool(tournament.getPlayersPool());
        Tournament.Bracket updatedBracket = new Tournament.Bracket();
        List<Tournament.Round> updatedRounds = new ArrayList<>();
        updatedRounds.add(round1);
        Tournament.Round round2 = new Tournament.Round(Arrays.asList("match3"));
        updatedRounds.add(round2);
        updatedBracket.setRounds(updatedRounds);
        updatedTournament.setBracket(updatedBracket);

        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(updatedTournament);

        // Second findByTournamentName call for viewTournamentBracket
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament))
            .thenReturn(Optional.of(updatedTournament));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"), 
            "Result should not contain error: " + (result.containsKey("error") ? result.get("error") : ""));
        assertTrue(result.containsKey("rounds"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultRounds = (List<Map<String, Object>>) result.get("rounds");
        assertEquals(2, resultRounds.size());
        
        verify(tournamentRepository, times(2)).findByTournamentName(tournamentName);
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void generateBracket_WithCompletedFirstRound_ShouldCreateSecondRound() {
        // Arrange
        String tournamentName = "TestTournament";
        
        // Setup initial tournament state with first round completed
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3", "player4"));
        
        // Create first round with completed matches
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round1 = new Tournament.Round(Arrays.asList("match1", "match2"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round1)));
        tournament.setBracket(bracket);

        // Setup completed matches for first round
        Match match1 = new Match();
        match1.setId("match1");
        match1.setPlayers(Arrays.asList("player1", "player2"));
        match1.setMatchWinner("player1");
        match1.setCompleted(true);

        Match match2 = new Match();
        match2.setId("match2");
        match2.setPlayers(Arrays.asList("player3", "player4"));
        match2.setMatchWinner("player3");
        match2.setCompleted(true);

        // Setup users with ELO for proper seeding
        User player1 = new User();
        player1.setUsername("player1");
        player1.setElo(1500);
        User player3 = new User();
        player3.setUsername("player3");
        player3.setElo(1300);

        // Setup second round match
        Match match3 = new Match();
        match3.setId("match3");
        match3.setPlayers(Arrays.asList("player1", "player3"));

        // Mock repository calls in exact sequence
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament))
            .thenReturn(Optional.of(tournament));  // For viewTournamentBracket

        // IMPORTANT: Mock for getPlayersForNewRound - must return exact matches
        when(matchRepository.findAllById(round1.getMatches()))
            .thenReturn(Arrays.asList(match1, match2));

        when(userRepository.findByUsername("player1"))
            .thenReturn(Optional.of(player1));
        when(userRepository.findByUsername("player3"))
            .thenReturn(Optional.of(player3));

        when(matchRepository.save(any(Match.class)))
            .thenReturn(match3);

        // Setup updated tournament
        Tournament updatedTournament = new Tournament();
        updatedTournament.setTournamentName(tournamentName);
        updatedTournament.setPlayersPool(tournament.getPlayersPool());
        Tournament.Bracket updatedBracket = new Tournament.Bracket();
        List<Tournament.Round> updatedRounds = new ArrayList<>();
        updatedRounds.add(round1);
        Tournament.Round round2 = new Tournament.Round(Arrays.asList("match3"));
        updatedRounds.add(round2);
        updatedBracket.setRounds(updatedRounds);
        updatedTournament.setBracket(updatedBracket);

        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(updatedTournament);

        // Mock for viewTournamentBracket match retrieval
        when(matchRepository.findAllById(Arrays.asList("match3")))
            .thenReturn(Arrays.asList(match3));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"), 
            "Result should not contain error: " + (result.containsKey("error") ? result.get("error") : ""));
        assertTrue(result.containsKey("rounds"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultRounds = (List<Map<String, Object>>) result.get("rounds");
        assertEquals(2, resultRounds.size());
        
        // Verify repository calls
        verify(tournamentRepository, times(2)).findByTournamentName(tournamentName);
        verify(tournamentRepository).save(any(Tournament.class));
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void generateBracket_WithIncompleteMatches_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round1 = new Tournament.Round(Arrays.asList("match1"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round1)));
        tournament.setBracket(bracket);

        Match incompleteMatch = new Match();
        incompleteMatch.setId("match1");
        incompleteMatch.setCompleted(false);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(matchRepository.findAllById(any()))
            .thenReturn(Arrays.asList(incompleteMatch));

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertTrue(result.containsKey("error"));
        assertEquals("All matches in the previous round must be completed before generating a new round!", 
            result.get("error"));
    }

    @Test
    void generateBracket_WithPreliminaryRound_ShouldCreateMatches() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setPlayersPool(Arrays.asList("player1", "player2", "player3"));  // Non-power of 2

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        
        Match newMatch = new Match();
        newMatch.setId("match1");
        when(matchRepository.save(any(Match.class)))
            .thenReturn(newMatch);

        // Act
        Map<String, Object> result = bracketService.generateBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        verify(matchRepository).save(any(Match.class));
    }

    @Test
    void updateMatchResults_WithValidDetails_ShouldUpdateMatch() {
        // Arrange
        Match existingMatch = new Match();
        existingMatch.setId("match1");
        existingMatch.setPlayers(Arrays.asList("player1", "player2"));

        Match updatedDetails = new Match();
        updatedDetails.setId("match1");
        updatedDetails.setMatchWinner("player1");
        updatedDetails.setCompleted(true);

        when(matchRepository.findById("match1"))
            .thenReturn(Optional.of(existingMatch));
        when(matchRepository.save(any(Match.class)))
            .thenReturn(existingMatch);

        // Act
        Match result = bracketService.updateMatchResults(updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("player1", result.getMatchWinner());
        assertTrue(result.isCompleted());
    }

    @Test
    void viewTournamentBracket_WithValidTournament_ShouldReturnBracket() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round1 = new Tournament.Round(Arrays.asList("match1"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round1)));
        tournament.setBracket(bracket);

        Match match = new Match();
        match.setId("match1");
        match.setPlayers(Arrays.asList("player1", "player2"));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(matchRepository.findAllById(any()))
            .thenReturn(Arrays.asList(match));

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        assertTrue(result.containsKey("rounds"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rounds = (List<Map<String, Object>>) result.get("rounds");
        assertEquals(1, rounds.size());
    }

    @Test
    void updateTournamentEndDate_WithValidTournament_ShouldUpdateDate() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(tournamentRepository.save(any(Tournament.class)))
            .thenReturn(tournament);

        // Act
        Tournament result = bracketService.updateTournamentEndDate(tournamentName);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getEndDate());
        assertEquals(LocalDate.now(), result.getEndDate());
    }

    @Test
    void updateMatchResults_WithValidationErrors_ShouldThrowIllegalArgumentException() {
        // Arrange
        String matchId = "match1";
        Match newMatchDetails = new Match();
        newMatchDetails.setId(matchId);

        Match existingMatch = new Match();
        existingMatch.setId(matchId);

        when(matchRepository.findById(matchId))
            .thenReturn(Optional.of(existingMatch));

        // Mock validator to add an error
        doAnswer(invocation -> {
            Errors errors = invocation.getArgument(1);
            errors.rejectValue("matchWinner", "invalid", "Invalid match winner");
            return null;
        }).when(validator).validate(any(Match.class), any(Errors.class));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> bracketService.updateMatchResults(newMatchDetails)
        );

        assertEquals("Invalid match winner", exception.getMessage());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void updateMatchResults_WithUnexpectedError_ShouldThrowRuntimeException() {
        // Arrange
        String matchId = "match1";
        Match newMatchDetails = new Match();
        newMatchDetails.setId(matchId);

        when(matchRepository.findById(matchId))
            .thenReturn(Optional.of(new Match()));
        when(matchRepository.save(any()))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> bracketService.updateMatchResults(newMatchDetails)
        );

        assertEquals("Database error", exception.getMessage());
    }

    @Test
    void updateMatchResults_WithAllFieldsUpdated_ShouldUpdateSuccessfully() {
        // Arrange
        String matchId = "match1";
        Match existingMatch = new Match();
        existingMatch.setId(matchId);

        Match newMatchDetails = new Match();
        newMatchDetails.setId(matchId);
        newMatchDetails.setStartDate(LocalDateTime.now());
        newMatchDetails.setMatchWinner("player1");
        newMatchDetails.setCompleted(true);
        
        // Create sets using Match.Set type with proper structure
        List<Match.Set> sets = new ArrayList<>();
        Match.Set set1 = new Match.Set();
        set1.setResult(Arrays.asList(6, 4));  // player1 score: 6, player2 score: 4
        set1.setSetWinner("player1");
        
        Match.Set set2 = new Match.Set();
        set2.setResult(Arrays.asList(6, 3));  // player1 score: 6, player2 score: 3
        set2.setSetWinner("player1");
        
        sets.add(set1);
        sets.add(set2);
        newMatchDetails.setSets(sets);

        when(matchRepository.findById(matchId))
            .thenReturn(Optional.of(existingMatch));
        when(matchRepository.save(any(Match.class)))
            .thenReturn(existingMatch);
        
        // Use specific types for validate method
        doNothing().when(validator).validate(
            any(Match.class), 
            any(BeanPropertyBindingResult.class)
        );

        // Act
        Match result = bracketService.updateMatchResults(newMatchDetails);

        // Assert
        assertNotNull(result);
        assertEquals(newMatchDetails.getStartDate(), result.getStartDate());
        assertEquals(newMatchDetails.getMatchWinner(), result.getMatchWinner());
        assertTrue(result.isCompleted());
        assertEquals(newMatchDetails.getSets(), result.getSets());
        verify(matchRepository).save(existingMatch);
    }

    @Test
    void viewTournamentBracket_WithNullBracket_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        tournament.setBracket(null);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertTrue(result.containsKey("error"));
        assertEquals("Tournament's bracket is not formed yet!", result.get("error"));
    }

    @Test
    void viewTournamentBracket_WithEmptyRounds_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        
        Tournament.Bracket bracket = new Tournament.Bracket();
        bracket.setRounds(new ArrayList<>());
        tournament.setBracket(bracket);

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertTrue(result.containsKey("error"));
        assertEquals("Tournament's bracket is not formed yet!", result.get("error"));
    }

    @Test
    void viewTournamentBracket_WithValidBracket_ShouldReturnRounds() {
        // Arrange
        String tournamentName = "TestTournament";
        Tournament tournament = new Tournament();
        tournament.setTournamentName(tournamentName);
        
        // Create a bracket with one round
        Tournament.Bracket bracket = new Tournament.Bracket();
        Tournament.Round round = new Tournament.Round(Arrays.asList("match1"));
        bracket.setRounds(new ArrayList<>(Arrays.asList(round)));
        tournament.setBracket(bracket);

        // Create a match
        Match match = new Match();
        match.setId("match1");
        match.setPlayers(Arrays.asList("player1", "player2"));

        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.of(tournament));
        when(matchRepository.findAllById(any()))
            .thenReturn(Arrays.asList(match));

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("error"));
        assertTrue(result.containsKey("rounds"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rounds = (List<Map<String, Object>>) result.get("rounds");
        assertEquals(1, rounds.size());
        
        Map<String, Object> firstRound = rounds.get(0);
        assertEquals(0, firstRound.get("roundNumber"));
        
        @SuppressWarnings("unchecked")
        List<Match> matches = (List<Match>) firstRound.get("matches");
        assertEquals(1, matches.size());
        assertEquals("match1", matches.get(0).getId());
    }


    @Test
    void viewTournamentBracket_WithTournamentNotFound_ShouldReturnError() {
        // Arrange
        String tournamentName = "NonexistentTournament";
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenReturn(Optional.empty());

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertTrue(result.containsKey("error"));
        Map<?, ?> error = (Map<?, ?>) result.get("error");
        assertEquals("Tournament not found with name: " + tournamentName, error.get("error"));
    }

    @Test
    void viewTournamentBracket_WithUnexpectedError_ShouldReturnError() {
        // Arrange
        String tournamentName = "TestTournament";
        when(tournamentRepository.findByTournamentName(tournamentName))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        Map<String, Object> result = bracketService.viewTournamentBracket(tournamentName);

        // Assert
        assertTrue(result.containsKey("error"));
        Map<?, ?> error = (Map<?, ?>) result.get("error");
        assertEquals("An unexpected error occurred while viewing the tournament's bracket!", 
            error.get("error"));
    }






}
