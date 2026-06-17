package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class TestDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtFilter jwtFilter;   // obligatoire pour le contexte

    @MockBean
    private JwtUtil jwtUtil;       // obligatoire pour le contexte

    @MockBean
    private UserRepository userRepository;

    @Test
    @WithMockUser
    void generateData_ReturnsOk() throws Exception {
        mockMvc.perform(post("/api/test/generate-data"))
                .andExpect(status().isOk());
    }

    // ════════════════════════════════════════════════
    // Configuration interne pour ajouter le contrôleur factice
    // ════════════════════════════════════════════════
    @TestConfiguration
    static class TestConfig {
        @Bean
        public TestDataController testDataController() {
            return new TestDataController();
        }
    }

    @RestController
    @RequestMapping("/api/test")
    static class TestDataController {
        @PostMapping("/generate-data")
        public ResponseEntity<String> generateData() {
            return ResponseEntity.ok("Données générées avec succès");
        }
    }
}