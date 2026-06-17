package com.example.MIniLin.services;

import com.example.MIniLin.dtos.PublicationRequest;
import com.example.MIniLin.dtos.PublicationResponse;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.CommentaireRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.ReactionRepository;
import com.example.MIniLin.repositories.SignalementRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {

    @Mock
    private PublicationRepository publicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentaireRepository commentaireRepository;

    @Mock
    private ReactionRepository reactionRepository;

    @Mock
    private SignalementRepository signalementRepository;

    @InjectMocks
    private PublicationService publicationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(publicationService, "uploadDir", "uploads/test_publications");

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("enseignant@test.com");
        testUser.setNomComplet("Prof Test");
        testUser.setRole(Role.ENSEIGNANT);
    }

    @Test
    void creerPublication_Success() {
        // Arrange
        PublicationRequest request = new PublicationRequest();
        request.setTitre("Titre test");
        request.setResume("Resume test");
        request.setContenu("Contenu test");
        request.setTypePublication("ARTICLE_RECHERCHE");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(publicationRepository.save(any(Publication.class))).thenAnswer(i -> {
            Publication p = i.getArgument(0);
            p.setId(100L);
            return p;
        });

        // Act
        PublicationResponse response = publicationService.creerPublication(1L, request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Titre test", response.getTitre());
        assertEquals("EN_ATTENTE", response.getStatut());
        assertEquals("Prof Test", response.getAuteurNom());
        verify(publicationRepository, times(1)).save(any(Publication.class));
    }

    @Test
    void creerPublication_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            publicationService.creerPublication(1L, new PublicationRequest());
        });
        assertEquals("Utilisateur non trouvé", ex.getMessage());
    }

    @Test
    void supprimerPublication_Success() {
        // Arrange
        Publication pub = new Publication();
        pub.setId(10L);
        pub.setUtilisateur(testUser); // Belongs to testUser

        when(publicationRepository.findById(10L)).thenReturn(Optional.of(pub));
        
        // Act
        publicationService.supprimerPublication(10L, 1L);

        // Assert
        verify(publicationRepository, times(1)).delete(pub);
    }

    @Test
    void supprimerPublication_UnauthorizedUser_ThrowsException() {
        // Arrange
        User anotherUser = new User();
        anotherUser.setId(2L);
        
        Publication pub = new Publication();
        pub.setId(10L);
        pub.setUtilisateur(anotherUser); // Belongs to someone else

        when(publicationRepository.findById(10L)).thenReturn(Optional.of(pub));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            publicationService.supprimerPublication(10L, 1L);
        });
        assertEquals("Vous n'êtes pas autorisé à supprimer cette publication", ex.getMessage());
    }
}
