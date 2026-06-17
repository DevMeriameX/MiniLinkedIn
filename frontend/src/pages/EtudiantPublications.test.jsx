import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EtudiantPublications from './EtudiantPublications';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test Student' },
  }),
}));

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock de window.confirm
global.confirm = vi.fn();

describe('EtudiantPublications', () => {
  let etudiantPublicationService, connexionService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    etudiantPublicationService = api.etudiantPublicationService;
    connexionService = api.connexionService;
    etudiantPublicationService.getMesPublications.mockReset();
    etudiantPublicationService.creerPublication.mockReset();
    etudiantPublicationService.modifierPublication.mockReset();
    etudiantPublicationService.supprimerPublication.mockReset();
    connexionService.rechercherUtilisateurs.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mes Publications')).toBeInTheDocument();
    });
  });

  test('charge les publications au montage', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantPublicationService.getMesPublications).toHaveBeenCalled();
    });
  });

  test('affiche la liste des publications', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume test', statut: 'VALIDE', typePublication: 'PROJET' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Publication')).toBeInTheDocument();
      expect(screen.getByText('Resume test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune publication', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Vous n'avez pas encore de publications.")).toBeInTheDocument();
    });
  });

  test('ouvre le modal de création', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nouvelle Publication')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Nouvelle Publication');
    fireEvent.click(newButton);

    expect(screen.getByText('Créer une publication')).toBeInTheDocument();
  });

  test('crée une nouvelle publication', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    etudiantPublicationService.creerPublication.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nouvelle Publication')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Nouvelle Publication');
    fireEvent.click(newButton);

    const titreInput = screen.getByPlaceholderText('Ex: Analyse des algorithmes génétiques');
    const resumeInput = screen.getByPlaceholderText('Une brève description...');
    const contenuInput = screen.getByPlaceholderText('Expliquez votre projet ou article...');

    fireEvent.change(titreInput, { target: { value: 'Test Titre' } });
    fireEvent.change(resumeInput, { target: { value: 'Test Resume' } });
    fireEvent.change(contenuInput, { target: { value: 'Test Contenu' } });

    const submitButton = screen.getByText('Publier maintenant');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(etudiantPublicationService.creerPublication).toHaveBeenCalled();
    });
  });

  test('valide que article de recherche nécessite co-auteur', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nouvelle Publication')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Nouvelle Publication');
    fireEvent.click(newButton);

    const typeSelect = screen.getByDisplayValue('Projet Académique');
    fireEvent.change(typeSelect, { target: { value: 'ARTICLE_RECHERCHE' } });

    const titreInput = screen.getByPlaceholderText('Ex: Analyse des algorithmes génétiques');
    const resumeInput = screen.getByPlaceholderText('Une brève description...');
    const contenuInput = screen.getByPlaceholderText('Expliquez votre projet ou article...');

    fireEvent.change(titreInput, { target: { value: 'Test Titre' } });
    fireEvent.change(resumeInput, { target: { value: 'Test Resume' } });
    fireEvent.change(contenuInput, { target: { value: 'Test Contenu' } });

    const submitButton = screen.getByText('Publier maintenant');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(etudiantPublicationService.creerPublication).not.toHaveBeenCalled();
    });
  });

  test('supprime une publication', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume test', statut: 'EN_ATTENTE' }
        ] 
      } 
    });
    etudiantPublicationService.supprimerPublication.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Publication')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('delete').closest('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(etudiantPublicationService.supprimerPublication).toHaveBeenCalledWith(1);
    });
  });

  test('recherche des co-auteurs', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    connexionService.rechercherUtilisateurs.mockResolvedValue({ 
      data: [{ id: 1, nomComplet: 'Prof Test', role: 'ENSEIGNANT' }] 
    });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nouvelle Publication')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Nouvelle Publication');
    fireEvent.click(newButton);

    const typeSelect = screen.getByDisplayValue('Projet Académique');
    fireEvent.change(typeSelect, { target: { value: 'ARTICLE_RECHERCHE' } });

    const searchInput = screen.getByPlaceholderText('Rechercher un enseignant...');
    fireEvent.change(searchInput, { target: { value: 'Prof' } });

    await waitFor(() => {
      expect(connexionService.rechercherUtilisateurs).toHaveBeenCalledWith('Prof', { role: 'ENSEIGNANT' });
    }, { timeout: 1000 });
  });

  test('affiche le statut des publications', async () => {
    etudiantPublicationService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Pub 1', resume: 'Resume', statut: 'VALIDE', typePublication: 'PROJET' },
          { id: 2, titre: 'Pub 2', resume: 'Resume', statut: 'REFUSE', typePublication: 'PROJET', motifRefus: 'Non conforme' },
          { id: 3, titre: 'Pub 3', resume: 'Resume', statut: 'EN_ATTENTE', typePublication: 'PROJET' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VALIDE')).toBeInTheDocument();
      expect(screen.getByText('REFUSE')).toBeInTheDocument();
      expect(screen.getByText('EN_ATTENTE')).toBeInTheDocument();
    });
  });
});
