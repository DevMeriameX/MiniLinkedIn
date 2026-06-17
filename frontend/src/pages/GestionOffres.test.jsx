import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GestionOffres from './GestionOffres';

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock de window.confirm
global.confirm = vi.fn();

describe('GestionOffres', () => {
  let offreEnseignantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    offreEnseignantService = api.offreEnseignantService;
    offreEnseignantService.getMesOffres.mockReset();
    offreEnseignantService.creerOffre.mockReset();
    offreEnseignantService.modifierOffre.mockReset();
    offreEnseignantService.supprimerOffre.mockReset();
    offreEnseignantService.archiverOffre.mockReset();
    offreEnseignantService.reactiverOffre.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Gestion des Offres')).toBeInTheDocument();
    });
  });

  test('charge les offres au montage', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(offreEnseignantService.getMesOffres).toHaveBeenCalled();
    });
  });

  test('affiche la liste des offres', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Test Offre', description: 'Description test', type: 'stage', statut: 'active', nbCandidatures: 5, datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Offre')).toBeInTheDocument();
      expect(screen.getByText('Description test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune offre', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Aucune offre ne correspond à vos critères.")).toBeInTheDocument();
    });
  });

  test('ouvre le modal de création', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Publier une nouvelle offre')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Publier une nouvelle offre');
    fireEvent.click(newButton);

    expect(screen.getByText('Nouvelle Offre')).toBeInTheDocument();
  });

  test('crée une nouvelle offre', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });
    offreEnseignantService.creerOffre.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Publier une nouvelle offre')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Publier une nouvelle offre');
    fireEvent.click(newButton);

    const titreInput = screen.getByPlaceholderText('Ex: Stage Analyse de Données');
    const descriptionInput = screen.getByPlaceholderText('Décrivez les missions, pré-requis...');

    fireEvent.change(titreInput, { target: { value: 'Test Titre' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    const submitButton = screen.getByText('Publier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(offreEnseignantService.creerOffre).toHaveBeenCalled();
    });
  });

  test('valide le formulaire avant soumission', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Publier une nouvelle offre')).toBeInTheDocument();
    });

    const newButton = screen.getByText('Publier une nouvelle offre');
    fireEvent.click(newButton);

    const submitButton = screen.getByText('Publier');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le titre est obligatoire')).toBeInTheDocument();
    });
  });

  test('filtre par statut', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Offre 1', type: 'stage', statut: 'active', nbCandidatures: 5, datePublication: '2024-01-01' },
          { id: 2, titre: 'Offre 2', type: 'stage', statut: 'archivee', nbCandidatures: 3, datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Offre 1')).toBeInTheDocument();
    });

    const archiveCheckbox = screen.getByLabelText(/Archivées/i);
    fireEvent.click(archiveCheckbox);

    await waitFor(() => {
      expect(offreEnseignantService.getMesOffres).toHaveBeenCalled();
    });
  });

  test('filtre par type', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage')).toBeInTheDocument();
    });

    const typeButton = screen.getByText('Stage');
    fireEvent.click(typeButton);

    await waitFor(() => {
      expect(offreEnseignantService.getMesOffres).toHaveBeenCalled();
    });
  });

  test('archive une offre', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Test Offre', type: 'stage', statut: 'active', nbCandidatures: 5, datePublication: '2024-01-01' }
        ] 
      } 
    });
    offreEnseignantService.archiverOffre.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Offre')).toBeInTheDocument();
    });

    const archiveButton = screen.getByTitle('Archiver');
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(offreEnseignantService.archiverOffre).toHaveBeenCalledWith(1);
    });
  });

  test('réactive une offre', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Test Offre', type: 'stage', statut: 'archivee', nbCandidatures: 5, datePublication: '2024-01-01' }
        ] 
      } 
    });
    offreEnseignantService.reactiverOffre.mockResolvedValue({});

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Offre')).toBeInTheDocument();
    });

    const reactivateButton = screen.getByText('Réactiver');
    fireEvent.click(reactivateButton);

    await waitFor(() => {
      expect(offreEnseignantService.reactiverOffre).toHaveBeenCalledWith(1);
    });
  });

  test('supprime une offre', async () => {
    offreEnseignantService.getMesOffres.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Test Offre', type: 'stage', statut: 'active', nbCandidatures: 5, datePublication: '2024-01-01' }
        ] 
      } 
    });
    offreEnseignantService.supprimerOffre.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <GestionOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Offre')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Supprimer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(offreEnseignantService.supprimerOffre).toHaveBeenCalledWith(1);
    });
  });
});
