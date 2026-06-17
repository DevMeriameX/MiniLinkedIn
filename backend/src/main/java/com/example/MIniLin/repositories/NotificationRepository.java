package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUtilisateurOrderByDateNotificationDesc(User utilisateur);
    long countByUtilisateurAndStatut(User utilisateur, Notification.StatutNotification statut);
}