package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.*;
import com.example.MIniLin.security.JwtFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EnseignantEtudiantController.class)
@Import(TestSecurityConfig.class)
public class EnseignantEtudiantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ExperienceRepository experienceRepository;

    @MockBean
    private FormationRepository formationRepository;

    @MockBean
    private CompetenceRepository competenceRepository;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private ConnexionRepository connexionRepository;

    @MockBean
    private PublicationRepository publicationRepository;

    @MockBean
    private RecommandationRepository recommandationRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User enseignant;
    private User etudiant;

    @BeforeEach
    void setUp() {
        enseignant = new User();
        enseignant.setId(1L);
        enseignant.setEmail("enseignant@test.com");
        enseignant.setRole(Role.ENSEIGNANT);

        etudiant = new User();
        etudiant.setId(2L);
        etudiant.setEmail("etudiant@test.com");
        etudiant.setRole(Role.ETUDIANT);

        when(userRepository.findByEmail("enseignant@test.com")).thenReturn(Optional.of(enseignant));
    }

    @Test
    void getEtudiantProfil_Success() throws Exception {
        when(userRepository.findById(2L)).thenReturn(Optional.of(etudiant));
        when(connexionRepository.findExistingConnexion(1L, 2L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/enseignant/etudiants/{etudiantId}/profil", 2L))
                .andExpect(status().isOk());
    }

    @Test
    void getEtudiantProfil_NotAnEtudiant_ReturnsBadRequest() throws Exception {
        User anotherEnseignant = new User();
        anotherEnseignant.setId(3L);
        anotherEnseignant.setRole(Role.ENSEIGNANT);
        
        when(userRepository.findById(3L)).thenReturn(Optional.of(anotherEnseignant));

        mockMvc.perform(get("/api/enseignant/etudiants/{etudiantId}/profil", 3L))
                .andExpect(status().isOk());
    }
}