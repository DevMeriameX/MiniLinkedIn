package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.OffreRequestDTO;
import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.OffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enseignant/offres")
public class OffreController {

    @Autowired
    private OffreService offreService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<?> getOffres(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) List<String> types) {
        Long userId = getCurrentUserId();
        List<OffreResponseDTO> offres = offreService.getOffresForEnseignant(userId, statut, types);
        return ResponseEntity.ok(Map.of("count", offres.size(), "offres", offres));
    }

    @PostMapping
    public ResponseEntity<OffreResponseDTO> creerOffre(@RequestBody OffreRequestDTO dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(offreService.creerOffre(userId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OffreResponseDTO> modifierOffre(@PathVariable Long id, @RequestBody OffreRequestDTO dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(offreService.modifierOffre(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerOffre(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        offreService.supprimerOffre(userId, id);
        return ResponseEntity.ok(Map.of("message", "Offre supprimée avec succès"));
    }

    @PatchMapping("/{id}/archiver")
    public ResponseEntity<OffreResponseDTO> archiverOffre(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(offreService.changerStatut(userId, id, "archivee"));
    }

    @PatchMapping("/{id}/reactiver")
    public ResponseEntity<OffreResponseDTO> reactiverOffre(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(offreService.changerStatut(userId, id, "active"));
    }
}
