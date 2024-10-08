package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    private static final Logger logger = LoggerFactory.getLogger(TournamentService.class);

    public List<Tournament> getAllTournaments() {
        try {
            logger.info("Attempting to fetch all tournaments");
            List<Tournament> tournaments = tournamentRepository.findAll();
            logger.info("Successfully fetched {} tournaments", tournaments.size());
            return tournaments;
        } catch (Exception e) {
            logger.error("Error fetching all tournaments", e);
            throw new RuntimeException("Error fetching tournaments", e);
        }
    }

    // Function to get tournament that are still ongoing
    @Async("taskExecutor")
    public CompletableFuture<List<Tournament>> getOngoingTournaments() throws RuntimeException, Exception {
        try {
            logger.info("Attempting to fetch ongoing tournaments!");
            LocalDate currentDate = LocalDate.now();
            List<Tournament> ongoingTournaments = tournamentRepository.findOngoingTournaments(currentDate)
                .orElseThrow(() -> new RuntimeException("No ongoing tournaments found!"));
            logger.info("Successfully fetched {} ongoing tournaments", ongoingTournaments.size());
            return CompletableFuture.completedFuture(ongoingTournaments);
        } catch (Exception e) {
            logger.error("Error fetching ongoing tournaments", e);
            throw new Exception("Unexpected error occurred while fetching ongoing tournaments", e);
        }
    }

    public Optional<Tournament> getTournamentById(String id) {
        return tournamentRepository.findById(id);
    }

    public Tournament createTournament(Tournament tournament) {
        if (tournamentRepository.existsByTournamentName(tournament.getTournamentName())) {
            throw new RuntimeException("Tournament name already exists");
        }
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());
        return tournamentRepository.save(tournament);
    }
    
    public Tournament updateTournament(String id, Tournament tournamentDetails) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    

            if (!tournament.getTournamentName().equals(tournamentDetails.getTournamentName()) && 
            tournamentRepository.existsByTournamentName(tournamentDetails.getTournamentName())) {
            throw new RuntimeException("Tournament name already exists");
            }
        tournament.setTournamentName(tournamentDetails.getTournamentName());
        tournament.setStartDate(tournamentDetails.getStartDate());
        tournament.setEndDate(tournamentDetails.getEndDate());
        tournament.setLocation(tournamentDetails.getLocation());
        tournament.setEloRange(tournamentDetails.getEloRange());
        tournament.setGender(tournamentDetails.getGender());
        tournament.setPlayersPool(tournamentDetails.getPlayersPool());
        tournament.setMatches(tournamentDetails.getMatches());
        tournament.setPlayerCapacity(tournamentDetails.getPlayerCapacity());
        tournament.setUpdatedAt(LocalDateTime.now());
    
        return tournamentRepository.save(tournament);
    }

    public void deleteTournament(String id) {
        tournamentRepository.deleteById(id);
    }
}
