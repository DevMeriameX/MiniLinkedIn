import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { messageService, userNotificationService } from '../services/api';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [nonLusCount, setNonLusCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [socialNotifications, setSocialNotifications] = useState([]);
  const [socialNonLusCount, setSocialNonLusCount] = useState(0);
  const prevConversationsRef = useRef([]);
  const prevSocialIdsRef = useRef([]);

  const refreshData = async () => {
    if (!user) return;
    try {
      // 1. Refresh total count
      const countRes = await messageService.getNonLusCount();
      setNonLusCount(countRes.data);

      // 2. Refresh conversations
      const convRes = await messageService.getConversations();
      const currentConversations = convRes.data;

      // 2b. Refresh social notifications
      const notifRes = await userNotificationService.getAll();
      const currentNotifications = notifRes.data?.notifications || [];
      setSocialNotifications(currentNotifications);
      setSocialNonLusCount(notifRes.data?.nonLus || 0);

      // 3. Compare with previous state to detect new messages
      if (prevConversationsRef.current.length > 0) {
        currentConversations.forEach(conv => {
          const prevConv = prevConversationsRef.current.find(p => p.id === conv.id);
          
          // Si le unreadCount de cette conversation a augmenté
          if (prevConv && conv.unreadCount > prevConv.unreadCount) {
            const otherUser = conv.user1.id === user?.id ? conv.user2 : conv.user1;
            toast(`📩 Nouveau message de ${otherUser.nomComplet}`, {
              duration: 4000,
              position: 'top-right',
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          } else if (!prevConv && conv.unreadCount > 0) {
            // Nouvelle conversation avec un message non lu
            const otherUser = conv.user1.id === user?.id ? conv.user2 : conv.user1;
            toast(`📩 Nouveau message de ${otherUser.nomComplet}`, {
              duration: 4000,
              position: 'top-right',
            });
          }
        });
      }

      const currentNotifIds = currentNotifications.map((n) => n.id);
      if (prevSocialIdsRef.current.length > 0) {
        currentNotifications
          .filter((n) => n.statut === 'NON_LU' && !prevSocialIdsRef.current.includes(n.id))
          .slice(0, 2)
          .forEach((n) => {
            toast(`🔔 ${n.message}`, {
              duration: 4000,
              position: 'top-right',
            });
          });
      }

      setConversations(currentConversations);
      prevConversationsRef.current = currentConversations;
      prevSocialIdsRef.current = currentNotifIds;
    } catch (err) {
      console.error('Error fetching notification data:', err);
    }
  };

  const markSocialAsRead = async (id) => {
    await userNotificationService.marquerCommeLue(id);
    await refreshData();
  };

  const markAllSocialAsRead = async () => {
    await userNotificationService.marquerToutCommeLu();
    await refreshData();
  };

  useEffect(() => {
    if (user) {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    } else {
      setNonLusCount(0);
      setConversations([]);
      setSocialNotifications([]);
      setSocialNonLusCount(0);
      prevConversationsRef.current = [];
      prevSocialIdsRef.current = [];
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        nonLusCount,
        conversations,
        socialNotifications,
        socialNonLusCount,
        totalNonLusCount: nonLusCount + socialNonLusCount,
        markSocialAsRead,
        markAllSocialAsRead,
        refreshNonLus: refreshData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
