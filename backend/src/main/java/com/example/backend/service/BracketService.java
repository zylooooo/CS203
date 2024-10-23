package com.example.backend.service;

import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.model.Tournament;
import com.example.backend.model.Match;
import com.example.backend.model.User;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.MatchNotFoundException;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BracketService {

    private static final Logger logger = LoggerFactory.getLogger(BracketService.class);

    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    /**
     * Generates a bracket for the given tournament.
     * 
     * @param tournament The tournament for which to generate a bracket.
     * @return A map containing the updated tournament and the newly created matches.
     */
    public Map<String, Object> generateBracket(Tournament tournament) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> error = new HashMap<>();

        try {
            // Initialize the bracket if it's null
            if (tournament.getBracket() == null) {
                tournament.setBracket(new Tournament.Bracket());
            }

            // Initialize the rounds if they're null
            if (tournament.getBracket().getRounds() == null) {
                tournament.getBracket().setRounds(new ArrayList<>());
            }

            List<String> playersForNewRound = getPlayersForNewRound(tournament);
            List<String> newMatches = createNewRound(tournament, playersForNewRound);
            if (playersForNewRound.isEmpty() || newMatches.isEmpty()) {
                response.put("error", "No matches can be generated for the new round!");
                return response;
            }

            // Add the new round to the tournament bracket
            tournament.getBracket().getRounds().add(new Tournament.Round(newMatches));
            
            // Save the updated tournament
            Tournament savedTournament = tournamentRepository.save(tournament);
            response.put("tournament", savedTournament);

            // Fetch and return only the matches from the most recent round
            List<Match> mostRecentMatches = matchRepository.findAllById(newMatches);
            response.put("matches", mostRecentMatches);

        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", e.getMessage(), e);
            error.put("error", e.getMessage());
            response.put("error", error);
        } catch (MatchNotFoundException e) {
            logger.error("Match not found: {}", e.getMessage(), e);
            error.put("error", e.getMessage());
            response.put("error", error);
        } catch (Exception e) {
            logger.error("An unexpected error occurred while generating the bracket: {}", e.getMessage(), e);
            error.put("error", "An unexpected error occurred while generating the bracket!");
            response.put("error", error);
        }
        return response;
    }

    /**
     * Determines the players for the new round.
     * @throws MatchNotFoundException if a match is not found
     */
    private List<String> getPlayersForNewRound(Tournament tournament) throws MatchNotFoundException {
        List<String> tournamentPlayersPool = new ArrayList<>(tournament.getPlayersPool());
        if (tournament.getBracket() == null || tournament.getBracket().getRounds().isEmpty()) {
            return tournamentPlayersPool;
        }

        Set<String> playersParticipated = new HashSet<>();
        List<String> winners = new ArrayList<>();
        List<Tournament.Round> rounds = tournament.getBracket().getRounds();

        for (int i = 0; i < rounds.size(); i++) {
            Tournament.Round round = rounds.get(i);
            List<Match> matches = matchRepository.findAllById(round.getMatches());
            if (matches.size() != round.getMatches().size()) {
                throw new MatchNotFoundException("One or more matches not found for round " + i);
            }
            
            for (Match match : matches) {
                playersParticipated.addAll(match.getPlayers());
                
                if (i == rounds.size() - 1 && match.getMatchWinner() != null) {
                    winners.add(match.getMatchWinner());
                }
            }
        }

        List<String> playersForNewRound = tournamentPlayersPool.stream()
            .filter(player -> !playersParticipated.contains(player))
            .collect(Collectors.toList());

        playersForNewRound.addAll(winners);
        return playersForNewRound;
    }

    /**
     * Creates a new round of matches.
     */
    private List<String> createNewRound(Tournament tournament, List<String> playersForNewRound) {
        List<String> newMatches = new ArrayList<>();
        if (!isPowerOfTwo(playersForNewRound.size())) {
            generatePreliminaryRound(tournament, playersForNewRound, newMatches);
        } else {
            generateProperBracket(tournament, playersForNewRound, newMatches);
        }
        return newMatches;
    }

    /**
     * Generates a preliminary round when the number of players is not a power of two.
     */
    private void generatePreliminaryRound(Tournament tournament, List<String> players, List<String> newMatches) {
        logger.info("Forming a preliminary round");
        int preliminaryPlayersCount = calculatePreliminaryPlayersCount(players.size());
        Collections.shuffle(players);
        
        for (int i = 0; i < preliminaryPlayersCount / 2; i++) {
            Match match = createMatch(tournament, players.get(i), players.get(preliminaryPlayersCount - 1 - i));
            newMatches.add(match.getId());
        }
    }

    /**
     * Generates a proper bracket when the number of players is a power of two.
     */
    private void generateProperBracket(Tournament tournament, List<String> players, List<String> newMatches) {
        logger.info("Forming an actual bracket");

        List<Tournament.Round> rounds = tournament.getBracket().getRounds();
        if (rounds.isEmpty()) {
            rounds.add(new Tournament.Round(new ArrayList<>()));
        }

        List<String> sortedPlayers = sortPlayersByElo(players);

        for (int i = 0; i < sortedPlayers.size() / 2; i++) {
            Match match = createMatch(tournament, sortedPlayers.get(i), sortedPlayers.get(sortedPlayers.size() - 1 - i));
            newMatches.add(match.getId());
        }
    }

    /**
     * Creates and saves a new match.
     */
    private Match createMatch(Tournament tournament, String player1, String player2) {
        Match match = new Match();
        match.setTournamentName(tournament.getTournamentName());
        match.setPlayers(Arrays.asList(player1, player2));
        return matchRepository.save(match);
    }

    /**
     * Sorts players by their ELO rating in descending order.
     * @throws UserNotFoundException if a user is not found
     */
    private List<String> sortPlayersByElo(List<String> players) throws UserNotFoundException {
        return players.stream()
            .map(username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username)))
            .sorted(Comparator.comparingInt(User::getElo).reversed())
            .map(User::getUsername)
            .collect(Collectors.toList());
    }

    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    private int calculatePreliminaryPlayersCount(int playerCount) {
        int nextPowerOfTwo = Integer.highestOneBit(playerCount - 1) << 1;
        return (playerCount - (nextPowerOfTwo / 2)) * 2;
    }
}
