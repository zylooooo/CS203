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

    public Map<String, Object> generateBracket(Tournament tournament) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> error = new HashMap<>();

        try {
            // Get a copy of the players pool from the tournament object
            List<String> playersPool = new ArrayList<>(tournament.getPlayersPool());
            int actualPlayerSize = playersPool.size();

            // Get the rounds list from the tournament object and then populate it with the list of matches
            List<Tournament.Round> rounds = tournament.getBracket().getRounds();
            // New list of match ids
            List<String> matches = new ArrayList<>();

            if (!isPowerOfTwo(actualPlayerSize)) {
                logger.info("Actual player size is not a power of two, forming a preliminary round");
                int nextPowerOfTwo = 1;
                while (nextPowerOfTwo < actualPlayerSize) {
                    nextPowerOfTwo *= 2;
                }
                int numberOfPreliminaryPlayers = (actualPlayerSize - (nextPowerOfTwo / 2)) * 2;

                // Shuffle the players pool and pick out randomly the number of preliminary players who are going to be playing in the preliminary round
                Collections.shuffle(playersPool);
                List<String> preliminaryPlayersPool = playersPool.subList(0, numberOfPreliminaryPlayers);

                for (int i = 0; i < numberOfPreliminaryPlayers / 2; i++) {
                    // For each player pair, create a new match and save it to the database
                    Match match = new Match();
                    match.setTournamentName(tournament.getTournamentName());
                    List<String> players = new ArrayList<>();
                    players.add(preliminaryPlayersPool.get(i));
                    players.add(preliminaryPlayersPool.get(preliminaryPlayersPool.size() - 1 - i));
                    match.setPlayers(players);
                    matchRepository.save(match);
                    matches.add(match.getId());
                }
            } else {
                logger.info("Actual player size is a power of two, forming an actual bracket");
                // Sort the players pool by elo in descending order
                List<String> sortedPlayers = playersPool.stream()
                    .map(username -> userRepository.findByUsername(username)
                        .orElseThrow(() -> new UserNotFoundException(username)))
                    .sorted(Comparator.comparingInt(User::getElo).reversed())
                    .map(User::getUsername)
                    .collect(Collectors.toList());
                logger.info("Sorted players: {}", sortedPlayers);

                int numberOfMatches = sortedPlayers.size() / 2;
                for (int i = 0; i < numberOfMatches; i++) {
                    // For each player pair, create a new match and save it to the databsase
                    Match match = new Match();
                    match.setTournamentName(tournament.getTournamentName());
                    List<String> players = new ArrayList<>();
                    players.add(sortedPlayers.get(i));
                    players.add(sortedPlayers.get(sortedPlayers.size() - 1 - i));
                    match.setPlayers(players);
                    matchRepository.save(match);
                    matches.add(match.getId());
                }
            } 

            // Add the list of match ids to the rounds and then add the rounds to the brackets
            rounds.add(new Tournament.Round(matches));
            tournament.setBracket(new Tournament.Bracket(rounds));
            response.put("tournament", tournamentRepository.save(tournament));

            // Return the list of the match objects that were created
            List<Match> matchesList = matchRepository.findByTournamentName(tournament.getTournamentName())
                .orElseThrow(() -> new MatchNotFoundException(tournament.getTournamentName()));
            response.put("matches", matchesList);
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

    // Helper method to check if the number of players is a power of two
    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
    
}
