package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.OffreRequestDTO;
import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.OffreService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OffreController.class)
@Import(TestSecurityConfig.class)
public class OffreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OffreService offreService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User enseignant;

    @BeforeEach
    void setUp() {
        enseignant = new User();
        enseignant.setId(1L);
        enseignant.setEmail("enseignant@test.com");
        enseignant.setRole(Role.ENSEIGNANT);

        when(userRepository.findByEmail("enseignant@test.com")).thenReturn(Optional.of(enseignant));
    }

    @Test
    void creerOffre_Success() throws Exception {
        OffreRequestDTO request = new OffreRequestDTO();
        request.setTitre("Stage de dev");
        request.setType("STAGE");

        OffreResponseDTO responseDTO = new OffreResponseDTO();
        responseDTO.setId(10L);
        responseDTO.setTitre("Stage de dev");
        responseDTO.setType("STAGE");

        when(offreService.creerOffre(eq(1L), any(OffreRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/enseignant/offres")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}