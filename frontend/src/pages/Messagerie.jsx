import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { messageService, etudiantEnseignantService, enseignantEtudiantService } from '../services/api';

const Messagerie = () => {
  const { user } = useAuth();
  const { refreshNonLus } = useNotifications();
  const [searchParams] = useSearchParams();
  const targetUserIdRaw = searchParams.get('userId');
  const targetUserId = targetUserIdRaw && targetUserIdRaw !== 'undefined' && targetUserIdRaw !== 'null' ? parseInt(targetUserIdRaw) : null;

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, selectedConversation.isNew);
      const interval = setInterval(() => fetchMessages(selectedConversation.id, selectedConversation.isNew), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation?.isNew && selectedConversation.user2.nomComplet === 'Chargement...' && targetUserId) {
      const loadOtherUserProfile = async () => {
        try {
          let otherUserNom = '';
          if (user?.role === 'ETUDIANT') {
            try {
              const res = await etudiantEnseignantService.getProfilEnseignant(targetUserId);
              otherUserNom = res.data.nomComplet;
            } catch (err) {
              try {
                const res = await etudiantEnseignantService.getProfilEtudiant(targetUserId);
                otherUserNom = res.data.nomComplet;
              } catch (e) {
                console.error(e);
              }
            }
          } else if (user?.role === 'ENSEIGNANT') {
            try {
              const res = await enseignantEtudiantService.getProfilEtudiant(targetUserId);
              otherUserNom = res.data.nomComplet;
            } catch (err) {
              try {
                const res = await etudiantEnseignantService.getProfilEnseignant(targetUserId);
                otherUserNom = res.data.nomComplet;
              } catch (e) {
                console.error(e);
              }
            }
          }
          if (otherUserNom) {
            setSelectedConversation(prev => {
              if (prev && prev.isNew && prev.user2.id === targetUserId) {
                return {
                  ...prev,
                  user2: { ...prev.user2, nomComplet: otherUserNom }
                };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error("Impossible de charger le profil de l'utilisateur", err);
        }
      };
      loadOtherUserProfile();
    }
  }, [selectedConversation, user, targetUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) return;

    try {
      await messageService.supprimerConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      fetchConversations();
    } catch (err) {
      console.error("Erreur lors de la suppression de la conversation", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
      const conversationsList = res.data;
      setConversations(conversationsList);
      
      if (targetUserId && !selectedConversation) {
        // Chercher si la conversation existe déjà
        const existingConv = conversationsList.find(c => 
          (c.user1.id === targetUserId || c.user2.id === targetUserId)
        );
        
        if (existingConv) {
          setSelectedConversation(existingConv);
        } else {
          // Créer un objet temporaire
          setSelectedConversation({ 
            isNew: true, 
            id: null,
            user1: user, 
            user2: { id: targetUserId, nomComplet: 'Chargement...' } 
          });
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const fetchMessages = async (conversationId, isNew = false) => {
    if (isNew && targetUserId) {
      try {
        const res = await messageService.getMessagesByUserId(targetUserId);
        const fetchedMessages = res.data;
        setMessages(fetchedMessages);
        
        // Si on a des messages, on peut mettre à jour le nom de l'autre utilisateur
        if (fetchedMessages.length > 0 && selectedConversation.user2.nomComplet === 'Chargement...') {
          const firstMsg = fetchedMessages[0];
          const other = firstMsg.expediteur.id === user?.id ? firstMsg.destinataire : firstMsg.expediteur;
          setSelectedConversation(prev => ({
            ...prev,
            user2: other
          }));
        }
      } catch (e) {
        console.error('Error fetching new messages', e);
      }
      return;
    }
    try {
      const res = await messageService.getMessages(conversationId);
      setMessages(res.data);
      // Marquer comme lu
      if (res.data.some(m => !m.lu && m.destinataire.id === user?.id)) {
        await messageService.marquerCommeLu(conversationId);
        refreshNonLus();
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUser = selectedConversation.user1.id === user?.id 
      ? selectedConversation.user2 
      : selectedConversation.user1;

    try {
      await messageService.envoyerMessage(otherUser.id, newMessage);
      setNewMessage('');
      
      if (selectedConversation.isNew) {
        // Rafraîchir les conversations pour obtenir la vraie ID de conversation
        const res = await messageService.getConversations();
        const newConv = res.data.find(c => 
          (c.user1.id === otherUser.id || c.user2.id === otherUser.id)
        );
        if (newConv) setSelectedConversation(newConv);
        setConversations(res.data);
      } else {
        fetchMessages(selectedConversation.id);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const getOtherUser = (conv) => {
    return conv.user1.id === user?.id ? conv.user2 : conv.user1;
  };

  const styles = {
    container: { display: 'flex', height: 'calc(100vh - 120px)', backgroundColor: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
    sidebar: { width: '350px', borderRight: '1px solid #e9e8e5', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '1.5rem', borderBottom: '1px solid #e9e8e5', fontWeight: 'bold', fontSize: '1.2rem' },
    convList: { flex: 1, overflowY: 'auto' },
    convItem: (active) => ({
      padding: '1rem 1.5rem',
      cursor: 'pointer',
      backgroundColor: active ? '#f0f7ff' : 'transparent',
      borderBottom: '1px solid #f4f3f0',
      transition: 'background 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }),
    avatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#e9e8e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0a66c2' },
    convInfo: { flex: 1, overflow: 'hidden' },
    convName: { fontWeight: 'bold', fontSize: '0.95rem', color: '#1b1c1a', marginBottom: '2px' },
    convLast: { fontSize: '0.8rem', color: '#414752', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#faf9f6' },
    chatHeader: { padding: '1rem 1.5rem', backgroundColor: 'white', borderBottom: '1px solid #e9e8e5', display: 'flex', alignItems: 'center', gap: '1rem' },
    messageList: { flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
    messageBubble: (isMe) => ({
      maxWidth: '70%',
      padding: '0.75rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.95rem',
      alignSelf: isMe ? 'flex-end' : 'flex-start',
      backgroundColor: isMe ? '#0a66c2' : 'white',
      color: isMe ? 'white' : '#1b1c1a',
      boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
      position: 'relative',
    }),
    messageTime: (isMe) => ({
      fontSize: '0.7rem',
      color: isMe ? 'rgba(255,255,255,0.7)' : '#a0a0a0',
      marginTop: '4px',
      textAlign: 'right',
    }),
    inputArea: { padding: '1.25rem', backgroundColor: 'white', borderTop: '1px solid #e9e8e5' },
    inputForm: { display: 'flex', gap: '1rem' },
    input: { flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid #e9e8e5', outline: 'none' },
    sendBtn: { backgroundColor: '#0a66c2', color: 'white', border: 'none', borderRadius: '2rem', padding: '0 1.5rem', fontWeight: 'bold', cursor: 'pointer' },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Messages</div>
        <div style={styles.convList}>
          {conversations.length > 0 ? (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              return (
                <div 
                key={conv.id} 
                style={styles.convItem(selectedConversation?.id === conv.id)}
                onClick={() => setSelectedConversation(conv)}
              >
                <div style={styles.avatar}>{otherUser.nomComplet?.charAt(0)}</div>
                <div style={styles.convInfo}>
                  <div style={styles.convName}>{otherUser.nomComplet}</div>
                  <div style={styles.convLast}>{conv.dernierMessage || 'Nouvelle conversation'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#a0a0a0' }}>
                    {conv.dateDernierMessage ? new Date(conv.dateDernierMessage).toLocaleDateString() : ''}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteConversation(conv.id, e)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#ba1a1a',
                      fontSize: '1.2rem',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Supprimer la conversation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#a0a0a0' }}>Aucune conversation</div>
          )}
        </div>
      </div>

      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.avatar}>{getOtherUser(selectedConversation).nomComplet?.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{getOtherUser(selectedConversation).nomComplet}</div>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>En ligne</div>
              </div>
            </div>
            <div style={styles.messageList}>
              {messages.map(msg => (
                <div key={msg.id} style={styles.messageBubble(msg.expediteur.id === user?.id)}>
                  <div>{msg.contenu}</div>
                  <div style={styles.messageTime(msg.expediteur.id === user?.id)}>
                    {new Date(msg.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputArea}>
              <form style={styles.inputForm} onSubmit={handleSendMessage}>
                <input 
                  style={styles.input} 
                  placeholder="Écrivez votre message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" style={styles.sendBtn}>Envoyer</button>
              </form>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', marginBottom: '1rem' }}>forum</span>
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messagerie;
