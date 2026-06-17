package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.LoginRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        User testUser = new User();
        testUser.setEmail("etudiant@test.com");
        testUser.setMotDePasse(passwordEncoder.encode("password"));
        testUser.setNomComplet("Test Etudiant");
        testUser.setRole(Role.ETUDIANT);
        testUser.setActif(true);
        userRepository.save(testUser);
    }

    @Test
    void login_Success_ReturnsJwt() throws Exception {
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("fake-jwt-token");

        LoginRequest request = new LoginRequest();
        request.setEmail("etudiant@test.com");
        request.setMotDePasse("password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.email").value("etudiant@test.com"))
                .andExpect(jsonPath("$.role").value("ETUDIANT"));
    }

    @Test
    void login_Failure_WrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("etudiant@test.com");
        request.setMotDePasse("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void registerSimple_Success() throws Exception {
        mockMvc.perform(post("/api/auth/inscription")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("email", "new_etudiant@test.com")
                        .param("motDePasse", "password")
                        .param("nomComplet", "New Etudiant")
                        .param("role", "ETUDIANT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.email").value("new_etudiant@test.com"))
                .andExpect(jsonPath("$.role").value("ETUDIANT"))
                .andExpect(jsonPath("$.status").value("ACTIF"));
    }

    @Test
    void registerSimple_Failure_EmailExists() throws Exception {
        mockMvc.perform(post("/api/auth/inscription")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("email", "etudiant@test.com")
                        .param("motDePasse", "password")
                        .param("nomComplet", "New Etudiant")
                        .param("role", "ETUDIANT"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email déjà utilisé"));
    }
}