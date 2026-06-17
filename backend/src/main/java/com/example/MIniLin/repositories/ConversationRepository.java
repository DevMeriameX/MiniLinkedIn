package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Conversation;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c WHERE (c.user1 = :u1 AND c.user2 = :u2) OR (c.user1 = :u2 AND c.user2 = :u1)")
    Optional<Conversation> findByUsers(@Param("u1") User u1, @Param("u2") User u2);
    
    @Query("SELECT c FROM Conversation c WHERE c.user1 = :user OR c.user2 = :user ORDER BY c.dateDernierMessage DESC")
    List<Conversation> findByUser(@Param("user") User user);
}
