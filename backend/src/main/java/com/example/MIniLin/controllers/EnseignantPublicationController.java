// EnseignantPublicationController.java
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/enseignant")
@CrossOrigin(origins = "http://localhost:5174")
public class EnseignantPublicationController {

    @Autowired
    private PublicationService publicationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * RÉCUPÉRER MON ID ENSEIGNANT (via Token JWT)
     * GET /api/enseignant/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyId(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non authentifié");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("nomComplet", user.getNomComplet());
            response.put("role", user.getRole());
            response.put("photo", user.getPhoto());
            response.put("document", user.getDocument());
            response.put("bio", user.getBio());
            response.put("labo", user.getLabo());
            response.put("depart", user.getDepart());
            response.put("filiere", user.getFiliere());
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Enseignant non trouvé");
    }

    /**
     * CRÉER UNE PUBLICATION (avec fichier PDF ou image)
     * POST /api/enseignant/{enseignantId}/publications
     */
    @PostMapping(value = "/{enseignantId}/publications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerPublication(
            @PathVariable Long enseignantId,
            @ModelAttribute PublicationRequest request) {
        try {
            PublicationResponse response = publicationService.creerPublication(enseignantId, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Publication créée avec succès. En attente de validation par l'administrateur.");
            result.put("publication", response);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * MODIFIER UNE PUBLICATION (seulement le contenu textuel)
     * PUT /api/enseignant/{enseignantId}/publications/{publicationId}
     */
    @PutMapping("/{enseignantId}/publications/{publicationId}")
    public ResponseEntity<?> modifierPublication(
            @PathVariable Long enseignantId,
            @PathVariable Long publicationId,
            @RequestBody ModifierPublicationRequest request) {
        try {
            PublicationResponse response = publicationService.modifierPublication(publicationId, enseignantId, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Publication modifiée avec succès");
            result.put("publication", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * SUPPRIMER UNE PUBLICATION
     * DELETE /api/enseignant/{enseignantId}/publications/{publicationId}
     */
    @DeleteMapping("/{enseignantId}/publications/{publicationId}")
    public ResponseEntity<?> supprimerPublication(
            @PathVariable Long enseignantId,
            @PathVariable Long publicationId) {
        try {
            publicationService.supprimerPublication(publicationId, enseignantId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Publication supprimée avec succès");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * LISTER MES PUBLICATIONS
     * GET /api/enseignant/{enseignantId}/publications
     */
    @GetMapping("/{enseignantId}/publications")
    public ResponseEntity<?> getMesPublications(@PathVariable Long enseignantId) {
        try {
            List<PublicationResponse> publications = publicationService.getPublicationsByEnseignant(enseignantId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("count", publications.size());
            result.put("publications", publications);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * VOIR UNE PUBLICATION SPÉCIFIQUE
     * GET /api/enseignant/publications/{publicationId}
     */
    @GetMapping("/publications/{publicationId}")
    public ResponseEntity<?> getPublicationDetails(@PathVariable Long publicationId) {
        try {
            PublicationResponse publication = publicationService.getPublicationById(publicationId);
            
            return ResponseEntity.ok(publication);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}