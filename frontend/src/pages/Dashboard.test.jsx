import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

// Mock du LayoutAdmin
vi.mock('../components/AdminLayout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock de sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(() => JSON.stringify({ nomComplet: 'Admin User', role: 'ADMIN' })),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

global.sessionStorage = viMockSessionStorage;

// Mock de window.confirm et window.prompt
global.confirm = vi.fn();
global.prompt = vi.fn();
global.alert = vi.fn();

describe('Dashboard', () => {
  let authService, diplomeService, adminService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    authService = api.authService;
    diplomeService = api.diplomeService;
    adminService = api.adminService;
    authService.getAllUsers.mockReset();
    diplomeService.getDocumentsEnAttente.mockReset();
    adminService.getStatistiques.mockReset();
    adminService.getPublicationsEnAttente.mockReset();
    adminService.validerPublication.mockReset();
    adminService.refuserPublication.mockReset();
    global.confirm.mockReset();
    global.prompt.mockReset();
    global.alert.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aperçu Analytique')).toBeInTheDocument();
    });
  });

  test('charge les données au montage', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(authService.getAllUsers).toHaveBeenCalled();
      expect(adminService.getStatistiques).toHaveBeenCalled();
      expect(diplomeService.getDocumentsEnAttente).toHaveBeenCalled();
      expect(adminService.getPublicationsEnAttente).toHaveBeenCalled();
    });
  });

  test('affiche les statistiques', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ 
      data: { utilisateursActifs: 100, totalPublications: 50, totalConnexions: 200, signalementsEnAttente: 5, totalEtudiants: 80, totalEnseignants: 20 } 
    });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
      expect(screen.getByText('Publications totales')).toBeInTheDocument();
      expect(screen.getByText('Connexions établies')).toBeInTheDocument();
      expect(screen.getByText('Signalements en attente')).toBeInTheDocument();
    });
  });

  test('affiche les publications en attente', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, utilisateur: { nomComplet: 'Test User' }, contenu: 'Test content', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Publications en attente de validation')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('valide une publication', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, utilisateur: { nomComplet: 'Test User' }, contenu: 'Test content', datePublication: '2024-01-01' }
        ] 
      } 
    });
    adminService.validerPublication.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const validateButton = screen.getByText('✓ Valider');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(adminService.validerPublication).toHaveBeenCalledWith(1);
    });
  });

  test('refuse une publication', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, utilisateur: { nomComplet: 'Test User' }, contenu: 'Test content', datePublication: '2024-01-01' }
        ] 
      } 
    });
    adminService.refuserPublication.mockResolvedValue({});
    global.prompt.mockReturnValue('Motif test');

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const refuseButton = screen.getByText('✗ Refuser');
    fireEvent.click(refuseButton);

    await waitFor(() => {
      expect(adminService.refuserPublication).toHaveBeenCalledWith(1, 'Motif test');
    });
  });

  test('affiche un message si aucune publication en attente', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ data: { documents: [] } });
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune publication en attente de validation.')).toBeInTheDocument();
    });
  });

  test('affiche les documents en attente', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getStatistiques.mockResolvedValue({ data: {} });
    diplomeService.getDocumentsEnAttente.mockResolvedValue({ 
      data: { 
        documents: [
          { id: 1, enseignantNom: 'Teacher', diplomeNom: 'Master' }
        ] 
      } 
    });
    adminService.getPublicationsEnAttente.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Vérifications en attente')).toBeInTheDocument();
      expect(screen.getByText('Teacher')).toBeInTheDocument();
    });
  });
});
