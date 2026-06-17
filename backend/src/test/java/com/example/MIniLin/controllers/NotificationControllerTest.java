package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import(TestSecurityConfig.class)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setRole(Role.ETUDIANT);

        notification = new Notification();
        notification.setId(10L);
        notification.setUtilisateur(user);
        notification.setStatut(Notification.StatutNotification.NON_LU);
        notification.setMessage("Nouveau message !");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
    }

    @Test
    void getMyNotifications_Success() throws Exception {
        when(notificationRepository.findByUtilisateurOrderByDateNotificationDesc(user)).thenReturn(List.of(notification));
        when(notificationRepository.countByUtilisateurAndStatut(user, Notification.StatutNotification.NON_LU)).thenReturn(1L);

        mockMvc.perform(get("/api/notifications/me"))
                .andExpect(status().isOk());
    }

    @Test
    void markAsRead_Success() throws Exception {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(put("/api/notifications/{id}/lire", 10L))
                .andExpect(status().isOk());
    }
}