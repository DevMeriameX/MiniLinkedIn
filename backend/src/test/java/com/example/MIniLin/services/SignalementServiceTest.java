package com.example.MIniLin.services;

import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.Signalement;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.SignalementRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SignalementServiceTest {

    @Mock
    private SignalementRepository signalementRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private SignalementService signalementService;

    private User signaleur;
    private User auteur;
    private User admin;
    private Publication publication;

    @BeforeEach
    void setUp() {
        signaleur = new User();
        signaleur.setId(1L);
        signaleur.setNomComplet("Signaleur Test");

        auteur = new User();
        auteur.setId(2L);
        auteur.setNomComplet("Auteur Test");

        admin = new User();
        admin.setId(3L);
        admin.setRole(Role.ADMIN);

        publication = new Publication();
        publication.setId(10L);
        publication.setUtilisateur(auteur);
    }

    @Test
    void creerSignalement_Success() {
        // Arrange
        when(signalementRepository.save(any(Signalement.class))).thenAnswer(i -> {
            Signalement s = i.getArgument(0);
            s.setId(100L);
            return s;
        });
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin));

        // Act
        Signalement result = signalementService.creerSignalement(publication, signaleur, "Spam");

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(Signalement.StatutSignalement.EN_ATTENTE, result.getStatut());
        assertEquals("Spam", result.getRaison());

        verify(signalementRepository, times(1)).save(any(Signalement.class));
        verify(notificationRepository, times(1)).save(any(Notification.class)); // Notifie les admins
    }
}
