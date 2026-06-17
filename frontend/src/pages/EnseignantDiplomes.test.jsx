import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnseignantDiplomes from './EnseignantDiplomes';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test Teacher' },
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

describe('EnseignantDiplomes', () => {
  let diplomeService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    diplomeService = api.diplomeService;
    diplomeService.getMesDiplomes.mockReset();
    diplomeService.soumettreDiplome.mockReset();
    diplomeService.resoumettreDiplome.mockReset();
    diplomeService.archiverDiplome.mockReset();
    diplomeService.reactiverDiplome.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mes Diplômes')).toBeInTheDocument();
    });
  });

  test('charge les diplômes au montage', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(diplomeService.getMesDiplomes).toHaveBeenCalledWith(1);
    });
  });

  test('affiche le formulaire de soumission', () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    expect(screen.getByText('Soumettre un diplôme')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Master en Intelligence Artificielle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Université Mohammed V')).toBeInTheDocument();
  });

  test('affiche la liste des diplômes', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'EN_ATTENTE', actif: true, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
      expect(screen.getByText('Université Test')).toBeInTheDocument();
    });
  });

  test('affiche un message si aucun diplôme', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun diplôme trouvé')).toBeInTheDocument();
    });
  });

  test('met à jour les champs du formulaire', () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
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
    diplomeService.getMesDiplomes.mockResolvedValue({ data: [] });
    diplomeService.soumettreDiplome.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
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
      expect(diplomeService.soumettreDiplome).toHaveBeenCalled();
    });
  });

  test('archive un diplôme', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE', actif: true, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' }
      ] 
    });
    diplomeService.archiverDiplome.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
    });

    const archiveButton = screen.getByText('Archiver');
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(diplomeService.archiverDiplome).toHaveBeenCalledWith(1, 1);
    });
  });

  test('réactive un diplôme', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE', actif: false, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' }
      ] 
    });
    diplomeService.reactiverDiplome.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    const archivesTab = screen.getByText('Archives');
    fireEvent.click(archivesTab);

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
    });

    const reactivateButton = screen.getByText('Réactiver');
    fireEvent.click(reactivateButton);

    await waitFor(() => {
      expect(diplomeService.reactiverDiplome).toHaveBeenCalledWith(1, 1);
    });
  });

  test('passe en mode modification', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE', actif: true, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Modifier');
    fireEvent.click(editButton);

    expect(screen.getByText('Nouvelle version')).toBeInTheDocument();
  });

  test('affiche le statut des diplômes avec les bonnes couleurs', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE', actif: true, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' },
        { id: 2, diplomeNom: 'Licence Info', etablissement: 'Université Test2', statut: 'REJETE', actif: true, typeDocument: 'DIPLOME_LICENCE', anneeObtention: '2020', dateSoumission: '2024-01-01' },
        { id: 3, diplomeNom: 'Doctorat', etablissement: 'Université Test3', statut: 'EN_ATTENTE', actif: true, typeDocument: 'DIPLOME_DOCTORAT', anneeObtention: '2023', dateSoumission: '2024-01-01' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VERIFIE')).toBeInTheDocument();
      expect(screen.getByText('REJETE')).toBeInTheDocument();
      expect(screen.getByText('EN ATTENTE')).toBeInTheDocument();
    });
  });

  test('filtre entre diplômes actifs et archives', async () => {
    diplomeService.getMesDiplomes.mockResolvedValue({ 
      data: [
        { id: 1, diplomeNom: 'Master IA', etablissement: 'Université Test', statut: 'VERIFIE', actif: true, typeDocument: 'DIPLOME_MASTER', anneeObtention: '2022', dateSoumission: '2024-01-01' },
        { id: 2, diplomeNom: 'Licence Info', etablissement: 'Université Test2', statut: 'VERIFIE', actif: false, typeDocument: 'DIPLOME_LICENCE', anneeObtention: '2020', dateSoumission: '2024-01-01' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantDiplomes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master IA')).toBeInTheDocument();
      expect(screen.queryByText('Licence Info')).not.toBeInTheDocument();
    });

    const archivesTab = screen.getByText('Archives');
    fireEvent.click(archivesTab);

    await waitFor(() => {
      expect(screen.getByText('Licence Info')).toBeInTheDocument();
      expect(screen.queryByText('Master IA')).not.toBeInTheDocument();
    });
  });
});
