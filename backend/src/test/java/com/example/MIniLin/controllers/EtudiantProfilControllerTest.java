package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
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
public class EtudiantProfilControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User testEtudiant;

    @BeforeEach
    void setUp() {
        testEtudiant = new User();
        testEtudiant.setEmail("etudiant.profil@test.com");
        testEtudiant.setMotDePasse("password");
        testEtudiant.setNomComplet("Etudiant Profil");
        testEtudiant.setRole(Role.ETUDIANT);
        testEtudiant.setActif(true);
        testEtudiant = userRepository.save(testEtudiant);
    }

    @Test
    @WithMockUser(username = "etudiant.profil@test.com", roles = "ETUDIANT")
    void getMonProfil_ShouldReturnProfilData() throws Exception {
        mockMvc.perform(get("/api/etudiant/profil/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "etudiant.profil@test.com", roles = "ETUDIANT")
    void getExperiences_ShouldReturnEmptyListInitially() throws Exception {
        mockMvc.perform(get("/api/etudiant/experiences")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "etudiant.profil@test.com", roles = "ETUDIANT")
    void addExperience_ShouldCreateNewExperience() throws Exception {
        String experienceJson = """
                {
                    "poste": "Stagiaire Dev",
                    "entreprise": "Tech Corp",
                    "description": "Dev Java",
                    "actuel": true
                }
                """;

        mockMvc.perform(post("/api/etudiant/experiences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(experienceJson))
                .andExpect(status().isOk());
    }
}