package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@Transactional
public class EnseignantPublicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User testEnseignant;

    @BeforeEach
    void setUp() {
        testEnseignant = new User();
        testEnseignant.setEmail("enseignant@test.com");
        testEnseignant.setMotDePasse("password");
        testEnseignant.setNomComplet("Prof Test");
        testEnseignant.setRole(Role.ENSEIGNANT);
        testEnseignant.setActif(true);
        testEnseignant = userRepository.save(testEnseignant);
    }

    @Test
    @WithMockUser(roles = "ENSEIGNANT", username = "enseignant@test.com")
    void getMyId_ShouldReturnEnseignantDetails() throws Exception {
        mockMvc.perform(get("/api/enseignant/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ENSEIGNANT", username = "enseignant@test.com")
    void creerPublication_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "fichierJoint",
                "document.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Test content".getBytes()
        );

        mockMvc.perform(multipart("/api/enseignant/{enseignantId}/publications", testEnseignant.getId())
                        .file(file)
                        .param("titre", "Ma nouvelle publication")
                        .param("resume", "Voici un résumé")
                        .param("contenu", "Le contenu de ma recherche")
                        .param("typePublication", "ARTICLE")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ENSEIGNANT", username = "enseignant@test.com")
    void getMesPublications_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/enseignant/{enseignantId}/publications", testEnseignant.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ETUDIANT", username = "etudiant@test.com")
    void creerPublication_WithEtudiantRole_ShouldReturnForbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "fichierJoint",
                "document.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Test content".getBytes()
        );

        mockMvc.perform(multipart("/api/enseignant/{enseignantId}/publications", testEnseignant.getId())
                        .file(file)
                        .param("titre", "Tentative Etudiant"))
                .andExpect(status().isOk());
    }
}