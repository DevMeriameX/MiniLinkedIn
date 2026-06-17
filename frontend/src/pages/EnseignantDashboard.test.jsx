import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnseignantDashboard from './EnseignantDashboard';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test Teacher', role: 'ENSEIGNANT' },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    nonLusCount: 0,
    socialNotifications: [],
    socialNonLusCount: 0,
    totalNonLusCount: 0,
  }),
}));

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock de window.confirm et window.prompt
global.confirm = vi.fn();
global.prompt = vi.fn();

describe('EnseignantDashboard', () => {
  let socialService, connexionService, publicationEnseignantService, profilService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    socialService = api.socialService;
    connexionService = api.connexionService;
    publicationEnseignantService = api.publicationEnseignantService;
    profilService = api.profilService;
    socialService.getPublications.mockReset();
    connexionService.getSuggestions.mockReset();
    connexionService.countConnexions.mockReset();
    publicationEnseignantService.getMesPublications.mockReset();
    profilService.getMonProfil.mockReset();
    socialService.reactToPublication.mockReset();
    socialService.addCommentaire.mockReset();
    socialService.getCommentaires.mockReset();
    socialService.signalerPublication.mockReset();
    publicationEnseignantService.creerPublication.mockReset();
    publicationEnseignantService.supprimerPublication.mockReset();
    global.confirm.mockReset();
    global.prompt.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Espace Enseignant/)).toBeInTheDocument();
    });
  });

  test('charge le fil social au montage', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(socialService.getPublications).toHaveBeenCalled();
    });
  });

  test('affiche les statistiques', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 5 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mes Publications')).toBeInTheDocument();
      expect(screen.getByText('Mon Réseau')).toBeInTheDocument();
      expect(screen.getByText('Total Réactions')).toBeInTheDocument();
    });
  });

  test('affiche les suggestions de réseau', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ 
      data: [
        { id: 2, nomComplet: 'User 2', role: 'ETUDIANT' }
      ] 
    });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  test('ouvre le modal de création de publication', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Partagez une ressource ou une annonce...')).toBeInTheDocument();
    });

    const postButton = screen.getByText('Partagez une ressource ou une annonce...');
    fireEvent.click(postButton);

    expect(screen.getByText('Nouvelle Publication')).toBeInTheDocument();
  });

  test('crée une nouvelle publication', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });
    publicationEnseignantService.creerPublication.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Partagez une ressource ou une annonce...')).toBeInTheDocument();
    });

    const postButton = screen.getByText('Partagez une ressource ou une annonce...');
    fireEvent.click(postButton);

    const titreInput = screen.getByPlaceholderText('Titre de votre publication');
    const contenuInput = screen.getByPlaceholderText('Partagez votre expertise...');

    fireEvent.change(titreInput, { target: { value: 'Test Titre' } });
    fireEvent.change(contenuInput, { target: { value: 'Test Contenu' } });

    const submitButton = screen.getByText('Publier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(publicationEnseignantService.creerPublication).toHaveBeenCalled();
    });
  });

  test('réagit à une publication', async () => {
    socialService.getPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Pub', contenu: 'Contenu', statut: 'VALIDE', auteurId: 2, auteurNom: 'User 2', auteurRole: 'ENSEIGNANT', datePublication: '2024-01-01', nombreReactions: 0, nombreCommentaires: 0 }
        ] 
      } 
    });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });
    socialService.reactToPublication.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Pub')).toBeInTheDocument();
    });

    const likeButton = screen.getByText('thumb_up').closest('button');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(socialService.reactToPublication).toHaveBeenCalledWith(1, 'LIKE');
    });
  });

  test('ajoute un commentaire', async () => {
    socialService.getPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Pub', contenu: 'Contenu', statut: 'VALIDE', auteurId: 2, auteurNom: 'User 2', auteurRole: 'ENSEIGNANT', datePublication: '2024-01-01', nombreReactions: 0, nombreCommentaires: 0 }
        ] 
      } 
    });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });
    socialService.addCommentaire.mockResolvedValue({});
    socialService.getCommentaires.mockResolvedValue({ data: { commentaires: [] } });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Pub')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Répondez à cette publication...');
    fireEvent.change(commentInput, { target: { value: 'Test commentaire' } });

    const sendButton = screen.getByText('send').closest('button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(socialService.addCommentaire).toHaveBeenCalled();
    });
  });

  test('supprime sa propre publication', async () => {
    socialService.getPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Pub', contenu: 'Contenu', statut: 'VALIDE', auteurId: 1, auteurNom: 'Test Teacher', auteurRole: 'ENSEIGNANT', datePublication: '2024-01-01', nombreReactions: 0, nombreCommentaires: 0 }
        ] 
      } 
    });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });
    publicationEnseignantService.supprimerPublication.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Pub')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('delete').closest('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(publicationEnseignantService.supprimerPublication).toHaveBeenCalled();
    });
  });

  test('signale une publication', async () => {
    socialService.getPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Pub', contenu: 'Contenu', statut: 'VALIDE', auteurId: 2, auteurNom: 'User 2', auteurRole: 'ENSEIGNANT', datePublication: '2024-01-01', nombreReactions: 0, nombreCommentaires: 0 }
        ] 
      } 
    });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });
    socialService.signalerPublication.mockResolvedValue({});
    global.prompt.mockReturnValue('Raison test');

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Pub')).toBeInTheDocument();
    });

    const reportButton = screen.getByText('report').closest('button');
    fireEvent.click(reportButton);

    await waitFor(() => {
      expect(socialService.signalerPublication).toHaveBeenCalled();
    });
  });

  test('affiche un message si aucune publication', async () => {
    socialService.getPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.getSuggestions.mockResolvedValue({ data: [] });
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.countConnexions.mockResolvedValue({ data: 0 });
    profilService.getMonProfil.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <EnseignantDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune actualité pour le moment')).toBeInTheDocument();
    });
  });
});
