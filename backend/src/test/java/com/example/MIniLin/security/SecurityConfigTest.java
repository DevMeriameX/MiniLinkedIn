package com.example.MIniLin.security;

import com.example.MIniLin.controllers.TestSecurityConfig;
import com.example.MIniLin.dtos.StatistiquesDTO;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @Test
    @WithMockUser(username = "admin@system.com", roles = { "ADMIN" })
    void adminEndpoint_WithAdminRole_ShouldReturnOk() throws Exception {
        StatistiquesDTO stats = mock(StatistiquesDTO.class);
        when(adminService.getStatistiques()).thenReturn(stats);

        User adminUser = new User();
        adminUser.setEmail("admin@system.com");
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(adminUser));

        mockMvc.perform(get("/api/admin/statistiques"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "etudiant@test.com", roles = { "ETUDIANT" })
    void adminEndpoint_WithEtudiantRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/statistiques"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "enseignant@test.com", roles = { "ENSEIGNANT" })
    void adminEndpoint_WithEnseignantRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/statistiques"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithAnonymousUser
    void adminEndpoint_WithAnonymousUser_ShouldReturnForbidden() throws Exception {
        // Http403ForbiddenEntryPoint renvoie 403
        mockMvc.perform(get("/api/admin/statistiques"))
                .andExpect(status().isForbidden());
    }
}