import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GestionComptes from './GestionComptes';

// Mock du LayoutAdmin
vi.mock('../components/AdminLayout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock de window.confirm
global.confirm = vi.fn();

describe('GestionComptes', () => {
  let authService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    authService = api.authService;
    authService.getAllUsers.mockReset();
    authService.activerCompte.mockReset();
    authService.desactiverCompte.mockReset();
    authService.changerRole.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Gestion des Comptes')).toBeInTheDocument();
    });
  });

  test('charge les utilisateurs au montage', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(authService.getAllUsers).toHaveBeenCalled();
    });
  });

  test('affiche la liste des utilisateurs', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', email: 'user1@test.com', role: 'ETUDIANT', actif: true, dateInscription: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    });
  });

  test('affiche les statistiques', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true },
          { id: 2, nomComplet: 'User 2', role: 'ENSEIGNANT', actif: true },
          { id: 3, nomComplet: 'User 3', role: 'ETUDIANT', actif: false }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Membres')).toBeInTheDocument();
      expect(screen.getByText('Comptes Actifs')).toBeInTheDocument();
      expect(screen.getByText('Enseignants')).toBeInTheDocument();
      expect(screen.getByText('En Attente')).toBeInTheDocument();
    });
  });

  test('filtre par nom ou email', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', email: 'user1@test.com', role: 'ETUDIANT', actif: true },
          { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ENSEIGNANT', actif: true }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filtrer par nom ou email...');
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.queryByText('User 2')).not.toBeInTheDocument();
    });
  });

  test('filtre par rôle', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true },
          { id: 2, nomComplet: 'User 2', role: 'ENSEIGNANT', actif: true }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue('Tous les Rôles');
    fireEvent.change(roleSelect, { target: { value: 'ETUDIANT' } });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.queryByText('User 2')).not.toBeInTheDocument();
    });
  });

  test('filtre par statut', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true },
          { id: 2, nomComplet: 'User 2', role: 'ENSEIGNANT', actif: false }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('Tous les Statuts');
    fireEvent.change(statusSelect, { target: { value: 'actif' } });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.queryByText('User 2')).not.toBeInTheDocument();
    });
  });

  test('active un compte', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: false }
        ] 
      } 
    });
    authService.activerCompte.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const activateButton = screen.getByTitle('Activer');
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(authService.activerCompte).toHaveBeenCalledWith(1);
    });
  });

  test('désactive un compte', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true }
        ] 
      } 
    });
    authService.desactiverCompte.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const deactivateButton = screen.getByTitle('Désactiver');
    fireEvent.click(deactivateButton);

    await waitFor(() => {
      expect(authService.desactiverCompte).toHaveBeenCalledWith(1);
    });
  });

  test('change le rôle d\'un utilisateur', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true }
        ] 
      } 
    });
    authService.changerRole.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue('Étudiant');
    fireEvent.change(roleSelect, { target: { value: 'ENSEIGNANT' } });

    await waitFor(() => {
      expect(authService.changerRole).toHaveBeenCalledWith(1, 'ENSEIGNANT');
    });
  });

  test('demande confirmation pour le rôle ADMIN', async () => {
    authService.getAllUsers.mockResolvedValue({ 
      data: { 
        users: [
          { id: 1, nomComplet: 'User 1', role: 'ETUDIANT', actif: true }
        ] 
      } 
    });
    authService.changerRole.mockResolvedValue({});
    global.confirm.mockReturnValue(false);

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue('Étudiant');
    fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Attention : attribuer le rôle ADMIN donne tous les droits. Confirmer ?');
      expect(authService.changerRole).not.toHaveBeenCalled();
    });
  });

  test('affiche un message si aucun utilisateur trouvé', async () => {
    authService.getAllUsers.mockResolvedValue({ data: { users: [] } });

    render(
      <MemoryRouter>
        <GestionComptes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filtrer par nom ou email...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
    });
  });
});
