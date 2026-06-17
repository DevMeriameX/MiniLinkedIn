package com.example.MIniLin.controllers;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.MessageRequest;
import com.example.MIniLin.models.Message;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConversationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.security.JwtFilter;
import com.example.MIniLin.services.MessageService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MessageController.class)
@Import(TestSecurityConfig.class)
public class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageService messageService;

    @MockBean
    private ConversationRepository conversationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private JwtUtil jwtUtil;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("current@test.com");
        currentUser.setRole(Role.ETUDIANT);

        when(userRepository.findByEmail("current@test.com")).thenReturn(Optional.of(currentUser));
    }

    @Test
    void envoyerMessage_Success() throws Exception {
        MessageRequest request = new MessageRequest();
        request.setDestinataireId(2L);
        request.setContenu("Hello World");

        Message responseMessage = new Message();
        responseMessage.setId(100L);
        responseMessage.setContenu("Hello World");

        when(messageService.envoyerMessage(eq(1L), eq(2L), eq("Hello World"))).thenReturn(responseMessage);

        mockMvc.perform(post("/api/messages/envoyer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}