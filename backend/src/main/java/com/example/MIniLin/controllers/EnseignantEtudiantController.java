package com.example.MIniLin.controllers;

import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.StatutConnexion;
import com.example.MIniLin.models.User;
import com.example.MIniLin.models.Recommandation;
import com.example.MIniLin.repositories.CompetenceRepository;
import com.example.MIniLin.repositories.ConnexionRepository;
import com.example.MIniLin.repositories.ExperienceRepository;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.repositories.FormationRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.RecommandationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enseignant/etudiants")
public class EnseignantEtudiantController {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ExperienceRepository experienceRepository;

  @Autowired
  private FormationRepository formationRepository;

  @Autowired
  private CompetenceRepository competenceRepository;

  @Autowired
  private NotificationRepository notificationRepository;

  @Autowired
  private ConnexionRepository connexionRepository;

  @Autowired
  private PublicationRepository publicationRepository;

  @Autowired
  private RecommandationRepository recommandationRepository;

  private User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
  }

  @GetMapping("/{etudiantId}/profil")
  public ResponseEntity<?> getEtudiantProfil(@PathVariable Long etudiantId) {
    User enseignant = getCurrentUser();
    User etudiant = userRepository.findById(etudiantId)
        .orElseThrow(() -> new RuntimeException("Etudiant non trouve"));
    if (etudiant.getRole() != Role.ETUDIANT) {
      return ResponseEntity.badRequest().body(Map.of("error", "Le profil cible n'est pas un etudiant"));
    }

    boolean isConnected = connexionRepository.findExistingConnexion(enseignant.getId(), etudiant.getId())
        .map(c -> c.getStatut() == StatutConnexion.ACCEPTEE)
        .orElse(false);

    Map<String, Object> response = new HashMap<>();
    response.put("id", etudiant.getId());
    response.put("nomComplet", etudiant.getNomComplet());
    response.put("email", etudiant.getEmail());
    response.put("photo", etudiant.getPhoto());
    response.put("document", etudiant.getDocument());
    response.put("bio", etudiant.getBio());
    response.put("filiere", etudiant.getFiliere());
    response.put("niveauEtudes", etudiant.getNiveauEtudes());
    response.put("statutAcademique", etudiant.getStatutAcademique());
    response.put("experiences", experienceRepository.findByUtilisateur(etudiant));
    response.put("formations", formationRepository.findByUtilisateur(etudiant));
    response.put("competences", competenceRepository.findByUtilisateur(etudiant));
    response.put("isConnected", isConnected);

    // Publications de l'étudiant (EN_ATTENTE and VALIDE)
    List<Map<String, Object>> pubs = publicationRepository
        .findByUtilisateurOrderByDatePublicationDesc(etudiant)
        .stream()
        .filter(p -> p.getStatut() == Publication.StatutPublication.VALIDE ||
            p.getStatut() == Publication.StatutPublication.EN_ATTENTE)
        .map(p -> {
          Map<String, Object> pm = new HashMap<>();
          pm.put("id", p.getId());
          pm.put("titre", p.getTitre());
          pm.put("resume", p.getResume());
          pm.put("contenu", p.getContenu());
          pm.put("typePublication", p.getTypePublication());
          pm.put("datePublication", p.getDatePublication());
          pm.put("fichierUrl", p.getFichierJointUrl());
          pm.put("statut", p.getStatut());
          return pm;
        }).collect(Collectors.toList());
    response.put("publications", pubs);

    // Recommendations de l'étudiant
    List<Map<String, Object>> recs = recommandationRepository.findByEtudiantOrderByDateRecommandationDesc(etudiant)
        .stream().map(r -> {
          Map<String, Object> rm = new HashMap<>();
          rm.put("id", r.getId());
          rm.put("dateRecommandation", r.getDateRecommandation());
          User prof = r.getEnseignant();
          rm.put("enseignantId", prof.getId());
          rm.put("enseignantNom", prof.getNomComplet());
          rm.put("enseignantPhoto", prof.getPhoto());
          rm.put("enseignantLabo", prof.getLabo());
          rm.put("enseignantDepart", prof.getDepart());
          return rm;
        }).collect(Collectors.toList());
    response.put("recommandations", recs);

    // Check if current user has already recommended
    boolean hasRecommended = recommandationRepository.existsByEnseignantAndEtudiant(enseignant, etudiant);
    response.put("hasRecommended", hasRecommended);

    return ResponseEntity.ok(response);
  }

  @PostMapping("/{etudiantId}/recommander")
  public ResponseEntity<?> recommanderEtudiant(@PathVariable Long etudiantId) {
    User enseignant = getCurrentUser();
    User etudiant = userRepository.findById(etudiantId)
        .orElseThrow(() -> new RuntimeException("Etudiant non trouve"));
    if (etudiant.getRole() != Role.ETUDIANT) {
      return ResponseEntity.badRequest().body(Map.of("error", "Cible invalide"));
    }

    boolean isConnected = connexionRepository.findExistingConnexion(enseignant.getId(), etudiant.getId())
        .map(c -> c.getStatut() == StatutConnexion.ACCEPTEE)
        .orElse(false);

    if (!isConnected) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "Vous devez etre connecte avec cet etudiant pour le recommander"));
    }

    if (recommandationRepository.existsByEnseignantAndEtudiant(enseignant, etudiant)) {
      return ResponseEntity.badRequest().body(Map.of("error", "Vous avez deja recommande cet etudiant"));
    }

    Recommandation recommandation = new Recommandation(enseignant, etudiant, new Date());
    recommandationRepository.save(recommandation);

    Notification notification = new Notification();
    notification.setUtilisateur(etudiant);
    notification.setMessage(enseignant.getNomComplet() + " vous a recommande pour une opportunite academique");
    notificationRepository.save(notification);

    return ResponseEntity.ok(Map.of("message", "Etudiant recommande avec succes"));
  }
}
