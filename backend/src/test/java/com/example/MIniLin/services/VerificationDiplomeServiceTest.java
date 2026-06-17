package com.example.MIniLin.services;

import com.example.MIniLin.dtos.TraiterVerificationRequest;
import com.example.MIniLin.models.StatutVerification;
import com.example.MIniLin.models.User;
import com.example.MIniLin.models.VerificationDiplome;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.repositories.VerificationDiplomeRepository;
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
public class VerificationDiplomeServiceTest {

    @Mock
    private VerificationDiplomeRepository verificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VerificationDiplomeService verificationDiplomeService;

    private User enseignant;
    private VerificationDiplome diplome;

    @BeforeEach
    void setUp() {
        enseignant = new User();
        enseignant.setId(1L);

        diplome = new VerificationDiplome();
        diplome.setId(10L);
        diplome.setEnseignant(enseignant);
        diplome.setStatut(StatutVerification.EN_ATTENTE);
    }

    @Test
    void approuverDiplome_Success() {
        TraiterVerificationRequest request = new TraiterVerificationRequest();
        request.setVerificationId(10L);
        request.setCommentaire("Tout est en ordre");
        
        when(verificationRepository.findById(10L)).thenReturn(Optional.of(diplome));
        when(verificationRepository.save(any(VerificationDiplome.class))).thenAnswer(i -> i.getArgument(0));

        VerificationDiplome result = verificationDiplomeService.approuverDiplome(request);

        assertEquals(StatutVerification.VERIFIE, result.getStatut());
        assertEquals("Tout est en ordre", result.getCommentaireAdmin());
        assertTrue(result.isVerificationManuelle());
        verify(verificationRepository, times(1)).save(diplome);
    }

    @Test
    void rejeterDiplome_Success() {
        TraiterVerificationRequest request = new TraiterVerificationRequest();
        request.setVerificationId(10L);
        request.setCommentaire("Document flou");
        
        when(verificationRepository.findById(10L)).thenReturn(Optional.of(diplome));
        when(verificationRepository.save(any(VerificationDiplome.class))).thenAnswer(i -> i.getArgument(0));

        VerificationDiplome result = verificationDiplomeService.rejeterDiplome(request);

        assertEquals(StatutVerification.REJETE, result.getStatut());
        assertEquals("Document flou", result.getCommentaireAdmin());
        assertTrue(result.isVerificationManuelle());
        verify(verificationRepository, times(1)).save(diplome);
    }

    @Test
    void archiverDiplome_Success() {
        diplome.setActif(true);
        when(verificationRepository.findById(10L)).thenReturn(Optional.of(diplome));

        verificationDiplomeService.archiverDiplome(10L, 1L);

        assertFalse(diplome.isActif());
        verify(verificationRepository, times(1)).save(diplome);
    }

    @Test
    void archiverDiplome_Unauthorized_ThrowsException() {
        when(verificationRepository.findById(10L)).thenReturn(Optional.of(diplome));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            verificationDiplomeService.archiverDiplome(10L, 2L); // 2L n'est pas le bon enseignant
        });
        assertEquals("Accès non autorisé à ce diplôme", ex.getMessage());
    }
}
