package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.TraiterVerificationRequest;
import com.example.MIniLin.models.StatutVerification;
import com.example.MIniLin.models.User;
import com.example.MIniLin.models.VerificationDiplome;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.VerificationDiplomeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VerificationDiplomeController.class)
@Import(TestSecurityConfig.class)
public class VerificationDiplomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VerificationDiplomeService verificationService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void approuverDiplome_Success() throws Exception {
        TraiterVerificationRequest request = new TraiterVerificationRequest();
        request.setVerificationId(1L);
        request.setCommentaire("Validé par l'admin");

        User enseignant = new User();
        enseignant.setNomComplet("Professeur X");

        VerificationDiplome mockDiplome = new VerificationDiplome();
        mockDiplome.setId(1L);
        mockDiplome.setStatut(StatutVerification.VERIFIE);
        mockDiplome.setCommentaireAdmin("Validé par l'admin");
        mockDiplome.setEnseignant(enseignant);

        when(verificationService.approuverDiplome(any(TraiterVerificationRequest.class))).thenReturn(mockDiplome);

        mockMvc.perform(put("/api/admin/diplome/approuver")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}