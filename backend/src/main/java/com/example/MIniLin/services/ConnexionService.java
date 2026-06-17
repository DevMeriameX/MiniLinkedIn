package com.example.MIniLin.services;

import com.example.MIniLin.models.Connexion;
import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.StatutConnexion;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConnexionRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ConnexionService {

    @Autowired
    private ConnexionRepository connexionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Connexion envoyerDemande(Long demandeurId, Long destinataireId) {
        if (demandeurId.equals(destinataireId)) {
            throw new RuntimeException("Vous ne pouvez pas vous envoyer une demande à vous-même.");
        }

        Optional<Connexion> existing = connexionRepository.findExistingConnexion(demandeurId, destinataireId);
        if (existing.isPresent()) {
            throw new RuntimeException("Une demande de connexion existe déjà entre ces deux utilisateurs.");
        }

        User demandeur = userRepository.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur non trouvé"));
        User destinataire = userRepository.findById(destinataireId)
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        Connexion connexion = new Connexion();
        connexion.setDemandeur(demandeur);
        connexion.setDestinataire(destinataire);
        connexion.setStatut(StatutConnexion.EN_ATTENTE);
        connexion.setDateDemande(new Date());

        Connexion saved = connexionRepository.save(connexion);

        Notification notification = new Notification();
        notification.setUtilisateur(destinataire);
        notification.setMessage("Nouvelle demande de connexion de " + demandeur.getNomComplet());
        notificationRepository.save(notification);

        return saved;
    }

    public Connexion accepterDemande(Long demandeId, Long utilisateurId) {
        Connexion connexion = connexionRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (!connexion.getDestinataire().getId().equals(utilisateurId)) {
            throw new RuntimeException("Seul le destinataire peut accepter la demande.");
        }

        connexion.setStatut(StatutConnexion.ACCEPTEE);
        connexion.setDateReponse(new Date());

        Connexion saved = connexionRepository.save(connexion);

        Notification notification = new Notification();
        notification.setUtilisateur(connexion.getDemandeur());
        notification.setMessage(connexion.getDestinataire().getNomComplet() + " a accepte votre demande de connexion");
        notificationRepository.save(notification);

        return saved;
    }

    public Connexion refuserDemande(Long demandeId, Long utilisateurId) {
        Connexion connexion = connexionRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (!connexion.getDestinataire().getId().equals(utilisateurId)) {
            throw new RuntimeException("Seul le destinataire peut refuser la demande.");
        }

        connexion.setStatut(StatutConnexion.REFUSEE);
        connexion.setDateReponse(new Date());

        return connexionRepository.save(connexion);
    }

    public List<Connexion> listerDemandesRecues(Long utilisateurId) {
        return connexionRepository.findByDestinataireIdAndStatut(utilisateurId, StatutConnexion.EN_ATTENTE);
    }

    public List<Connexion> listerDemandesEnvoyees(Long utilisateurId) {
        return connexionRepository.findByDemandeurIdAndStatut(utilisateurId, StatutConnexion.EN_ATTENTE);
    }

    public List<Connexion> listerConnexionsAcceptees(Long utilisateurId) {
        return connexionRepository.findAcceptedConnexions(utilisateurId);
    }

    public List<User> rechercherUtilisateurs(String query) {
        return userRepository.findByNomCompletContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public List<User> rechercherUtilisateursFiltres(Long currentUserId, String query, String role, String filiere, String niveauEtudes, String universite, String competence) {
        String querySafe = query == null ? "" : query.trim();
        String roleSafe = role == null ? "" : role.trim().toUpperCase();
        String filiereSafe = filiere == null ? "" : filiere.trim().toLowerCase();
        String niveauSafe = niveauEtudes == null ? "" : niveauEtudes.trim().toLowerCase();
        String universiteSafe = universite == null ? "" : universite.trim().toLowerCase();
        String competenceSafe = competence == null ? "" : competence.trim().toLowerCase();

        return userRepository.findByActifTrueAndIdNot(currentUserId).stream()
                .filter(u -> querySafe.isBlank()
                        || (u.getNomComplet() != null && u.getNomComplet().toLowerCase().contains(querySafe.toLowerCase()))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(querySafe.toLowerCase())))
                .filter(u -> roleSafe.isBlank() || (u.getRole() != null && u.getRole().name().equals(roleSafe)))
                .filter(u -> filiereSafe.isBlank() || (u.getFiliere() != null && u.getFiliere().toLowerCase().contains(filiereSafe)))
                .filter(u -> niveauSafe.isBlank() || (u.getNiveauEtudes() != null && u.getNiveauEtudes().toLowerCase().contains(niveauSafe)))
                .filter(u -> universiteSafe.isBlank() || (u.getUniversite() != null && u.getUniversite().toLowerCase().contains(universiteSafe)))
                .collect(Collectors.toList());
    }

    public void supprimerConnexion(Long connexionId, Long utilisateurId) {
        Connexion connexion = connexionRepository.findById(connexionId)
                .orElseThrow(() -> new RuntimeException("Connexion non trouvee"));

        boolean isParticipant = connexion.getDemandeur().getId().equals(utilisateurId)
                || connexion.getDestinataire().getId().equals(utilisateurId);

        if (!isParticipant) {
            throw new RuntimeException("Vous ne pouvez pas supprimer cette connexion");
        }

        connexionRepository.delete(connexion);
    }

    public List<User> suggestions(Long utilisateurId, int limit) {
        User currentUser = userRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        List<Connexion> accepted = connexionRepository.findAcceptedConnexions(utilisateurId);
        Set<Long> connectedIds = new HashSet<>();
        for (Connexion c : accepted) {
            connectedIds.add(c.getDemandeur().getId());
            connectedIds.add(c.getDestinataire().getId());
        }
        connectedIds.add(currentUser.getId());

        return userRepository.findByActifTrueAndIdNot(utilisateurId).stream()
                .filter(u -> !connectedIds.contains(u.getId()))
                .sorted((a, b) -> {
                    // Prioriser ETUDIANT pour aider les enseignants
                    if (a.getRole() == b.getRole()) return 0;
                    if (a.getRole() == Role.ETUDIANT) return -1;
                    if (b.getRole() == Role.ETUDIANT) return 1;
                    return 0;
                })
                .limit(Math.max(limit, 1))
                .collect(Collectors.toList());
    }

    public Long countConnexions(Long userId) {
        return connexionRepository.countByDemandeurIdOrDestinataireIdAndStatut(
                userId,
                userId,
                StatutConnexion.ACCEPTEE
        );
    }
}
