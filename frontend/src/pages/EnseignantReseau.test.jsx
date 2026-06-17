import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EnseignantReseau from './EnseignantReseau';

const viMockUserReseau = { id: 1, nomComplet: 'Test Teacher' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: viMockUserReseau,
  }),
}));

// Mock de sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(() => JSON.stringify({ id: 1 })),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

global.sessionStorage = viMockSessionStorage;

// Mock de window.confirm
global.confirm = vi.fn();

describe('EnseignantReseau', () => {
  let connexionService, enseignantEtudiantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    connexionService = api.connexionService;
    enseignantEtudiantService = api.enseignantEtudiantService;
    connexionService.getConnexionsAcceptees.mockReset();
    connexionService.getDemandesRecues.mockReset();
    connexionService.getSuggestions.mockReset();
    connexionService.rechercherUtilisateurs.mockReset();
    connexionService.envoyerDemande.mockReset();
    connexionService.accepterDemande.mockReset();
    connexionService.refuserDemande.mockReset();
    connexionService.supprimerConnexion.mockReset();
    enseignantEtudiantService.recommanderEtudiant.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mon Réseau')).toBeInTheDocument();
    });
  });

  test('charge les connexions au montage', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(connexionService.getConnexionsAcceptees).toHaveBeenCalled();
    });
  });

  test('affiche les onglets', () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    expect(screen.getByText('Mes connexions')).toBeInTheDocument();
    expect(screen.getByText('Demandes reçues')).toBeInTheDocument();
    expect(screen.getByText('Rechercher')).toBeInTheDocument();
  });

  test('change d\'onglet', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ data: [] });
    connexionService.getDemandesRecues.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const demandesTab = screen.getByText('Demandes reçues');
    fireEvent.click(demandesTab);

    await waitFor(() => {
      expect(connexionService.getDemandesRecues).toHaveBeenCalled();
    });
  });

  test('affiche les connexions', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 1, nomComplet: 'User 1', email: 'user1@test.com', role: 'ENSEIGNANT' }, destinataire: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/User 2/i)).toBeInTheDocument();
    });
  });

  test('affiche les demandes reçues', async () => {
    connexionService.getDemandesRecues.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const demandesTab = screen.getByText('Demandes reçues');
    fireEvent.click(demandesTab);

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  test('accepte une demande', async () => {
    connexionService.getDemandesRecues.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });
    connexionService.accepterDemande.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const demandesTab = screen.getByText('Demandes reçues');
    fireEvent.click(demandesTab);

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const acceptButton = screen.getByText('Accepter');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(connexionService.accepterDemande).toHaveBeenCalledWith(1);
    });
  });

  test('refuse une demande', async () => {
    connexionService.getDemandesRecues.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });
    connexionService.refuserDemande.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const demandesTab = screen.getByText('Demandes reçues');
    fireEvent.click(demandesTab);

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    const refuseButton = screen.getByText('Refuser');
    fireEvent.click(refuseButton);

    await waitFor(() => {
      expect(connexionService.refuserDemande).toHaveBeenCalledWith(1);
    });
  });

  test('recherche des utilisateurs', async () => {
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    connexionService.rechercherUtilisateurs.mockResolvedValue({ 
      data: [
        { id: 3, nomComplet: 'User 3', email: 'user3@test.com', role: 'ENSEIGNANT' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const rechercherTab = screen.getByText('Rechercher');
    fireEvent.click(rechercherTab);

    await waitFor(() => {
      expect(connexionService.getSuggestions).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou email...');
    fireEvent.change(searchInput, { target: { value: 'User 3' } });

    await waitFor(() => {
      expect(connexionService.rechercherUtilisateurs).toHaveBeenCalledWith('User 3', expect.any(Object));
    }, { timeout: 1000 });
  });

  test('envoie une demande de connexion', async () => {
    connexionService.getSuggestions.mockResolvedValue({ 
      data: [
        { id: 3, nomComplet: 'User 3', email: 'user3@test.com', role: 'ENSEIGNANT' }
      ] 
    });
    connexionService.envoyerDemande.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const rechercherTab = screen.getByText('Rechercher');
    fireEvent.click(rechercherTab);

    await waitFor(() => {
      expect(screen.getByText('User 3')).toBeInTheDocument();
    });

    const connectButton = screen.getByText('Se connecter');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(connexionService.envoyerDemande).toHaveBeenCalledWith(3);
    });
  });

  test('supprime une connexion', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 1, nomComplet: 'User 1', email: 'user1@test.com', role: 'ENSEIGNANT' }, destinataire: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });
    connexionService.supprimerConnexion.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/User 2/i)).toBeInTheDocument();
    });

    const kebabButton = screen.getByText('⋮');
    fireEvent.click(kebabButton);

    const deleteButton = screen.getByText('Supprimer la connexion');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(connexionService.supprimerConnexion).toHaveBeenCalledWith(1);
    });
  });

  test('recommande un étudiant', async () => {
    connexionService.getConnexionsAcceptees.mockResolvedValue({ 
      data: [
        { id: 1, demandeur: { id: 1, nomComplet: 'User 1', email: 'user1@test.com', role: 'ENSEIGNANT' }, destinataire: { id: 2, nomComplet: 'User 2', email: 'user2@test.com', role: 'ETUDIANT' } }
      ] 
    });
    enseignantEtudiantService.recommanderEtudiant.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/User 2/i)).toBeInTheDocument();
    });

    const kebabButton = screen.getByText('⋮');
    fireEvent.click(kebabButton);

    const recommendButton = screen.getByText('Recommander');
    fireEvent.click(recommendButton);

    await waitFor(() => {
      expect(enseignantEtudiantService.recommanderEtudiant).toHaveBeenCalledWith(2);
    });
  });

  test('filtre par rôle dans la recherche', async () => {
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    connexionService.rechercherUtilisateurs.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantReseau />
      </MemoryRouter>
    );

    const rechercherTab = screen.getByText('Rechercher');
    fireEvent.click(rechercherTab);

    await waitFor(() => {
      expect(connexionService.getSuggestions).toHaveBeenCalled();
    });

    const roleSelect = screen.getByDisplayValue('Tous rôles');
    fireEvent.change(roleSelect, { target: { value: 'ENSEIGNANT' } });

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou email...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(connexionService.rechercherUtilisateurs).toHaveBeenCalledWith('Test', { role: 'ENSEIGNANT' });
    }, { timeout: 1000 });
  });
});
