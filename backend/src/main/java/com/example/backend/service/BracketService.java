package com.example.backend.service;

import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.model.Tournament;
import com.example.backend.model.Match;
import com.example.backend.model.User;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.MatchNotFoundException;
import com.example.backend.exception.TournamentNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.Errors;
import org.springframework.validation.BeanPropertyBindingResult;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BracketService {

    private static final Logger logger = LoggerFactory.getLogger(BracketService.class);

    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final LocalValidatorFactoryBean validator;

    /**
     * Generates a bracket for the given tournament.
     * 
     * @param tournamentName The name of the tournament for which to generate a bracket.
     * @return A map containing the rounds of matches generated for the tournament or an error message.
     */
    public Map<String, Object> generateBracket(String tournamentName) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> error = new HashMap<>();

        try {
            Tournament existingTournament = tournamentRepository.findByTournamentName(tournamentName)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

            // Initialize the bracket if it's null
            if (existingTournament.getBracket() == null) {
                existingTournament.setBracket(new Tournament.Bracket());
            }

            // Initialize the rounds if they're null
            if (existingTournament.getBracket().getRounds() == null) {
                existingTournament.getBracket().setRounds(new ArrayList<>());
            }

            List<String> playersForNewRound = getPlayersForNewRound(existingTournament);
            List<String> newMatches = createNewRound(existingTournament, playersForNewRound);
            if (playersForNewRound.isEmpty() || newMatches.isEmpty()) {
                response.put("error", "No matches can be generated for the new round!");
                return response;
            }

            // Add the new round to the tournament bracket
            existingTournament.getBracket().getRounds().add(new Tournament.Round(newMatches));
            existingTournament.setUpdatedAt(LocalDateTime.now());
            
            // Save the updated tournament
            Tournament savedTournament = tournamentRepository.save(existingTournament);

            // Fetch all of the matches grouped by the round
            List<Map<String, Object>> roundsWithMatches = new ArrayList<>();
            for (int i = 0; i < savedTournament.getBracket().getRounds().size(); i++) {
                Tournament.Round round = savedTournament.getBracket().getRounds().get(i);
                List<Match> matchesInRound = matchRepository.findAllById(round.getMatches());

                Map<String, Object> roundMap = new HashMap<>();
                roundMap.put("roundNumber", i);
                roundMap.put("matches", matchesInRound);
                roundsWithMatches.add(roundMap);
            }

            response.put("rounds", roundsWithMatches);
            return response;
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
     * Determines the players eligible for the new round in the tournament.
     * 
     * @param tournament The tournament for which to determine eligible players.
     * @return A list of player usernames eligible for the new round.
     * @throws MatchNotFoundException if a match is not found during the process.
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
     * Creates a new round of matches based on the players available.
     * 
     * @param tournament The tournament for which to create the new round.
     * @param playersForNewRound The list of players eligible for the new round.
     * @return A list of match IDs for the newly created matches.
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
     * 
     * @param tournament The tournament for which to generate the preliminary round.
     * @param players The list of players participating in the preliminary round.
     * @param newMatches The list to which the new match IDs will be added.
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
     * 
     * @param tournament The tournament for which to generate the proper bracket.
     * @param players The list of players participating in the bracket.
     * @param newMatches The list to which the new match IDs will be added.
     */
    private void generateProperBracket(Tournament tournament, List<String> players, List<String> newMatches) {
        logger.info("Forming bracket for round: " + tournament.getBracket().getRounds().size());
        
        List<Tournament.Round> rounds = tournament.getBracket().getRounds();
        if (rounds.isEmpty()) {
            rounds.add(new Tournament.Round(new ArrayList<>()));
        }

        if (rounds.size() == 1) {
            List<String> sortedPlayers = sortPlayersByElo(players);
            for (int i = 0; i < sortedPlayers.size() / 2; i++) {
                Match match = createMatch(
                    tournament, 
                    sortedPlayers.get(i), 
                    sortedPlayers.get(sortedPlayers.size() - 1 - i)
                );
                newMatches.add(match.getId());
            }
        } else {
            for (int i = 0; i < players.size() - 1; i += 2) {
                Match match = createMatch(
                    tournament, 
                    players.get(i), 
                    players.get(i + 1)
                );
                newMatches.add(match.getId());
            }
        }
    }

    /**
     * Creates and saves a new match in the database.
     * 
     * @param tournament The tournament in which the match is being created.
     * @param player1 The username of the first player.
     * @param player2 The username of the second player.
     * @return The created Match object.
     */
    private Match createMatch(Tournament tournament, String player1, String player2) {
        Match match = new Match();
        match.setTournamentName(tournament.getTournamentName());
        match.setPlayers(Arrays.asList(player1, player2));
        return matchRepository.save(match);
    }

    /**
     * Sorts players by their ELO rating in descending order.
     * 
     * @param players The list of player usernames to be sorted.
     * @return A list of player usernames sorted by ELO rating.
     * @throws UserNotFoundException if a user is not found during the sorting process.
     */
    private List<String> sortPlayersByElo(List<String> players) throws UserNotFoundException {
        return players.stream()
            .map(username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username)))
            .sorted(Comparator.comparingInt(User::getElo).reversed())
            .map(User::getUsername)
            .collect(Collectors.toList());
    }

    /**
     * Checks if a number is a power of two.
     * 
     * @param n The number to check.
     * @return True if the number is a power of two, false otherwise.
     */
    private boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    /**
     * Calculates the number of players needed for a preliminary round.
     * 
     * @param playerCount The total number of players participating.
     * @return The count of players needed for the preliminary round.
     */
    private int calculatePreliminaryPlayersCount(int playerCount) {
        int nextPowerOfTwo = Integer.highestOneBit(playerCount - 1) << 1;
        return (playerCount - (nextPowerOfTwo / 2)) * 2;
    }

    /**
     * Updates the match results based on the provided match details.
     * 
     * @param newMatchDetails The Match object containing the updated match details.
     * @return The updated Match object.
     * @throws IllegalArgumentException if the match details are invalid.
     * @throws Exception if an unexpected error occurs during the update process.
     */
    public Match updateMatchResults(Match newMatchDetails) {
        try {
            // First verify the match exists
            Match existingMatch = matchRepository.findById(newMatchDetails.getId())
                .orElseThrow(() -> new MatchNotFoundException("Match not found with ID: " + newMatchDetails.getId()));

            // Validate the match details
            Errors errors = new BeanPropertyBindingResult(newMatchDetails, "match");
            validator.validate(newMatchDetails, errors);

            if (errors.hasErrors()) {
                List<String> errorMessages = errors.getAllErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
                throw new IllegalArgumentException(String.join(", ", errorMessages));
            }

            if (newMatchDetails.getStartDate() != null) {
                existingMatch.setStartDate(newMatchDetails.getStartDate());
            } 
            if (newMatchDetails.getMatchWinner() != null) {
                existingMatch.setMatchWinner(newMatchDetails.getMatchWinner());
            } 
            if (newMatchDetails.isCompleted()) {
                existingMatch.setCompleted(true);
            }
            if (newMatchDetails.getSets() != null) {
                existingMatch.setSets(newMatchDetails.getSets());
            }

            // Update the match details in the database
            return matchRepository.save(existingMatch);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
    
    /**
     * Updates the end date of a tournament.
     * 
     * @param tournamentName The name of the tournament to update.
     * @return The updated Tournament object.
     * @throws TournamentNotFoundException if no tournament with the given name is found.
     */
    public Tournament updateTournamentEndDate(String tournamentName) {
        Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
            .orElseThrow(() -> new TournamentNotFoundException(tournamentName));

        tournament.setEndDate(LocalDate.now());
        return tournamentRepository.save(tournament);
    }
}
