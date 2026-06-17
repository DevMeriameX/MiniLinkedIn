package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Conversation;
import com.example.MIniLin.models.Message;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByDateEnvoiAsc(Conversation conversation);
    
    List<Message> findByDestinataireAndLuFalse(User destinataire);
    
    long countByDestinataireAndLuFalse(User destinataire);
    
    List<Message> findByConversationAndDestinataireAndLuFalse(Conversation conversation, User destinataire);
}
