package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.*;
import com.example.MIniLin.security.JwtFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EnseignantProfilController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc   // filtres actifs pour @WithMockUser
public class EnseignantProfilControllerTest {

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
    private PublicationRepository publicationRepository;

    @MockBean
    private ConnexionRepository connexionRepository;

    @MockBean
    private VerificationDiplomeRepository diplomeRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private User enseignant;

    @BeforeEach
    void setUp() {
        enseignant = new User();
        enseignant.setId(1L);
        enseignant.setEmail("enseignant@test.com");
        enseignant.setRole(Role.ENSEIGNANT);
        enseignant.setNomComplet("Prof Test");

        when(userRepository.findByEmail("enseignant@test.com"))
                .thenReturn(Optional.of(enseignant));
    }

    @Test
    @WithMockUser(roles = "ENSEIGNANT")
    void getMonProfil_Success() throws Exception {
        when(publicationRepository.findByUtilisateurOrderByDatePublicationDesc(enseignant))
                .thenReturn(Collections.emptyList());
        when(connexionRepository.findAcceptedConnexions(1L))
                .thenReturn(Collections.emptyList());
        when(diplomeRepository.findByEnseignantId(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/enseignant/profil/me"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ENSEIGNANT")
    void updateProfil_Success() throws Exception {
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(
                multipart("/api/enseignant/profil/update")
                        .param("nomComplet", "Prof Modifié")
                        .param("bio", "Nouvelle bio")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
        ).andExpect(status().isOk());
    }
}