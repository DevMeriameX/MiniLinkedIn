import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router, Routes, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EtudiantPublicProfil from './EtudiantPublicProfil';

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('EtudiantPublicProfil', () => {
  let enseignantEtudiantService, etudiantEnseignantService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    enseignantEtudiantService = api.enseignantEtudiantService;
    etudiantEnseignantService = api.etudiantEnseignantService;
    enseignantEtudiantService.getProfilEtudiant.mockReset();
    enseignantEtudiantService.recommanderEtudiant.mockReset();
    etudiantEnseignantService.getProfilEtudiant.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: 1, nomComplet: 'Test User', role: 'ENSEIGNANT' } });
  });

  test('rend le composant sans erreur', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { nomComplet: 'Test Student', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });
  });

  test('charge le profil étudiant pour un enseignant', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { nomComplet: 'Test Student', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(enseignantEtudiantService.getProfilEtudiant).toHaveBeenCalledWith('1');
    });
  });

  test('charge le profil étudiant pour un autre étudiant', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, nomComplet: 'Test User', role: 'ETUDIANT' } });
    etudiantEnseignantService.getProfilEtudiant.mockResolvedValue({ 
      data: { nomComplet: 'Test Student', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantEnseignantService.getProfilEtudiant).toHaveBeenCalledWith('1');
    });
  });

  test('affiche les informations du profil', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student', 
        email: 'test@test.com',
        filiere: 'Informatique',
        niveauEtudes: 'Master',
        statutAcademique: 'ACTIF',
        bio: 'Bio test'
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
      expect(screen.getByText('Informatique')).toBeInTheDocument();
      expect(screen.getByText('Master')).toBeInTheDocument();
    });
  });

  test('affiche les compétences', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student',
        competences: [
          { id: 1, nom: 'React', niveau: 'AVANCE' },
          { id: 2, nom: 'Node.js', niveau: 'INTERMEDIAIRE' }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  test('affiche les expériences', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student',
        experiences: [
          { id: 1, poste: 'Développeur', entreprise: 'Test Corp', dateDebut: '2022-01-01', actuel: true }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Développeur')).toBeInTheDocument();
      expect(screen.getByText('Test Corp')).toBeInTheDocument();
    });
  });

  test('affiche les formations', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student',
        formations: [
          { id: 1, etablissement: 'Université Test', diplome: 'Master IA', dateDebut: '2020-09-01', dateFin: '2022-06-30' }
        ]
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Université Test')).toBeInTheDocument();
      expect(screen.getByText('Master IA')).toBeInTheDocument();
    });
  });

  test('recommande un étudiant', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student',
        isConnected: true,
        hasRecommended: false
      } 
    });
    enseignantEtudiantService.recommanderEtudiant.mockResolvedValue({ data: { message: 'Recommandé' } });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recommander cet étudiant')).toBeInTheDocument();
    });

    const recommendButton = screen.getByText('Recommander cet étudiant');
    fireEvent.click(recommendButton);

    await waitFor(() => {
      expect(enseignantEtudiantService.recommanderEtudiant).toHaveBeenCalledWith('1');
    });
  });

  test('affiche déjà recommandé si déjà recommandé', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { 
        nomComplet: 'Test Student',
        isConnected: true,
        hasRecommended: true
      } 
    });

    render(
      <MemoryRouter initialEntries={['/etudiant/voir-etudiant/1']}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Déjà recommandé')).toBeInTheDocument();
    });
  });

  test('retourne en arrière', async () => {
    enseignantEtudiantService.getProfilEtudiant.mockResolvedValue({ 
      data: { nomComplet: 'Test Student' } 
    });

    const history = createMemoryHistory();
    history.push('/etudiant');
    history.push('/etudiant/voir-etudiant/1');

    render(
      <Router location={history.location} navigator={history}>
        <Routes><Route path="/etudiant/voir-etudiant/:id" element={<EtudiantPublicProfil />} /></Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Retour au réseau')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Retour au réseau');
    fireEvent.click(backButton);

    expect(history.location.pathname).toBe('/etudiant');
  });
});
