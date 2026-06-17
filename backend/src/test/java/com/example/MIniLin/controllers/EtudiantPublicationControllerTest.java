package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.PublicationRequest;
import com.example.MIniLin.dtos.PublicationResponse;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.PublicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EtudiantPublicationController.class)
@Import(TestSecurityConfig.class)
public class EtudiantPublicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PublicationService publicationService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User etudiant;

    @BeforeEach
    void setUp() {
        etudiant = new User();
        etudiant.setId(2L);
        etudiant.setEmail("etudiant@test.com");
        etudiant.setRole(Role.ETUDIANT);
        
        when(userRepository.findByEmail("etudiant@test.com")).thenReturn(Optional.of(etudiant));
    }

    @Test
    void creerPublication_Success() throws Exception {
        PublicationResponse response = new PublicationResponse();
        response.setId(10L);
        response.setTitre("Mon projet");

        when(publicationService.creerPublication(eq(2L), any(PublicationRequest.class))).thenReturn(response);

        mockMvc.perform(multipart("/api/etudiant/publications")
                        .param("titre", "Mon projet")
                        .param("typePublication", "PROJET"))
                .andExpect(status().isOk());
    }
}