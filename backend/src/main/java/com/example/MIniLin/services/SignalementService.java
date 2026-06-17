package com.example.MIniLin.services;

import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.List;

@Service
public class SignalementService {

    @Autowired private SignalementRepository signalementRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;

    @Transactional
    public Signalement creerSignalement(Publication publication, User signaleur, String raison) {
        Signalement signalement = new Signalement();
        signalement.setPublication(publication);
        signalement.setSignaleur(signaleur);
        signalement.setRaison(raison);
        signalement.setStatut(Signalement.StatutSignalement.EN_ATTENTE);
        signalement.setDateSignalement(new Date());
        Signalement saved = signalementRepository.save(signalement);

        // Notifier tous les administrateurs
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notif = new Notification();
            notif.setUtilisateur(admin);
            notif.setMessage("📢 Nouveau signalement #" + saved.getId() +
                    " sur la publication de " + publication.getUtilisateur().getNomComplet() +
                    " : " + raison);
            notif.setStatut(Notification.StatutNotification.NON_LU);
            notificationRepository.save(notif);
        }
        return saved;
    }
}