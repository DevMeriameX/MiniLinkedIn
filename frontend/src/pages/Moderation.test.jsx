import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Moderation from './Moderation';

// Mock de sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};

global.sessionStorage = viMockSessionStorage;

// Mock de window.confirm
global.confirm = vi.fn();

describe('Moderation', () => {
  let signalementService, publicationService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    signalementService = api.signalementService;
    publicationService = api.publicationService;
    signalementService.getAll.mockReset();
    signalementService.traiter.mockReset();
    publicationService.supprimer.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Files de Modération')).toBeInTheDocument();
    });
  });

  test('charge les signalements au montage', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(signalementService.getAll).toHaveBeenCalled();
    });
  });

  test('affiche la liste des signalements', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', dateSignalement: '2024-01-01', signaleur: { nomComplet: 'User 1' }, publication: { utilisateur: { nomComplet: 'Author 1' }, contenu: 'Test content' } }
    ]);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contenu inapproprié/i)).toBeInTheDocument();
      expect(screen.getByText('Author 1')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucun signalement', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun signalement en attente.')).toBeInTheDocument();
    });
  });

  test('avertit l\'utilisateur', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', dateSignalement: '2024-01-01', signaleur: { nomComplet: 'User 1' }, publication: { utilisateur: { nomComplet: 'Author 1' }, contenu: 'Test content' } }
    ]);
    signalementService.traiter.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contenu inapproprié/i)).toBeInTheDocument();
    });

    const warnButton = screen.getByText('Avertir l\'utilisateur');
    fireEvent.click(warnButton);

    await waitFor(() => {
      expect(signalementService.traiter).toHaveBeenCalledWith({
        signalementId: 1,
        action: 'IGNORER',
        commentaire: 'Avertissement envoyé à l\'utilisateur'
      });
    });
  });

  test('supprime la publication', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', dateSignalement: '2024-01-01', signaleur: { nomComplet: 'User 1' }, publication: { id: 1, utilisateur: { nomComplet: 'Author 1' }, contenu: 'Test content' } }
    ]);
    publicationService.supprimer.mockResolvedValue({});
    signalementService.traiter.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contenu inapproprié/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Supprimer la publication');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(publicationService.supprimer).toHaveBeenCalledWith(1, 'Publication inappropriée');
      expect(signalementService.traiter).toHaveBeenCalledWith({
        signalementId: 1,
        action: 'SUPPRIMER_PUBLICATION',
        commentaire: 'Publication supprimée par modération'
      });
    });
  });

  test('déconnecte l\'utilisateur', async () => {
    signalementService.getAll.mockResolvedValue([]);

    const history = createMemoryHistory();
    history.push('/moderation');

    render(
      <Router location={history.location} navigator={history}>
        <Moderation />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('logout')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('logout').closest('button');
    fireEvent.click(logoutButton);

    expect(history.location.pathname).toBe('/admin');
  });

  test('affiche le menu de navigation', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Moderation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Gestion des comptes')).toBeInTheDocument();
      expect(screen.getByText('Modération')).toBeInTheDocument();
      expect(screen.getByText('Signalements')).toBeInTheDocument();
    });
  });
});
