import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Signalements from './Signalements';

// Mock de sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};

global.sessionStorage = viMockSessionStorage;

// Mock de window.confirm
global.confirm = vi.fn();

describe('Signalements', () => {
  let signalementService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    signalementService = api.signalementService;
    signalementService.getAll.mockReset();
    signalementService.traiter.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Signalements')[0]).toBeInTheDocument();
    });
  });

  test('charge les signalements au montage', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(signalementService.getAll).toHaveBeenCalled();
    });
  });

  test('affiche la liste des signalements', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', statut: 'EN_ATTENTE', signaleur: { nomComplet: 'User 1' }, publication: { contenu: 'Test content', utilisateur: { nomComplet: 'Author 1' } } }
    ]);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu inapproprié')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucun signalement', async () => {
    signalementService.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun signalement trouvé.')).toBeInTheDocument();
    });
  });

  test('traite un signalement en ignorant', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', statut: 'EN_ATTENTE', signaleur: { nomComplet: 'User 1' }, publication: { contenu: 'Test content' } }
    ]);
    signalementService.traiter.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu inapproprié')).toBeInTheDocument();
    });

    const ignoreButton = screen.getByText('Ignorer');
    fireEvent.click(ignoreButton);

    await waitFor(() => {
      expect(signalementService.traiter).toHaveBeenCalledWith({
        signalementId: 1,
        action: 'IGNORER',
        commentaire: 'Signalement ignoré'
      });
    });
  });

  test('traite un signalement en supprimant la publication', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', statut: 'EN_ATTENTE', signaleur: { nomComplet: 'User 1' }, publication: { contenu: 'Test content' } }
    ]);
    signalementService.traiter.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu inapproprié')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(signalementService.traiter).toHaveBeenCalledWith({
        signalementId: 1,
        action: 'SUPPRIMER_PUBLICATION',
        commentaire: 'Supprimé par admin'
      });
    });
  });

  test('déconnecte l\'utilisateur', async () => {
    signalementService.getAll.mockResolvedValue([]);

    const history = createMemoryHistory();
    history.push('/signalements');

    render(
      <Router location={history.location} navigator={history}>
        <Signalements />
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
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Gestion des comptes')).toBeInTheDocument();
      expect(screen.getAllByText('Signalements')[0]).toBeInTheDocument();
    });
  });

  test('désactive les boutons pendant le traitement', async () => {
    signalementService.getAll.mockResolvedValue([
      { id: 1, raison: 'Contenu inapproprié', statut: 'EN_ATTENTE', signaleur: { nomComplet: 'User 1' }, publication: { contenu: 'Test content' } }
    ]);
    signalementService.traiter.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Signalements />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu inapproprié')).toBeInTheDocument();
    });

    const ignoreButton = screen.getByText('Ignorer');
    fireEvent.click(ignoreButton);

    await waitFor(() => {
      expect(ignoreButton).toBeDisabled();
    });
  });
});
