package com.example.MIniLin.services;

import com.example.MIniLin.dtos.OffreRequestDTO;
import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.models.Offre;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.OffreRepository;
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
public class OffreServiceTest {

    @Mock
    private OffreRepository offreRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OffreService offreService;

    private User enseignant;
    private Offre offre;

    @BeforeEach
    void setUp() {
        enseignant = new User();
        enseignant.setId(1L);
        enseignant.setNomComplet("Professeur Test");

        offre = new Offre();
        offre.setId(10L);
        offre.setTitre("Offre de stage");
        offre.setEnseignant(enseignant);
        offre.setStatut("active");
    }

    @Test
    void creerOffre_Success() {
        OffreRequestDTO request = new OffreRequestDTO();
        request.setTitre("Nouveau Stage");
        request.setDescription("Super stage");
        request.setType("STAGE");

        when(userRepository.findById(1L)).thenReturn(Optional.of(enseignant));
        when(offreRepository.save(any(Offre.class))).thenAnswer(i -> {
            Offre o = i.getArgument(0);
            o.setId(20L);
            return o;
        });

        OffreResponseDTO response = offreService.creerOffre(1L, request);

        assertNotNull(response);
        assertEquals(20L, response.getId());
        assertEquals("Nouveau Stage", response.getTitre());
        assertEquals("Professeur Test", response.getAuteurNom());
        verify(offreRepository, times(1)).save(any(Offre.class));
    }

    @Test
    void modifierOffre_Success() {
        OffreRequestDTO request = new OffreRequestDTO();
        request.setTitre("Stage Modifié");

        when(offreRepository.findById(10L)).thenReturn(Optional.of(offre));
        when(offreRepository.save(any(Offre.class))).thenAnswer(i -> i.getArgument(0));

        OffreResponseDTO response = offreService.modifierOffre(1L, 10L, request);

        assertEquals("Stage Modifié", response.getTitre());
        verify(offreRepository, times(1)).save(offre);
    }

    @Test
    void modifierOffre_Unauthorized_ThrowsException() {
        OffreRequestDTO request = new OffreRequestDTO();

        when(offreRepository.findById(10L)).thenReturn(Optional.of(offre));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            offreService.modifierOffre(99L, 10L, request); // Wrong User ID
        });
        assertEquals("Vous n'êtes pas autorisé à modifier cette offre", ex.getMessage());
    }

    @Test
    void changerStatut_Success() {
        when(offreRepository.findById(10L)).thenReturn(Optional.of(offre));
        when(offreRepository.save(any(Offre.class))).thenAnswer(i -> i.getArgument(0));

        OffreResponseDTO response = offreService.changerStatut(1L, 10L, "fermee");

        assertEquals("fermee", response.getStatut());
    }
}
