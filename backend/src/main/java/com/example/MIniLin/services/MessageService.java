package com.example.MIniLin.services;

import com.example.MIniLin.models.Conversation;
import com.example.MIniLin.models.Message;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.ConversationRepository;
import com.example.MIniLin.repositories.MessageRepository;
import com.example.MIniLin.repositories.NotificationRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

  @Autowired
  private MessageRepository messageRepository;

  @Autowired
  private ConversationRepository conversationRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private NotificationRepository notificationRepository;

  @Transactional
  public Message envoyerMessage(Long expediteurId, Long destinataireId, String contenu) {
    User expediteur = userRepository.findById(expediteurId)
        .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));
    User destinataire = userRepository.findById(destinataireId)
        .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

    // Trouver ou créer la conversation
    Conversation conversation = conversationRepository.findByUsers(expediteur, destinataire)
        .orElseGet(() -> conversationRepository.save(new Conversation(expediteur, destinataire)));

    // Mettre à jour la conversation
    conversation.setDernierMessage(contenu);
    conversation.setDateDernierMessage(new Date());
    conversationRepository.save(conversation);

    // Créer le message
    Message message = new Message();
    message.setExpediteur(expediteur);
    message.setDestinataire(destinataire);
    message.setContenu(contenu);
    message.setConversation(conversation);
    message.setDateEnvoi(new Date());
    message.setLu(false);

    Message saved = messageRepository.save(message);

    // Ajouter une notification pour le destinataire
    com.example.MIniLin.models.Notification notification = new com.example.MIniLin.models.Notification();
    notification.setUtilisateur(destinataire);
    notification.setMessage("Nouveau message de " + expediteur.getNomComplet());
    notification.setDateNotification(new Date());
    notification.setStatut(com.example.MIniLin.models.Notification.StatutNotification.NON_LU);
    notificationRepository.save(notification);

    return saved;
  }

  public List<Conversation> listerConversations(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    return conversationRepository.findByUser(user);
  }

  public List<com.example.MIniLin.dtos.ConversationDTO> listerConversationsDTO(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    List<Conversation> conversations = conversationRepository.findByUser(user);

    return conversations.stream().map(c -> {
      com.example.MIniLin.dtos.ConversationDTO dto = new com.example.MIniLin.dtos.ConversationDTO();
      dto.setId(c.getId());
      dto.setUser1(c.getUser1());
      dto.setUser2(c.getUser2());
      dto.setDernierMessage(c.getDernierMessage());
      dto.setDateDernierMessage(c.getDateDernierMessage());

      // Compter les messages non lus pour cet utilisateur dans cette conversation
      long unread = messageRepository.findByConversationAndDestinataireAndLuFalse(c, user).size();
      dto.setUnreadCount(unread);

      return dto;
    }).collect(java.util.stream.Collectors.toList());
  }

  public List<Message> listerMessagesConversation(Long conversationId) {
    Conversation conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
    return messageRepository.findByConversationOrderByDateEnvoiAsc(conversation);
  }

  @Transactional
  public void marquerCommeLu(Long conversationId, Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    Conversation conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

    List<Message> nonLus = messageRepository.findByConversationAndDestinataireAndLuFalse(conversation, user);
    for (Message m : nonLus) {
      m.setLu(true);
    }
    messageRepository.saveAll(nonLus);
  }

  public long compterMessagesNonLus(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    return messageRepository.countByDestinataireAndLuFalse(user);
  }

  @Transactional
  public void supprimerConversation(Long conversationId, Long userId) {
    Conversation conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));

    // Vérifier que l'utilisateur est bien partie de la conversation
    if (!conversation.getUser1().getId().equals(userId) && !conversation.getUser2().getId().equals(userId)) {
      throw new RuntimeException("Accès refusé");
    }

    // Supprimer tous les messages de la conversation
    List<Message> messages = messageRepository.findByConversationOrderByDateEnvoiAsc(conversation);
    messageRepository.deleteAll(messages);

    // Supprimer la conversation
    conversationRepository.delete(conversation);
  }
}
