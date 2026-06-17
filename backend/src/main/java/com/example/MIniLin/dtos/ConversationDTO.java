package com.example.MIniLin.dtos;

import com.example.MIniLin.models.User;
import java.util.Date;

public class ConversationDTO {
    private Long id;
    private User user1;
    private User user2;
    private String dernierMessage;
    private Date dateDernierMessage;
    private long unreadCount;

    // Getters et Setters
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

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}
