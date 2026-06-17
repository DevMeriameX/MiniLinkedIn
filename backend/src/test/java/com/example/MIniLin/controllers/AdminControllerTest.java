package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.ChangerRoleRequest;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.AdminService;
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

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(TestSecurityConfig.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(2L);
        testUser.setEmail("user@test.com");
        testUser.setActif(true);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setRole(Role.ADMIN);
        
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void activerCompte_Success() throws Exception {
        when(adminService.activerCompte(2L)).thenReturn(testUser);

        mockMvc.perform(put("/api/admin/activer/{userId}", 2L))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void changerRole_Success() throws Exception {
        ChangerRoleRequest request = new ChangerRoleRequest();
        request.setUserId(2L);
        request.setNouveauRole("ENSEIGNANT");

        User updatedUser = new User();
        updatedUser.setId(2L);
        updatedUser.setRole(Role.ENSEIGNANT);

        when(adminService.changerRole(eq(2L), eq(Role.ENSEIGNANT))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/admin/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}