package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Connexion;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.StatutConnexion;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.ConnexionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConnexionController.class)
@Import(TestSecurityConfig.class)
public class ConnexionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConnexionService connexionService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("user1@test.com");
        currentUser.setRole(Role.ETUDIANT);

        when(userRepository.findByEmail("user1@test.com")).thenReturn(Optional.of(currentUser));
    }

    @Test
    void envoyerDemande_Success() throws Exception {
        Connexion mockConnexion = new Connexion();
        mockConnexion.setId(10L);
        mockConnexion.setStatut(StatutConnexion.EN_ATTENTE);

        when(connexionService.envoyerDemande(eq(1L), eq(2L))).thenReturn(mockConnexion);

        mockMvc.perform(post("/api/connexions/envoyer/{destinataireId}", 2L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void envoyerDemande_ThrowsException_ReturnsBadRequest() throws Exception {
        when(connexionService.envoyerDemande(eq(1L), eq(2L)))
                .thenThrow(new RuntimeException("Une demande existe déjà"));

        mockMvc.perform(post("/api/connexions/envoyer/{destinataireId}", 2L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}