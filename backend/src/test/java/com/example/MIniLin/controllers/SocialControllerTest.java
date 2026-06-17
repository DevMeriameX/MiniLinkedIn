package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.*;
import com.example.MIniLin.security.JwtFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SocialController.class)
@Import(TestSecurityConfig.class)
public class SocialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PublicationRepository publicationRepository;

    @MockBean
    private ReactionRepository reactionRepository;

    @MockBean
    private CommentaireRepository commentaireRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private SignalementRepository signalementRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User currentUser;
    private Publication publication;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("user@test.com");
        currentUser.setRole(Role.ETUDIANT);
        currentUser.setNomComplet("Test User");

        publication = new Publication();
        publication.setId(10L);
        publication.setUtilisateur(currentUser);
        publication.setStatut(Publication.StatutPublication.VALIDE);
        publication.setTitre("Hello");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(currentUser));
    }

    @Test
    void getValidatedPublications_Success() throws Exception {
        when(publicationRepository.findByStatutOrderByDatePublicationDesc(Publication.StatutPublication.VALIDE))
                .thenReturn(List.of(publication));

        mockMvc.perform(get("/api/social/publications"))
                .andExpect(status().isOk());
    }

    @Test
    void reactToPublication_Success() throws Exception {
        when(publicationRepository.findById(10L)).thenReturn(Optional.of(publication));
        when(reactionRepository.findByPublicationAndUtilisateur(any(), any())).thenReturn(Optional.empty());
        when(reactionRepository.countByPublication(publication)).thenReturn(1L);

        Map<String, String> request = new HashMap<>();
        request.put("type", "LIKE");

        mockMvc.perform(post("/api/social/publications/{publicationId}/reactions", 10L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}