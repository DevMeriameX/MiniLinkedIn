package com.example.MIniLin.services;

import com.example.MIniLin.models.Conversation;
import com.example.MIniLin.models.Message;
import com.example.MIniLin.models.Notification;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConversationRepository;
import com.example.MIniLin.repositories.MessageRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private MessageService messageService;

    private User expediteur;
    private User destinataire;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        expediteur = new User();
        expediteur.setId(1L);
        expediteur.setNomComplet("Expediteur Test");

        destinataire = new User();
        destinataire.setId(2L);
        destinataire.setNomComplet("Destinataire Test");

        conversation = new Conversation(expediteur, destinataire);
        conversation.setId(100L);
    }

    @Test
    void envoyerMessage_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(expediteur));
        when(userRepository.findById(2L)).thenReturn(Optional.of(destinataire));
        when(conversationRepository.findByUsers(expediteur, destinataire)).thenReturn(Optional.of(conversation));
        
        when(messageRepository.save(any(Message.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Message msg = messageService.envoyerMessage(1L, 2L, "Bonjour, comment allez-vous ?");

        // Assert
        assertNotNull(msg);
        assertEquals("Bonjour, comment allez-vous ?", msg.getContenu());
        assertEquals(expediteur, msg.getExpediteur());
        assertEquals(destinataire, msg.getDestinataire());
        assertFalse(msg.isLu());
        
        verify(conversationRepository, times(1)).save(conversation);
        assertEquals("Bonjour, comment allez-vous ?", conversation.getDernierMessage());
        
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void envoyerMessage_ExpediteurNotFound_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            messageService.envoyerMessage(1L, 2L, "Hello");
        });
        assertEquals("Expéditeur non trouvé", ex.getMessage());
    }

    @Test
    void supprimerConversation_Success() {
        when(conversationRepository.findById(100L)).thenReturn(Optional.of(conversation));

        messageService.supprimerConversation(100L, 1L); // Using expediteur's ID

        verify(messageRepository, times(1)).deleteAll(anyList());
        verify(conversationRepository, times(1)).delete(conversation);
    }

    @Test
    void supprimerConversation_Unauthorized_ThrowsException() {
        when(conversationRepository.findById(100L)).thenReturn(Optional.of(conversation));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            messageService.supprimerConversation(100L, 99L); // Third-party user ID
        });
        assertEquals("Accès refusé", ex.getMessage());
    }
}
