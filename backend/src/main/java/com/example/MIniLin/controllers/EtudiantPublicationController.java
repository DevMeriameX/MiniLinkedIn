package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.ModifierPublicationRequest;
import com.example.MIniLin.dtos.PublicationRequest;
import com.example.MIniLin.dtos.PublicationResponse;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/etudiant")
public class EtudiantPublicationController {

    @Autowired
    private PublicationService publicationService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Principal principal) {
        if (principal == null) {
            System.out.println("[EtudiantPublicationController] Principal is null");
            throw new RuntimeException("Non authentifié");
        }
        String email = principal.getName();
        System.out.println("[EtudiantPublicationController] Fetching user for email: " + email);
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + email));
    }

    @PostMapping(value = "/publications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerPublication(
            Principal principal,
            @ModelAttribute PublicationRequest request) {
        try {
            Long etudiantId = getUserId(principal);
            PublicationResponse response = publicationService.creerPublication(etudiantId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "publication", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping(value = "/publications/{publicationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modifierPublication(
            Principal principal,
            @PathVariable Long publicationId,
            @ModelAttribute ModifierPublicationRequest request) {
        try {
            Long etudiantId = getUserId(principal);
            PublicationResponse response = publicationService.modifierPublication(publicationId, etudiantId, request);
            return ResponseEntity.ok(Map.of("success", true, "publication", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/publications/{publicationId}")
    public ResponseEntity<?> supprimerPublication(
            Principal principal,
            @PathVariable Long publicationId) {
        try {
            Long etudiantId = getUserId(principal);
            publicationService.supprimerPublication(publicationId, etudiantId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Supprimé"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/publications")
    public ResponseEntity<?> getMesPublications(Principal principal) {
        try {
            Long etudiantId = getUserId(principal);
            List<PublicationResponse> publications = publicationService.getPublicationsByEnseignant(etudiantId);
            return ResponseEntity.ok(Map.of("success", true, "publications", publications));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
