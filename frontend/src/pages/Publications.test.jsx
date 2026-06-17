import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Publications from './Publications';

// Mock de sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(() => 'test-token'),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};

global.sessionStorage = viMockSessionStorage;

// Mock de window.confirm et window.prompt
global.confirm = vi.fn();
global.prompt = vi.fn();

// Mock de fetch et window.open
global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = vi.fn();
global.window.open = vi.fn();

describe('Publications', () => {
  let adminService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    adminService = api.adminService;
    adminService.getPublicationsEnAttente.mockReset();
    adminService.validerPublication.mockReset();
    adminService.refuserPublication.mockReset();
    global.confirm.mockReset();
    global.prompt.mockReset();
    global.fetch.mockReset();
    global.window.open.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Gestion des publications')).toBeInTheDocument();
    });
  });

  test('charge les publications au montage', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(adminService.getPublicationsEnAttente).toHaveBeenCalled();
    });
  });

  test('affiche la liste des publications', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, contenu: 'Test content', statut: 'EN_ATTENTE', utilisateur: { nomComplet: 'Test Teacher', email: 'test@test.com' } }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByText('Test Teacher')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune publication', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune publication en attente de validation')).toBeInTheDocument();
    });
  });

  test('valide une publication', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, contenu: 'Test content', statut: 'EN_ATTENTE', utilisateur: { nomComplet: 'Test Teacher' } }
        ] 
      } 
    });
    adminService.validerPublication.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    const validateButton = screen.getByText('Valider');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(adminService.validerPublication).toHaveBeenCalledWith(1);
    });
  });

  test('refuse une publication', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, contenu: 'Test content', statut: 'EN_ATTENTE', utilisateur: { nomComplet: 'Test Teacher' } }
        ] 
      } 
    });
    adminService.refuserPublication.mockResolvedValue({});
    global.prompt.mockReturnValue('Motif test');

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    const refuseButton = screen.getByText('Refuser');
    fireEvent.click(refuseButton);

    await waitFor(() => {
      expect(adminService.refuserPublication).toHaveBeenCalledWith(1, 'Motif test');
    });
  });

  test('filtre par terme de recherche', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, contenu: 'Test content', statut: 'EN_ATTENTE', utilisateur: { nomComplet: 'Test Teacher' } },
          { id: 2, contenu: 'Other content', statut: 'EN_ATTENTE', utilisateur: { nomComplet: 'Other Teacher' } }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher par contenu ou auteur...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByText('Other content')).not.toBeInTheDocument();
    });
  });

  test('déconnecte l\'utilisateur', async () => {
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    const history = createMemoryHistory();
    history.push('/publications');

    render(
      <Router location={history.location} navigator={history}>
        <Publications />
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
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Publications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Gestion des comptes')).toBeInTheDocument();
      expect(screen.getByText('Publications')).toBeInTheDocument();
    });
  });
});
