package com.example.MIniLin.controllers;

import com.example.MIniLin.models.Commentaire;
import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Reaction;
import com.example.MIniLin.models.Signalement;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.CommentaireRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.ReactionRepository;
import com.example.MIniLin.repositories.SignalementRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/social")
public class SocialController {

  @Autowired
  private PublicationRepository publicationRepository;

  @Autowired
  private ReactionRepository reactionRepository;

  @Autowired
  private CommentaireRepository commentaireRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private NotificationRepository notificationRepository;

  @Autowired
  private SignalementRepository signalementRepository;

  private User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return userRepository.findByEmail(auth.getName())
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
  }

  @GetMapping("/publications")
  public ResponseEntity<?> getValidatedPublications(@RequestParam(required = false) String keyword) {
    User currentUser = null;
    try {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
        currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
      }
    } catch (Exception e) {
      // Ignorer si non authentifié
    }

    final User finalUser = currentUser;

    List<Publication> publications;
    if (keyword == null || keyword.isBlank()) {
      // Show both EN_ATTENTE and VALIDE
      List<Publication> valides = publicationRepository
          .findByStatutOrderByDatePublicationDesc(Publication.StatutPublication.VALIDE);
      List<Publication> enAttente = publicationRepository
          .findByStatutOrderByDatePublicationDesc(Publication.StatutPublication.EN_ATTENTE);
      publications = new ArrayList<>();
      publications.addAll(valides);
      publications.addAll(enAttente);
      // Sort by date descending
      publications.sort((p1, p2) -> p2.getDatePublication().compareTo(p1.getDatePublication()));
    } else {
      // For search, also show both
      List<Publication> all = publicationRepository.rechercherPublications(keyword);
      publications = all.stream()
          .filter(p -> p.getStatut() == Publication.StatutPublication.VALIDE
              || p.getStatut() == Publication.StatutPublication.EN_ATTENTE)
          .collect(java.util.stream.Collectors.toList());
    }

    List<Map<String, Object>> result = publications.stream().map(pub -> {
      Map<String, Object> item = new HashMap<>();
      item.put("id", pub.getId());
      item.put("titre", pub.getTitre());
      item.put("resume", pub.getResume());
      item.put("typePublication", pub.getTypePublication());
      item.put("contenu", pub.getContenu());
      item.put("datePublication", pub.getDatePublication());
      item.put("fichierUrl", pub.getFichierJointUrl());
      item.put("statut", pub.getStatut());
      String fUrl = pub.getFichierJointUrl();
      String fType = null;
      if (fUrl != null) {
        String low = fUrl.toLowerCase();
        if (low.endsWith(".pdf"))
          fType = "PDF";
        else if (low.endsWith(".jpg") || low.endsWith(".jpeg"))
          fType = "JPEG";
        else if (low.endsWith(".png"))
          fType = "PNG";
        else if (low.endsWith(".gif"))
          fType = "GIF";
        else
          fType = "DOCUMENT";
      }
      item.put("fichierType", fType);
      item.put("auteurId", pub.getUtilisateur().getId());
      item.put("auteurNom", pub.getUtilisateur().getNomComplet());
      item.put("auteurRole", pub.getUtilisateur().getRole());
      item.put("auteurPhoto", pub.getUtilisateur().getPhoto());
      item.put("nombreReactions", reactionRepository.countByPublication(pub));
      item.put("nombreCommentaires", commentaireRepository.countByPublication(pub));

      boolean liked = false;
      if (finalUser != null) {
        liked = reactionRepository.findByPublicationAndUtilisateur(pub, finalUser).isPresent();
      }
      item.put("liked", liked);

      return item;
    }).toList();

    return ResponseEntity.ok(Map.of("count", result.size(), "publications", result));
  }

  @PostMapping("/publications/{publicationId}/reactions")
  public ResponseEntity<?> reactToPublication(@PathVariable Long publicationId, @RequestBody Map<String, String> body) {
    User currentUser = getCurrentUser();
    Publication publication = publicationRepository.findById(publicationId)
        .orElseThrow(() -> new RuntimeException("Publication non trouvee"));

    String type = body.getOrDefault("type", "LIKE");
    Reaction.TypeReaction reactionType;
    try {
      reactionType = Reaction.TypeReaction.valueOf(type.toUpperCase());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Type de reaction invalide"));
    }

    Optional<Reaction> existingOpt = reactionRepository.findByPublicationAndUtilisateur(publication, currentUser);
    if (existingOpt.isPresent()) {
      reactionRepository.delete(existingOpt.get());
      return ResponseEntity.ok(Map.of(
          "message", "Reaction supprimee",
          "liked", false,
          "nombreReactions", reactionRepository.countByPublication(publication)));
    } else {
      Reaction reaction = new Reaction(currentUser, publication, reactionType);
      reactionRepository.save(reaction);

      if (!publication.getUtilisateur().getId().equals(currentUser.getId())) {
        Notification notif = new Notification();
        notif.setUtilisateur(publication.getUtilisateur());
        notif.setMessage(currentUser.getNomComplet() + " a reagi a votre publication");
        notificationRepository.save(notif);
      }

      return ResponseEntity.ok(Map.of(
          "message", "Reaction enregistree",
          "liked", true,
          "nombreReactions", reactionRepository.countByPublication(publication)));
    }
  }

  @GetMapping("/publications/{publicationId}/commentaires")
  public ResponseEntity<?> getCommentaires(@PathVariable Long publicationId) {
    Publication publication = publicationRepository.findById(publicationId)
        .orElseThrow(() -> new RuntimeException("Publication non trouvee"));
    List<Commentaire> commentaires = commentaireRepository.findByPublicationOrderByDateCommentaireDesc(publication);
    return ResponseEntity.ok(Map.of("count", commentaires.size(), "commentaires", commentaires));
  }

  @PostMapping("/publications/{publicationId}/commentaires")
  public ResponseEntity<?> addCommentaire(@PathVariable Long publicationId, @RequestBody Map<String, String> body) {
    User currentUser = getCurrentUser();
    Publication publication = publicationRepository.findById(publicationId)
        .orElseThrow(() -> new RuntimeException("Publication non trouvee"));

    String contenu = body.get("contenu");
    if (contenu == null || contenu.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Contenu du commentaire requis"));
    }

    Commentaire commentaire = new Commentaire();
    commentaire.setPublication(publication);
    commentaire.setUtilisateur(currentUser);
    commentaire.setContenu(contenu);
    commentaire.setDateCommentaire(new Date());
    commentaireRepository.save(commentaire);

    if (!publication.getUtilisateur().getId().equals(currentUser.getId())) {
      Notification notif = new Notification();
      notif.setUtilisateur(publication.getUtilisateur());
      notif.setMessage(currentUser.getNomComplet() + " a commente votre publication");
      notificationRepository.save(notif);
    }

    return ResponseEntity.ok(Map.of(
        "message", "Commentaire ajoute",
        "nombreCommentaires", commentaireRepository.countByPublication(publication)));
  }

  @PostMapping("/publications/{publicationId}/signaler")
  public ResponseEntity<?> signalerPublication(@PathVariable Long publicationId,
      @RequestBody Map<String, String> body) {
    User currentUser = getCurrentUser();
    Publication publication = publicationRepository.findById(publicationId)
        .orElseThrow(() -> new RuntimeException("Publication non trouvee"));

    String raison = body.getOrDefault("raison", "Contenu inapproprié");

    Signalement signalement = new Signalement();
    signalement.setPublication(publication);
    signalement.setSignaleur(currentUser);
    signalement.setRaison(raison);
    signalement.setDateSignalement(new Date());
    signalement.setStatut(Signalement.StatutSignalement.EN_ATTENTE);

    signalementRepository.save(signalement);

    return ResponseEntity.ok(Map.of("message", "Publication signalée avec succès"));
  }
}
