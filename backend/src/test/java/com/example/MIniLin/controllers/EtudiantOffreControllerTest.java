package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.OffreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EtudiantOffreController.class)
@Import(TestSecurityConfig.class)
public class EtudiantOffreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OffreService offreService;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void getAllOffres_Success() throws Exception {
        OffreResponseDTO dto = new OffreResponseDTO();
        dto.setId(100L);
        dto.setTitre("Stage Web");
        
        when(offreService.getAllActiveOffres()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/etudiant/offres"))
                .andExpect(status().isOk());
    }
}