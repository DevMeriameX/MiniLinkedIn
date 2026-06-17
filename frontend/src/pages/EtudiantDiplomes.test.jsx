import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EtudiantDiplomes from './EtudiantDiplomes';

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

describe('EtudiantDiplomes', () => {
  let etudiantDiplomeService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    etudiantDiplomeService = api.etudiantDiplomeService;
    etudiantDiplomeService.getMesDiplomes.mockReset();
    etudiantDiplomeService.soumettreDiplome.mockReset();
    etudiantDiplomeService.resoumettreDiplome.mockReset();
    etudiantDiplomeService.supprimerDiplome.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    expect(screen.getByText('Mes Diplômes')).toBeInTheDocument();
  });

  test('affiche le formulaire de soumission', () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    expect(screen.getByText('Soumettre un diplôme')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Master en Intelligence Artificielle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Université Mohammed V')).toBeInTheDocument();
  });

  test('charge les diplômes au montage', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'EN_ATTENTE' }
      ] 
    });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantDiplomeService.getMesDiplomes).toHaveBeenCalledWith(1);
    });
  });

  test('affiche la liste des diplômes', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'EN_ATTENTE', anneeObtention: '2022', dateSoumission: '2024-01-01' }
      ] 
    });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
      expect(screen.getByText('Université Test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucun diplôme', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun diplôme trouvé')).toBeInTheDocument();
    });
  });

  test('met à jour les champs du formulaire', () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    const diplomeInput = screen.getByPlaceholderText('Ex: Master en Intelligence Artificielle');
    const etablissementInput = screen.getByPlaceholderText('Ex: Université Mohammed V');
    const anneeInput = screen.getByPlaceholderText('Ex: 2022');

    fireEvent.change(diplomeInput, { target: { value: 'Test Diplôme' } });
    fireEvent.change(etablissementInput, { target: { value: 'Test Université' } });
    fireEvent.change(anneeInput, { target: { value: '2023' } });

    expect(diplomeInput.value).toBe('Test Diplôme');
    expect(etablissementInput.value).toBe('Test Université');
    expect(anneeInput.value).toBe('2023');
  });

  test('soumet un nouveau diplôme', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });
    etudiantDiplomeService.soumettreDiplome.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    const diplomeInput = screen.getByPlaceholderText('Ex: Master en Intelligence Artificielle');
    const etablissementInput = screen.getByPlaceholderText('Ex: Université Mohammed V');
    const anneeInput = screen.getByPlaceholderText('Ex: 2022');
    const fileInput = document.querySelector('input[type="file"]');
    const submitButton = screen.getByText('Soumettre le dossier');

    fireEvent.change(diplomeInput, { target: { value: 'Test Diplôme' } });
    fireEvent.change(etablissementInput, { target: { value: 'Test Université' } });
    fireEvent.change(anneeInput, { target: { value: '2023' } });
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(etudiantDiplomeService.soumettreDiplome).toHaveBeenCalled();
    });
  });

  test('affiche une erreur si pas de fichier', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    const diplomeInput = screen.getByPlaceholderText('Ex: Master en Intelligence Artificielle');
    const etablissementInput = screen.getByPlaceholderText('Ex: Université Mohammed V');
    const anneeInput = screen.getByPlaceholderText('Ex: 2022');
    const submitButton = screen.getByText('Soumettre le dossier');

    fireEvent.change(diplomeInput, { target: { value: 'Test Diplôme' } });
    fireEvent.change(etablissementInput, { target: { value: 'Test Université' } });
    fireEvent.change(anneeInput, { target: { value: '2023' } });
    
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(etudiantDiplomeService.soumettreDiplome).not.toHaveBeenCalled();
    });
  });

  test('supprime un diplôme', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'EN_ATTENTE' }
      ] 
    });
    etudiantDiplomeService.supprimerDiplome.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(etudiantDiplomeService.supprimerDiplome).toHaveBeenCalledWith(1, 1);
    });
  });

  test('affiche le statut des diplômes avec les bonnes couleurs', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE' },
        { id: 2, diplomeNom: 'Licence Info', etablissement: 'Université Test2', statut: 'REJETE' },
        { id: 3, diplomeNom: 'Doctorat', etablissement: 'Université Test3', statut: 'EN_ATTENTE' }
      ] 
    });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VERIFIE')).toBeInTheDocument();
      expect(screen.getByText('REJETE')).toBeInTheDocument();
      expect(screen.getByText('EN ATTENTE')).toBeInTheDocument();
    });
  });

  test('passe en mode re-soumission', async () => {
    etudiantDiplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'REJETE', typeDocument: 'DIPLOME_MASTER' }
      ] 
    });

    render(
      <MemoryRouter>
        <EtudiantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Soumettre à nouveau')).toBeInTheDocument();
    });

    const resubmitButton = screen.getByText('Soumettre à nouveau');
    fireEvent.click(resubmitButton);

    expect(screen.getByText('Nouvelle version')).toBeInTheDocument();
  });
});
