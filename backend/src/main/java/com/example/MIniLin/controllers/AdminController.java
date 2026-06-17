package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.*;
import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private AdminService adminService;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;

    // ---------- Gestion comptes ----------
    @PutMapping("/activer/{userId}")
    public ResponseEntity<?> activerCompte(@PathVariable Long userId) {
        User user = adminService.activerCompte(userId);
        return ResponseEntity.ok(Map.of("message", "Compte activé", "user", user));
    }

    @PutMapping("/desactiver/{userId}")
    public ResponseEntity<?> desactiverCompte(@PathVariable Long userId) {
        User user = adminService.desactiverCompte(userId);
        return ResponseEntity.ok(Map.of("message", "Compte désactivé", "user", user));
    }

    // ---------- Gestion rôles ----------
    @PutMapping("/role")
    public ResponseEntity<?> changerRole(@RequestBody ChangerRoleRequest request) {
        Role role = Role.valueOf(request.getNouveauRole().toUpperCase());
        User user = adminService.changerRole(request.getUserId(), role);
        return ResponseEntity.ok(Map.of("message", "Rôle modifié", "user", user));
    }

    // ---------- Publications : validation, refus, liste en attente ----------
    @GetMapping("/publications/en-attente")
    public ResponseEntity<?> getPublicationsEnAttente() {
        List<Publication> publications = adminService.getPublicationsEnAttente();
        return ResponseEntity.ok(Map.of(
                "count", publications.size(),
                "publications", publications
        ));
    }

    @PutMapping("/publication/{publicationId}/valider")
    public ResponseEntity<?> validerPublication(@PathVariable Long publicationId) {
        adminService.validerPublication(publicationId);
        return ResponseEntity.ok(Map.of("message", "Publication validée avec succès"));
    }

    @PutMapping("/publication/{publicationId}/refuser")
    public ResponseEntity<?> refuserPublication(
            @PathVariable Long publicationId,
            @RequestBody(required = false) Map<String, String> body) {
        String raison = (body != null) ? body.get("raison") : null;
        adminService.refuserPublication(publicationId, raison);
        return ResponseEntity.ok(Map.of("message", "Publication refusée"));
    }

    // ---------- Suppression directe par l'admin ----------
    @DeleteMapping("/publication/{publicationId}")
    public ResponseEntity<?> supprimerPublication(@PathVariable Long publicationId,
                                                  @RequestParam String raison) {
        adminService.supprimerPublication(publicationId, raison);
        return ResponseEntity.ok(Map.of("message", "Publication supprimée"));
    }

    // ---------- Signalements ----------
    @GetMapping("/signalements/en-attente")
    public ResponseEntity<?> signalementsEnAttente() {
        List<Signalement> list = adminService.getSignalementsEnAttente();
        return ResponseEntity.ok(Map.of("signalements", list));
    }

    @GetMapping("/signalement/{signalementId}")
    public ResponseEntity<?> detailSignalement(@PathVariable Long signalementId) {
        Signalement sig = adminService.getSignalementDetail(signalementId);
        return ResponseEntity.ok(sig);
    }

    @PostMapping("/signalement/traiter")
    public ResponseEntity<?> traiterSignalement(@RequestBody TraiterSignalementRequest request) {
        adminService.traiterSignalement(request.getSignalementId(), request.getAction(), request.getCommentaire());
        return ResponseEntity.ok(Map.of("message", "Signalement traité"));
    }

    // ---------- Statistiques ----------
    @GetMapping("/statistiques")
    public ResponseEntity<?> getStatistiques() {
        StatistiquesDTO stats = adminService.getStatistiques();
        return ResponseEntity.ok(stats);
    }

    // ---------- Notifications pour l'admin ----------
    @GetMapping("/notifications")
    public ResponseEntity<?> getMesNotifications() {
        User admin = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUtilisateurOrderByDateNotificationDesc(admin);
        long nonLus = notifications.stream()
                .filter(n -> n.getStatut() == Notification.StatutNotification.NON_LU)
                .count();
        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "nonLus", nonLus
        ));
    }

    @PutMapping("/notifications/{id}/lire")
    public ResponseEntity<?> marquerCommeLue(@PathVariable Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notif.setStatut(Notification.StatutNotification.LU);
        notificationRepository.save(notif);
        return ResponseEntity.ok(Map.of("message", "Notification marquée comme lue"));
    }

    // ---------- Méthode utilitaire ----------
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}