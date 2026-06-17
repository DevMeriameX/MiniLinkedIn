package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    private User user2;

    private String dernierMessage;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateDernierMessage;

    public Conversation() {}

    public Conversation(User u1, User u2) {
        // Toujours mettre le plus petit ID en user1 pour éviter les doublons inversés
        if (u1.getId() < u2.getId()) {
            this.user1 = u1;
            this.user2 = u2;
        } else {
            this.user1 = u2;
            this.user2 = u1;
        }
        this.dateDernierMessage = new Date();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser1() { return user1; }
    public void setUser1(User user1) { this.user1 = user1; }

    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }

    public String getDernierMessage() { return dernierMessage; }
    public void setDernierMessage(String dernierMessage) { this.dernierMessage = dernierMessage; }

    public Date getDateDernierMessage() { return dateDernierMessage; }
    public void setDateDernierMessage(Date dateDernierMessage) { this.dateDernierMessage = dateDernierMessage; }
}
