package com.example.MIniLin.controllers;

import com.example.MIniLin.models.Connexion;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.ConnexionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/connexions")
@CrossOrigin(origins = "http://localhost:5174")
public class ConnexionController {

    @Autowired
    private ConnexionService connexionService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId(Principal principal) {
        Optional<User> user = userRepository.findByEmail(principal.getName());
        return user.map(User::getId).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @PostMapping("/envoyer/{destinataireId}")
    public ResponseEntity<?> envoyerDemande(@PathVariable Long destinataireId, Principal principal) {
        try {
            Long demandeurId = getCurrentUserId(principal);
            Connexion connexion = connexionService.envoyerDemande(demandeurId, destinataireId);
            return ResponseEntity.ok(connexion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accepter/{demandeId}")
    public ResponseEntity<?> accepterDemande(@PathVariable Long demandeId, Principal principal) {
        try {
            Long utilisateurId = getCurrentUserId(principal);
            Connexion connexion = connexionService.accepterDemande(demandeId, utilisateurId);
            return ResponseEntity.ok(connexion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refuser/{demandeId}")
    public ResponseEntity<?> refuserDemande(@PathVariable Long demandeId, Principal principal) {
        try {
            Long utilisateurId = getCurrentUserId(principal);
            Connexion connexion = connexionService.refuserDemande(demandeId, utilisateurId);
            return ResponseEntity.ok(connexion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/recues")
    public ResponseEntity<List<Connexion>> listerDemandesRecues(Principal principal) {
        Long utilisateurId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.listerDemandesRecues(utilisateurId));
    }

    @GetMapping("/envoyees")
    public ResponseEntity<List<Connexion>> listerDemandesEnvoyees(Principal principal) {
        Long utilisateurId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.listerDemandesEnvoyees(utilisateurId));
    }

    @GetMapping("/acceptees")
    public ResponseEntity<List<Connexion>> listerConnexionsAcceptees(Principal principal) {
        Long utilisateurId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.listerConnexionsAcceptees(utilisateurId));
    }

    @GetMapping("/rechercher")
    public ResponseEntity<List<User>> rechercherUtilisateurs(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String filiere,
            @RequestParam(required = false) String niveauEtudes,
            @RequestParam(required = false) String universite,
            @RequestParam(required = false) String competence,
            Principal principal) {
        Long currentUserId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.rechercherUtilisateursFiltres(currentUserId, query, role, filiere, niveauEtudes, universite, competence));
    }

    @DeleteMapping("/{connexionId}")
    public ResponseEntity<?> supprimerConnexion(@PathVariable Long connexionId, Principal principal) {
        try {
            Long utilisateurId = getCurrentUserId(principal);
            connexionService.supprimerConnexion(connexionId, utilisateurId);
            return ResponseEntity.ok("Connexion supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<User>> getSuggestions(
            @RequestParam(defaultValue = "8") int limit,
            Principal principal) {
        Long utilisateurId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.suggestions(utilisateurId, limit));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countConnexions(Principal principal) {
        Long userId = getCurrentUserId(principal);
        return ResponseEntity.ok(connexionService.countConnexions(userId));
    }
}
