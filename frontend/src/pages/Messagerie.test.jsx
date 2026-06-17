import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Messagerie from './Messagerie';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test User', role: 'ETUDIANT' },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    refreshNonLus: vi.fn(),
  }),
}));

// Mock de window.confirm
global.confirm = vi.fn();

describe('Messagerie', () => {
  let messageService, etudiantEnseignantService, enseignantEtudiantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    messageService = api.messageService;
    etudiantEnseignantService = api.etudiantEnseignantService;
    enseignantEtudiantService = api.enseignantEtudiantService;
    messageService.getConversations.mockReset();
    messageService.getMessages.mockReset();
    messageService.getMessagesByUserId.mockReset();
    messageService.envoyerMessage.mockReset();
    messageService.marquerCommeLu.mockReset();
    messageService.supprimerConversation.mockReset();
    etudiantEnseignantService.getProfilEnseignant.mockReset();
    etudiantEnseignantService.getProfilEtudiant.mockReset();
    enseignantEtudiantService.getProfilEtudiant.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    messageService.getConversations.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
  });

  test('charge les conversations au montage', async () => {
    messageService.getConversations.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(messageService.getConversations).toHaveBeenCalled();
    });
  });

  test('affiche la liste des conversations', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune conversation', async () => {
    messageService.getConversations.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune conversation')).toBeInTheDocument();
    });
  });

  test('sélectionne une conversation', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });
    messageService.getMessages.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const conversationItem = screen.getByText('User 2').closest('div[style*="cursor: pointer"]');
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(messageService.getMessages).toHaveBeenCalledWith(1);
    });
  });

  test('envoie un message', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });
    messageService.getMessages.mockResolvedValue({ data: [] });
    messageService.envoyerMessage.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const conversationItem = screen.getByText('User 2').closest('div[style*="cursor: pointer"]');
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Écrivez votre message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Écrivez votre message...');
    fireEvent.change(input, { target: { value: 'Test message' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(messageService.envoyerMessage).toHaveBeenCalledWith(2, 'Test message');
    });
  });

  test('supprime une conversation', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });
    messageService.supprimerConversation.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Supprimer la conversation');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(messageService.supprimerConversation).toHaveBeenCalledWith(1);
    });
  });

  test('marque les messages comme lus', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });
    messageService.getMessages.mockResolvedValue({ 
      data: [
        { id: 1, contenu: 'Test', expediteur: { id: 2 }, destinataire: { id: 1 }, lu: false, dateEnvoi: '2024-01-01' }
      ] 
    });
    messageService.marquerCommeLu.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const conversationItem = screen.getByText('User 2').closest('div[style*="cursor: pointer"]');
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(messageService.marquerCommeLu).toHaveBeenCalledWith(1);
    });
  });

  test('affiche un état vide si aucune conversation sélectionnée', async () => {
    messageService.getConversations.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sélectionnez une conversation pour commencer à discuter')).toBeInTheDocument();
    });
  });

  test('affiche les messages dans la conversation', async () => {
    messageService.getConversations.mockResolvedValue({ 
      data: [
        { id: 1, user1: { id: 1, nomComplet: 'User 1' }, user2: { id: 2, nomComplet: 'User 2' }, dernierMessage: 'Hello' }
      ] 
    });
    messageService.getMessages.mockResolvedValue({ 
      data: [
        { id: 1, contenu: 'Hello', expediteur: { id: 1 }, destinataire: { id: 2 }, lu: true, dateEnvoi: '2024-01-01T10:00:00' },
        { id: 2, contenu: 'Hi there', expediteur: { id: 2 }, destinataire: { id: 1 }, lu: true, dateEnvoi: '2024-01-01T11:00:00' }
      ] 
    });

    render(
      <MemoryRouter>
        <Messagerie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const conversationItem = screen.getByText('User 2').closest('div[style*="cursor: pointer"]');
    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(screen.getAllByText('Hello')[0]).toBeInTheDocument();
      expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
  });
});
