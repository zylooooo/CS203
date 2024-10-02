package com.example.backend.service;

import com.example.backend.model.Tournament;
import com.example.backend.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    public Optional<Tournament> getTournamentById(String id) {
        return tournamentRepository.findById(id);
    }

    public Tournament createTournament(Tournament tournament) {
        if (tournamentRepository.existsByName(tournament.getName())) {
            throw new RuntimeException("Tournament name already exists");
        }
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());
        return tournamentRepository.save(tournament);
    }
    
    public Tournament updateTournament(String id, Tournament tournamentDetails) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    

            if (!tournament.getName().equals(tournamentDetails.getName()) && 
            tournamentRepository.existsByName(tournamentDetails.getName())) {
            throw new RuntimeException("Tournament name already exists");
            }
        tournament.setName(tournamentDetails.getName());
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
