package com.example.MIniLin.services;

import com.example.MIniLin.models.Connexion;
import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.StatutConnexion;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConnexionRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ConnexionServiceTest {

    @Mock
    private ConnexionRepository connexionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ConnexionService connexionService;

    private User demandeur;
    private User destinataire;
    private Connexion connexion;

    @BeforeEach
    void setUp() {
        demandeur = new User();
        demandeur.setId(1L);
        demandeur.setNomComplet("Alice");

        destinataire = new User();
        destinataire.setId(2L);
        destinataire.setNomComplet("Bob");

        connexion = new Connexion();
        connexion.setId(10L);
        connexion.setDemandeur(demandeur);
        connexion.setDestinataire(destinataire);
        connexion.setStatut(StatutConnexion.EN_ATTENTE);
    }

    @Test
    void envoyerDemande_Success() {
        when(connexionRepository.findExistingConnexion(1L, 2L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(demandeur));
        when(userRepository.findById(2L)).thenReturn(Optional.of(destinataire));
        when(connexionRepository.save(any(Connexion.class))).thenAnswer(i -> i.getArgument(0));

        Connexion saved = connexionService.envoyerDemande(1L, 2L);

        assertNotNull(saved);
        assertEquals(StatutConnexion.EN_ATTENTE, saved.getStatut());
        verify(connexionRepository, times(1)).save(any(Connexion.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void envoyerDemande_AlreadyExists_ThrowsException() {
        when(connexionRepository.findExistingConnexion(1L, 2L)).thenReturn(Optional.of(connexion));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            connexionService.envoyerDemande(1L, 2L);
        });
        assertEquals("Une demande de connexion existe déjà entre ces deux utilisateurs.", ex.getMessage());
    }

    @Test
    void accepterDemande_Success() {
        when(connexionRepository.findById(10L)).thenReturn(Optional.of(connexion));
        when(connexionRepository.save(any(Connexion.class))).thenAnswer(i -> i.getArgument(0));

        Connexion accepted = connexionService.accepterDemande(10L, 2L); // 2L est bien le destinataire

        assertEquals(StatutConnexion.ACCEPTEE, accepted.getStatut());
        verify(connexionRepository, times(1)).save(connexion);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void accepterDemande_Unauthorized_ThrowsException() {
        when(connexionRepository.findById(10L)).thenReturn(Optional.of(connexion));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            connexionService.accepterDemande(10L, 1L); // Le demandeur essaie d'accepter sa propre demande
        });
        assertEquals("Seul le destinataire peut accepter la demande.", ex.getMessage());
    }
}
