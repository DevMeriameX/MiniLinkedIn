package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.MessageRequest;
import com.example.MIniLin.models.Conversation;
import com.example.MIniLin.models.Message;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConversationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5174")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId(Principal principal) {
        Optional<User> user = userRepository.findByEmail(principal.getName());
        return user.map(User::getId).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @PostMapping("/envoyer")
    public ResponseEntity<?> envoyerMessage(@RequestBody MessageRequest request, Principal principal) {
        try {
            Long expediteurId = getCurrentUserId(principal);
            Message message = messageService.envoyerMessage(expediteurId, request.getDestinataireId(), request.getContenu());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<com.example.MIniLin.dtos.ConversationDTO>> getConversations(Principal principal) {
        Long userId = getCurrentUserId(principal);
        return ResponseEntity.ok(messageService.listerConversationsDTO(userId));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.listerMessagesConversation(conversationId));
    }

    @GetMapping("/conversation/user/{otherUserId}")
    public ResponseEntity<List<Message>> getMessagesByUserId(@PathVariable Long otherUserId, Principal principal) {
        try {
            Long currentUserId = getCurrentUserId(principal);
            User user1 = userRepository.findById(currentUserId).get();
            User user2 = userRepository.findById(otherUserId).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Optional<Conversation> conv = conversationRepository.findByUsers(user1, user2);
            if (conv.isPresent()) {
                return ResponseEntity.ok(messageService.listerMessagesConversation(conv.get().getId()));
            } else {
                return ResponseEntity.ok(List.of()); // Liste vide si pas encore de conversation
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/lire/{conversationId}")
    public ResponseEntity<?> marquerCommeLu(@PathVariable Long conversationId, Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            messageService.marquerCommeLu(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/non-lus/count")
    public ResponseEntity<Long> getNonLusCount(Principal principal) {
        Long userId = getCurrentUserId(principal);
        return ResponseEntity.ok(messageService.compterMessagesNonLus(userId));
    }

    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<?> supprimerConversation(@PathVariable Long conversationId, Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            messageService.supprimerConversation(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
