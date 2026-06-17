import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnseignantPublications from './EnseignantPublications';

const viMockUser = { id: 1, nomComplet: 'Test Teacher', email: 'test@test.com' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: viMockUser,
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

describe('EnseignantPublications', () => {
  let publicationEnseignantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    publicationEnseignantService = api.publicationEnseignantService;
    publicationEnseignantService.getMesPublications.mockReset();
    publicationEnseignantService.creerPublication.mockReset();
    publicationEnseignantService.modifierPublication.mockReset();
    publicationEnseignantService.supprimerPublication.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mes publications')).toBeInTheDocument();
    });
  });

  test('charge les publications au montage', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(publicationEnseignantService.getMesPublications).toHaveBeenCalled();
    });
  });

  test('affiche la liste des publications', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume test', statut: 'VALIDE', typePublication: 'PROJET', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Publication')).toBeInTheDocument();
      expect(screen.getByText('Resume test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune publication', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Vous n'avez pas encore publié de contenu.")).toBeInTheDocument();
    });
  });

  test('ouvre le formulaire de création', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nouvelle publication/i)).toBeInTheDocument();
    });

    const newButton = screen.getByText(/Nouvelle publication/i);
    fireEvent.click(newButton);

    expect(screen.getByText('Créer une publication')).toBeInTheDocument();
  });

  test('crée une nouvelle publication', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ data: { publications: [] } });
    publicationEnseignantService.creerPublication.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nouvelle publication/i)).toBeInTheDocument();
    });

    const newButton = screen.getByText(/Nouvelle publication/i);
    fireEvent.click(newButton);

    const titreInput = screen.getByPlaceholderText('Titre de la publication');
    const resumeInput = screen.getByPlaceholderText('Résumé rapide');
    const contenuInput = screen.getByPlaceholderText('Décrivez votre recherche ou partagez un article...');

    fireEvent.change(titreInput, { target: { value: 'Test Titre' } });
    fireEvent.change(resumeInput, { target: { value: 'Test Resume' } });
    fireEvent.change(contenuInput, { target: { value: 'Test Contenu' } });

    const submitButton = screen.getByText('Publier maintenant');
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(publicationEnseignantService.creerPublication).toHaveBeenCalled();
    });
  });

  test('modifie une publication', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume test', statut: 'EN_ATTENTE', typePublication: 'PROJET', datePublication: '2024-01-01' }
        ] 
      } 
    });
    publicationEnseignantService.modifierPublication.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Publication')).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Modifier/i);
    fireEvent.click(editButton);

    expect(screen.getByText('Modifier la publication')).toBeInTheDocument();

    const titreInput = screen.getByDisplayValue('Test Publication');
    fireEvent.change(titreInput, { target: { value: 'Updated Title' } });

    const submitButton = screen.getByText('Enregistrer les modifications');
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(publicationEnseignantService.modifierPublication).toHaveBeenCalled();
    });
  });

  test('supprime une publication', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume test', statut: 'EN_ATTENTE', typePublication: 'PROJET', datePublication: '2024-01-01' }
        ] 
      } 
    });
    publicationEnseignantService.supprimerPublication.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Publication')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/Supprimer/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(publicationEnseignantService.supprimerPublication).toHaveBeenCalled();
    });
  });

  test('affiche le statut des publications', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Pub 1', resume: 'Resume', statut: 'VALIDE', typePublication: 'PROJET', datePublication: '2024-01-01' },
          { id: 2, titre: 'Pub 2', resume: 'Resume', statut: 'REFUSE', typePublication: 'PROJET', datePublication: '2024-01-01' },
          { id: 3, titre: 'Pub 3', resume: 'Resume', statut: 'EN_ATTENTE', typePublication: 'PROJET', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('✅ Validé')).toBeInTheDocument();
      expect(screen.getByText('❌ Refusé')).toBeInTheDocument();
      expect(screen.getByText('⏳ En attente')).toBeInTheDocument();
    });
  });

  test('affiche le type de publication', async () => {
    publicationEnseignantService.getMesPublications.mockResolvedValue({ 
      data: { 
        publications: [
          { id: 1, titre: 'Test Publication', resume: 'Resume', statut: 'VALIDE', typePublication: 'ARTICLE_RECHERCHE', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EnseignantPublications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ARTICLE_RECHERCHE')).toBeInTheDocument();
    });
  });
});
