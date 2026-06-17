import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnseignantProfil from './EnseignantProfil';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test Teacher', role: 'ENSEIGNANT' },
    updateUser: vi.fn(),
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

describe('EnseignantProfil', () => {
  let profilService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    profilService = api.profilService;
    profilService.getMonProfil.mockReset();
    profilService.getExperiences.mockReset();
    profilService.getFormations.mockReset();
    profilService.getCompetences.mockReset();
    profilService.updateProfil.mockReset();
    profilService.updatePassword.mockReset();
    profilService.addExperience.mockReset();
    profilService.updateExperience.mockReset();
    profilService.deleteExperience.mockReset();
    profilService.addFormation.mockReset();
    profilService.updateFormation.mockReset();
    profilService.deleteFormation.mockReset();
    profilService.addCompetence.mockReset();
    profilService.updateCompetence.mockReset();
    profilService.deleteCompetence.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher', role: 'ENSEIGNANT' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Teacher')).toBeInTheDocument();
    });
  });

  test('charge les données du profil au montage', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(profilService.getMonProfil).toHaveBeenCalled();
      expect(profilService.getExperiences).toHaveBeenCalled();
      expect(profilService.getFormations).toHaveBeenCalled();
      expect(profilService.getCompetences).toHaveBeenCalled();
    });
  });

  test('affiche les sections du profil', async () => {
    profilService.getMonProfil.mockResolvedValue({ 
      data: { nomComplet: 'Test Teacher', bio: 'Bio test', depart: 'Informatique', labo: 'Labo Test' } 
    });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('À propos')).toBeInTheDocument();
      expect(screen.getByText('Expériences')).toBeInTheDocument();
      expect(screen.getByText('Formations')).toBeInTheDocument();
      expect(screen.getByText('Compétences')).toBeInTheDocument();
    });
  });

  test('affiche le modal de modification du profil', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier les infos clés')).toBeInTheDocument();
    });

    const modifyButton = screen.getByText('Modifier les infos clés');
    fireEvent.click(modifyButton);

    expect(screen.getByText('Modifier le profil')).toBeInTheDocument();
  });

  test('met à jour le profil', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });
    profilService.updateProfil.mockResolvedValue({ data: { nomComplet: 'Updated Name' } });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier les infos clés')).toBeInTheDocument();
    });

    const modifyButton = screen.getByText('Modifier les infos clés');
    fireEvent.click(modifyButton);

    const nomInput = screen.getByDisplayValue('Test Teacher');
    fireEvent.change(nomInput, { target: { value: 'Updated Name' } });

    const saveButton = screen.getByText('Sauvegarder');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(profilService.updateProfil).toHaveBeenCalled();
    });
  });

  test('affiche le modal d\'ajout d\'expérience', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Expériences')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Expériences').closest('section').querySelector('button');
    fireEvent.click(addButton);

    expect(screen.getByText('Ajouter une expérience')).toBeInTheDocument();
  });

  test('ajoute une expérience', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });
    profilService.addExperience.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Expériences')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Expériences').closest('section').querySelector('button');
    fireEvent.click(addButton);

    const posteInput = screen.getByPlaceholderText('Poste (ex: Professeur)');
    fireEvent.change(posteInput, { target: { value: 'Professeur' } });

    const submitButton = screen.getByText('Ajouter');
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(profilService.addExperience).toHaveBeenCalled();
    });
  });

  test('supprime une expérience', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ 
      data: [{ id: 1, poste: 'Développeur', entreprise: 'Test Corp' }] 
    });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });
    profilService.deleteExperience.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Développeur')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('delete').closest('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(profilService.deleteExperience).toHaveBeenCalledWith(1);
    });
  });

  test('affiche le modal de sécurité du compte', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sécurité')).toBeInTheDocument();
    });

    const securityButton = screen.getByText('Sécurité');
    fireEvent.click(securityButton);

    expect(screen.getByText('Sécurité du compte')).toBeInTheDocument();
  });

  test('met à jour le mot de passe', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });
    profilService.updatePassword.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sécurité')).toBeInTheDocument();
    });

    const securityButton = screen.getByText('Sécurité');
    fireEvent.click(securityButton);

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const oldPasswordInput = passwordInputs[0];
    const newPasswordInput = passwordInputs[1];
    const confirmPasswordInput = passwordInputs[2];

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass' } });

    const updateButton = screen.getByText('Mettre à jour');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(profilService.updatePassword).toHaveBeenCalled();
    });
  });

  test('affiche les compétences', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ 
      data: [
        { id: 1, nom: 'React', niveau: 'AVANCE' },
        { id: 2, nom: 'Node.js', niveau: 'INTERMEDIAIRE' }
      ] 
    });

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  test('ajoute une compétence', async () => {
    profilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Teacher' } });
    profilService.getExperiences.mockResolvedValue({ data: [] });
    profilService.getFormations.mockResolvedValue({ data: [] });
    profilService.getCompetences.mockResolvedValue({ data: [] });
    profilService.addCompetence.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EnseignantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Compétences')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Compétences').closest('section').querySelector('button');
    fireEvent.click(addButton);

    const skillInput = screen.getByPlaceholderText('Compétence (ex: Java, React...)');
    fireEvent.change(skillInput, { target: { value: 'Python' } });

    const submitButton = screen.getByText('Ajouter');
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(profilService.addCompetence).toHaveBeenCalled();
    });
  });
});
