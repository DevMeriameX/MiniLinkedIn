import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EtudiantOffres from './EtudiantOffres';

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('EtudiantOffres', () => {
  let etudiantOffreService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    etudiantOffreService = api.etudiantOffreService;
    etudiantOffreService.getAll.mockReset();
  });

  test('rend le composant sans erreur', () => {
    etudiantOffreService.getAll.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    expect(screen.getByText('Offres Académiques')).toBeInTheDocument();
  });

  test('charge les offres au montage', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantOffreService.getAll).toHaveBeenCalled();
    });
  });

  test('affiche la liste des offres', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description test', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
      expect(screen.getByText('Par Prof Test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune offre', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune offre disponible pour le moment.')).toBeInTheDocument();
    });
  });

  test('affiche les filtres', () => {
    etudiantOffreService.getAll.mockResolvedValue({ data: { offres: [] } });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('Projet')).toBeInTheDocument();
    expect(screen.getByText('Recherche')).toBeInTheDocument();
  });

  test('filtre par type', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description test', datePublication: '2024-01-01' },
          { id: 2, titre: 'Projet ML', type: 'projet', auteurNom: 'Prof Test2', auteurId: 2, description: 'Description test2', datePublication: '2024-01-02' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
      expect(screen.getByText('Projet ML')).toBeInTheDocument();
    });

    const stageFilter = screen.getByText('Stage');
    fireEvent.click(stageFilter);

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
      expect(screen.queryByText('Projet ML')).not.toBeInTheDocument();
    });
  });

  test('ouvre le modal de détails', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description détaillée', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
    });

    const voirButton = screen.getByText(/Voir détails/i);
    fireEvent.click(voirButton);

    expect(screen.getByText("Description de l'offre")).toBeInTheDocument();
  });

  test('ferme le modal de détails', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description détaillée', datePublication: '2024-01-01' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
    });

    const voirButton = screen.getByText(/Voir détails/i);
    fireEvent.click(voirButton);

    expect(screen.getByText("Description de l'offre")).toBeInTheDocument();

    const closeButton = screen.getByText('Fermer');
    fireEvent.click(closeButton);

    expect(screen.queryByText("Description de l'offre")).not.toBeInTheDocument();
  });

  test('redirige vers la messagerie pour contacter', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description test', datePublication: '2024-01-01' }
        ] 
      } 
    });

    const history = createMemoryHistory();
    history.push('/etudiant/offres');

    render(
      <Router location={history.location} navigator={history}>
        <EtudiantOffres />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Stage IA')).toBeInTheDocument();
    });

    const contactButton = screen.getByText(/Contacter/i);
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/etudiant/messages');
      expect(history.location.search).toBe('?userId=1');
    });
  });

  test('affiche le badge de type avec la bonne couleur', async () => {
    etudiantOffreService.getAll.mockResolvedValue({ 
      data: { 
        offres: [
          { id: 1, titre: 'Stage IA', type: 'stage', auteurNom: 'Prof Test', auteurId: 1, description: 'Description test', datePublication: '2024-01-01' },
          { id: 2, titre: 'Projet ML', type: 'projet', auteurNom: 'Prof Test2', auteurId: 2, description: 'Description test2', datePublication: '2024-01-02' },
          { id: 3, titre: 'Recherche DL', type: 'recherche', auteurNom: 'Prof Test3', auteurId: 3, description: 'Description test3', datePublication: '2024-01-03' }
        ] 
      } 
    });

    render(
      <MemoryRouter>
        <EtudiantOffres />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('stage')).toBeInTheDocument();
      expect(screen.getByText('projet')).toBeInTheDocument();
      expect(screen.getByText('recherche')).toBeInTheDocument();
    });
  });
});
