import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router, Routes, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EnseignantPublicProfil from './EnseignantPublicProfil';

describe('EnseignantPublicProfil', () => {
  let etudiantEnseignantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    etudiantEnseignantService = api.etudiantEnseignantService;
    etudiantEnseignantService.getProfilEnseignant.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { nomComplet: 'Test Teacher', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Teacher')).toBeInTheDocument();
    });
  });

  test('charge le profil enseignant', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { nomComplet: 'Test Teacher', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantEnseignantService.getProfilEnseignant).toHaveBeenCalledWith('1');
    });
  });

  test('affiche les informations du profil', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Teacher', 
        email: 'test@test.com',
        depart: 'Informatique',
        labo: 'Labo Test',
        bio: 'Bio test'
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Teacher')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
      expect(screen.getByText('Informatique - Labo Test')).toBeInTheDocument();
    });
  });

  test('affiche les compétences', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Teacher',
        competences: [
          { id: 1, nom: 'React', niveau: 'AVANCE' },
          { id: 2, nom: 'Node.js', niveau: 'INTERMEDIAIRE' }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  test('affiche les expériences', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Teacher',
        experiences: [
          { id: 1, poste: 'Professeur', entreprise: 'Université Test' }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Professeur')).toBeInTheDocument();
      expect(screen.getByText('Université Test')).toBeInTheDocument();
    });
  });

  test('affiche les formations', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Teacher',
        formations: [
          { id: 1, etablissement: 'Université Test', diplome: 'Doctorat' }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Université Test')).toBeInTheDocument();
      expect(screen.getByText('Doctorat')).toBeInTheDocument();
    });
  });

  test('retourne en arrière', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { nomComplet: 'Test Teacher' } 
    });

    const history = createMemoryHistory();
    history.push('/etudiant');
    history.push('/etudiant/voir-enseignant/1');

    render(
      <Router location={history.location} navigator={history}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Retour')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Retour');
    fireEvent.click(backButton);

    expect(history.location.pathname).toBe('/etudiant');
  });

  test('affiche un message d\'erreur si profil introuvable', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockRejectedValue({ 
      response: { data: { error: 'Profil introuvable' } } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Profil introuvable')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucune compétence', async () => {
    etudiantEnseignantService.getProfilEnseignant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Teacher',
        competences: []
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-enseignant/1']}>
        <Routes><Route path="/etudiant/voir-enseignant/:id" element={<EnseignantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune compétence renseignée.')).toBeInTheDocument();
    });
  });
});
