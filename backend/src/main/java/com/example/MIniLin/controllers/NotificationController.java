package com.example.MIniLin.controllers;

import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUtilisateurOrderByDateNotificationDesc(user);
        long nonLus = notificationRepository.countByUtilisateurAndStatut(user, Notification.StatutNotification.NON_LU);
        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "nonLus", nonLus
        ));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvee"));
        if (!notif.getUtilisateur().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Acces refuse"));
        }
        notif.setStatut(Notification.StatutNotification.LU);
        notificationRepository.save(notif);
        return ResponseEntity.ok(Map.of("message", "Notification marquee comme lue"));
    }

    @PutMapping("/lire-tout")
    public ResponseEntity<?> markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUtilisateurOrderByDateNotificationDesc(user);
        notifications.forEach(n -> n.setStatut(Notification.StatutNotification.LU));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("message", "Toutes les notifications marquees comme lues"));
    }
}
