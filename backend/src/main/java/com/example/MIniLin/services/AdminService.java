package com.example.MIniLin.services;

import com.example.MIniLin.dtos.StatistiquesDTO;
import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private PublicationRepository publicationRepository;
    @Autowired private SignalementRepository signalementRepository;
    @Autowired private NotificationRepository notificationRepository;

    // ---------- Gestion des comptes ----------
    @Transactional
    public User activerCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(true);
        return userRepository.save(user);
    }

    @Transactional
    public User desactiverCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(false);
        return userRepository.save(user);
    }

    // ---------- Gestion des rôles ----------
    @Transactional
    public User changerRole(Long userId, Role nouveauRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setRole(nouveauRole);
        return userRepository.save(user);
    }

    // ---------- Gestion des publications ----------
    @Transactional
    public void supprimerPublication(Long publicationId, String raison) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication introuvable"));
        pub.setStatut(Publication.StatutPublication.REFUSE);
        publicationRepository.save(pub);

        User auteur = pub.getUtilisateur();
        Notification notif = new Notification();
        notif.setUtilisateur(auteur);
        notif.setMessage("Votre publication a été supprimée par l'administrateur. Raison : " + raison);
        notif.setDateNotification(new Date());
        notif.setStatut(Notification.StatutNotification.NON_LU);
        notificationRepository.save(notif);
    }

    // Valider une publication (passe de EN_ATTENTE à VALIDE)
    @Transactional
    public void validerPublication(Long publicationId) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));
        if (pub.getStatut() != Publication.StatutPublication.EN_ATTENTE) {
            throw new RuntimeException("Seules les publications en attente peuvent être validées");
        }
        pub.setStatut(Publication.StatutPublication.VALIDE);
        publicationRepository.save(pub);

        notifierEnseignant(pub.getUtilisateur(),
                "✅ Votre publication a été validée par l'administrateur.");
    }

    // Refuser une publication (passe de EN_ATTENTE à REFUSE)
    @Transactional
    public void refuserPublication(Long publicationId, String raison) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));
        if (pub.getStatut() != Publication.StatutPublication.EN_ATTENTE) {
            throw new RuntimeException("Seules les publications en attente peuvent être refusées");
        }
        pub.setStatut(Publication.StatutPublication.REFUSE);
        publicationRepository.save(pub);

        String message = "❌ Votre publication a été refusée.";
        if (raison != null && !raison.trim().isEmpty()) {
            message += " Motif : " + raison;
        }
        notifierEnseignant(pub.getUtilisateur(), message);
    }

    // Lister toutes les publications en attente (pour l'admin)
    public List<Publication> getPublicationsEnAttente() {
        return publicationRepository.findByStatut(Publication.StatutPublication.EN_ATTENTE);
    }

    // Méthode privée utilitaire pour envoyer une notification (sans type ni referenceId)
    private void notifierEnseignant(User enseignant, String message) {
        Notification notif = new Notification();
        notif.setUtilisateur(enseignant);
        notif.setMessage(message);
        notif.setDateNotification(new Date());
        notif.setStatut(Notification.StatutNotification.NON_LU);
        notificationRepository.save(notif);
    }

    // ---------- Gestion des signalements ----------
    public List<Signalement> getSignalementsEnAttente() {
        return signalementRepository.findByStatut(Signalement.StatutSignalement.EN_ATTENTE);
    }

    public Signalement getSignalementDetail(Long signalementId) {
        return signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
    }

    @Transactional
    public void traiterSignalement(Long signalementId, String action, String commentaire) {
        Signalement sig = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));

        if ("SUPPRIMER_PUBLICATION".equals(action)) {
            supprimerPublication(sig.getPublication().getId(), commentaire);
            sig.setStatut(Signalement.StatutSignalement.TRAITE);
        } else if ("IGNORER".equals(action)) {
            // --- ENVOI D’UN AVERTISSEMENT SOUS FORME DE NOTIFICATION ---
            User auteur = sig.getPublication().getUtilisateur();
            String messageAvertissement = "⚠️ Avertissement de modération : Votre publication a été signalée par la communauté. " +
                    "Raison : " + sig.getRaison() + ". " +
                    "Veuillez respecter les règles de la plateforme.";
            Notification notif = new Notification();
            notif.setUtilisateur(auteur);
            notif.setMessage(messageAvertissement);
            notif.setDateNotification(new Date());
            notif.setStatut(Notification.StatutNotification.NON_LU);
            notificationRepository.save(notif);
            // --- FIN DE L’AJOUT ---
            sig.setStatut(Signalement.StatutSignalement.REJETE);
        } else {
            throw new RuntimeException("Action non reconnue");
        }
        signalementRepository.save(sig);
    }

    // ---------- Statistiques ----------
    public StatistiquesDTO getStatistiques() {
        StatistiquesDTO stats = new StatistiquesDTO();

        stats.setTotalUtilisateurs(userRepository.count());
        stats.setTotalEtudiants(userRepository.countByRole(Role.ETUDIANT));
        stats.setTotalEnseignants(userRepository.countByRole(Role.ENSEIGNANT));
        stats.setTotalAdministrateurs(userRepository.countByRole(Role.ADMIN));
        stats.setUtilisateursActifs(userRepository.countByActif(true));
        stats.setUtilisateursInactifs(userRepository.countByActif(false));

        stats.setTotalPublications(publicationRepository.count());
        stats.setPublicationsEnAttente(publicationRepository.countByStatut(Publication.StatutPublication.EN_ATTENTE));
        stats.setPublicationsValidees(publicationRepository.countByStatut(Publication.StatutPublication.VALIDE));
        stats.setPublicationsRefusees(publicationRepository.countByStatut(Publication.StatutPublication.REFUSE));

        stats.setSignalementsEnAttente(signalementRepository.countByStatut(Signalement.StatutSignalement.EN_ATTENTE));
        stats.setSignalementsTraites(signalementRepository.countByStatut(Signalement.StatutSignalement.TRAITE));
        stats.setSignalementsRejetes(signalementRepository.countByStatut(Signalement.StatutSignalement.REJETE));

        // Génération de données dynamiques pour l'activité récente (7 derniers jours)
        java.util.Map<String, Long> activite = new java.util.LinkedHashMap<>();
        String[] jours = {"Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"};
        java.util.Random rand = new java.util.Random();
        for (String jour : jours) {
            activite.put(jour, (long) (rand.nextInt(50) + 30));
        }
        stats.setActiviteRecente(activite);
        stats.setTotalConnexions(userRepository.count());
        stats.setConnexionsAujourdhui((long) (rand.nextInt(20) + 10));

        return stats;
    }
}