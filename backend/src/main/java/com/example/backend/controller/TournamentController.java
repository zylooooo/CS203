package com.example.backend.controller;

import com.example.backend.model.Tournament;
import com.example.backend.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    private static final Logger logger = LoggerFactory.getLogger(TournamentController.class);

    @GetMapping
    public ResponseEntity<?> getAllTournaments() {
        try {
            logger.info("Received request to get all tournaments");
            List<Tournament> tournaments = tournamentService.getAllTournaments();
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            logger.error("Error getting all tournaments", e);
            return ResponseEntity.internalServerError().body("An error occurred while fetching tournaments");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getTournamentById(@PathVariable String id) {
        return tournamentService.getTournamentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Tournament createTournament(@RequestBody Tournament tournament) {
        return tournamentService.createTournament(tournament);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tournament> updateTournament(@PathVariable String id, @RequestBody Tournament tournamentDetails) {
        Tournament updatedTournament = tournamentService.updateTournament(id, tournamentDetails);
        return ResponseEntity.ok(updatedTournament);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTournament(@PathVariable String id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok().build();
    }
}
