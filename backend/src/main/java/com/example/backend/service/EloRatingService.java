package com.example.backend.service;

import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.model.Match;
import com.example.backend.model.Tournament;
import com.example.backend.model.User;
import com.example.backend.exception.MatchNotFoundException;
import com.example.backend.exception.TournamentNotFoundException;
import com.example.backend.exception.UserNotFoundException;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EloRatingService {
    private static final Logger logger = LoggerFactory.getLogger(EloRatingService.class);
    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;

    /**
     * Updates the Elo rating of users based on the match results.
     * 
     * @param matchId the ID of the match for which to update the Elo ratings.
     * @throws MatchNotFoundException if no match with the given ID is found.
     * @throws UserNotFoundException if a user involved in the match is not found.
     * @throws TournamentNotFoundException if the tournament associated with the match is not found.
     * @throws RuntimeException if an unexpected error occurs during the update process.
     */
    public void updateEloRating(String matchId) {
        try {
            // Find the match from the repository with the id provided
            Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchNotFoundException("Match not found"));
            
            // Get the players that have participated in the match
            List<String> players = match.getPlayers();
            if (players == null || players.isEmpty()) {
                logger.error("No players found in the match!");
                throw new UserNotFoundException();
            }
            User player0 = userRepository.findByUsername(players.get(0))
                .orElseThrow(() -> new UserNotFoundException(players.get(0)));
            User player1 = userRepository.findByUsername(players.get(1))
                .orElseThrow(() -> new UserNotFoundException(players.get(1)));
            
            // Find the tournament with the tournament name from match
            String tournamentName = match.getTournamentName();
            if (tournamentName == null || tournamentName.isEmpty()) {
                logger.error("Tournament name is not present in the match!");
                throw new TournamentNotFoundException();
            }
            Tournament tournament = tournamentRepository.findByTournamentName(tournamentName)
                .orElseThrow(() -> new TournamentNotFoundException(tournamentName));


            // Initialize the variables needed to calculate the elo rating
            int player0Elo = player0.getElo();
            int player1Elo = player1.getElo();
            double expectedWinning0 = calculateExpectedWinning(player0Elo, player1Elo);
            double expectedWinning1 = calculateExpectedWinning(player1Elo, player0Elo);
            // The actual result of the match, the winner will get 1.0 and the loser will get 0.0
            double acctualResult0 = match.getMatchWinner().equals(player0.getUsername()) ? 1.0 : 0.0;
            double acctualResult1 = match.getMatchWinner().equals(player1.getUsername()) ? 1.0 : 0.0;
            // Get the dynamic k-factor for the specific match
            double kFactor = getDynamicKFactor(tournament, match, player0, player1);

            // Calculate the new elo rating for the players
            double newElo0 = player0Elo + kFactor * (acctualResult0 - expectedWinning0);
            double newElo1 = player1Elo + kFactor * (acctualResult1 - expectedWinning1);

            // Update the elo rating of the players
            player0.setElo((int) newElo0);
            player1.setElo((int) newElo1);

            // Save the updated elo rating of the players
            userRepository.save(player0);
            userRepository.save(player1);
            return;
        } catch (MatchNotFoundException | TournamentNotFoundException | UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred while updating the elo rating", e);
        }
    }

    /**
     * Calculates the expected winning probability of a player based on their Elo rating.
     * 
     * @param player0Elo the Elo rating of the first player.
     * @param player1Elo the Elo rating of the second player.
     * @return the expected winning probability of the first player.
     */
    private double calculateExpectedWinning(int player0Elo, int player1Elo) {
        return 1.0 / (1.0 + Math.pow(10, ((double) player1Elo - (double) player0Elo) / 400.0));
    }

    /**
     * Calculates the dynamic K-factor for a match based on tournament and player details.
     * 
     * @param tournament the tournament in which the match is played.
     * @param match the match for which to calculate the K-factor.
     * @param player0 the first player involved in the match.
     * @param player1 the second player involved in the match.
     * @return the calculated K-factor.
     */
    private double getDynamicKFactor(Tournament tournament, Match match, User player0, User player1) {
        // Set the base k-factor to be the number of players in the tournament
        double k = tournament.getPlayersPool().size();
        
        /*
        * Change the k-factor based on their elo difference
        * If the elo difference is greater than 100, means that it is expected to be a lopsided match.
        * If the user with the lower elo won, the k-factor will be increased 
        * If the user with the higher elo won, the k-factor will be decreased
        * This favors the underdogs and rewards players for winning in a match against their favor
        */ 
        int eloDifference = Math.abs(player0.getElo() - player1.getElo());
        if (eloDifference > 100) {
            // Find the player with the lower elo
            User lowerEloPlayer = player0.getElo() < player1.getElo() ? player0 : player1;
            if (match.getMatchWinner().equals(lowerEloPlayer.getUsername())) {
                k += 5.0;
            } else {
                k -= 5.0;
            }
        }

        // Change the k-factor based on the round that the players are competing in
        int totalRounds = tournament.getBracket().getRounds().size();
        /*
         * The reason for choosing 6 is to handle cases where
         * The tournament has too little rounds for the quarter-finals to be a significant achievement
         * Minimal number of rounds for quarteer-finals is 3 hence the tournament need to have at least twice the number of rounds to make reaching the quarter-finals a significant achievement
         */
        if (totalRounds >= 6) {
            int roundIndex = 0;
            List<Tournament.Round> rounds = tournament.getBracket().getRounds();
            for (int i = 0; i < totalRounds; i++) {
                if (rounds.get(i).getMatches().contains(match.getId())) {
                    roundIndex = i;
                    break;
                }
            }

            // The later stage into the tournament, the higher the k-factor
            int quarterFinalIndex = totalRounds - 3;
            if (roundIndex == quarterFinalIndex) {
                k += 4.0;
            } else if (roundIndex == quarterFinalIndex + 1) {
                k += 8.0;
            } else if (roundIndex == quarterFinalIndex + 2) {
                k += 16.0;
            }
        }

        /*
         * Ensure that the k-factor does not fall too low. 
         * When the k-factor is too low, the elo change will be too unresponsive
         * Conventionally, the threshold is set to 16.0 based on other games such as chess
         */
        if (k < 16.0) {
            k = 16.0;
        }

        return k;
    }

}