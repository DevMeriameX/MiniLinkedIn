package com.example.MIniLin.services;

import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.SignalementRepository;
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
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PublicationRepository publicationRepository;

    @Mock
    private SignalementRepository signalementRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private AdminService adminService;

    private User testUser;
    private Publication testPublication;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@test.com");
        testUser.setActif(false);

        testPublication = new Publication();
        testPublication.setId(10L);
        testPublication.setUtilisateur(testUser);
        testPublication.setStatut(Publication.StatutPublication.EN_ATTENTE);
    }

    @Test
    void activerCompte_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User activatedUser = adminService.activerCompte(1L);

        assertTrue(activatedUser.isActif());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void desactiverCompte_Success() {
        testUser.setActif(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User deactivatedUser = adminService.desactiverCompte(1L);

        assertFalse(deactivatedUser.isActif());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void changerRole_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updatedUser = adminService.changerRole(1L, Role.ENSEIGNANT);

        assertEquals(Role.ENSEIGNANT, updatedUser.getRole());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void validerPublication_Success() {
        when(publicationRepository.findById(10L)).thenReturn(Optional.of(testPublication));

        adminService.validerPublication(10L);

        assertEquals(Publication.StatutPublication.VALIDE, testPublication.getStatut());
        verify(publicationRepository, times(1)).save(testPublication);
        verify(notificationRepository, times(1)).save(any(Notification.class)); // Notifie l'auteur
    }

    @Test
    void refuserPublication_Success() {
        when(publicationRepository.findById(10L)).thenReturn(Optional.of(testPublication));

        adminService.refuserPublication(10L, "Contenu inapproprié");

        assertEquals(Publication.StatutPublication.REFUSE, testPublication.getStatut());
        verify(publicationRepository, times(1)).save(testPublication);
        verify(notificationRepository, times(1)).save(any(Notification.class)); // Notifie l'auteur
    }
}
