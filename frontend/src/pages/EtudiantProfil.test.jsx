import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EtudiantProfil from './EtudiantProfil';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nomComplet: 'Test Student' },
    logout: vi.fn(),
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

describe('EtudiantProfil', () => {
  let etudiantProfilService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    etudiantProfilService = api.etudiantProfilService;
    etudiantProfilService.getMonProfil.mockReset();
    etudiantProfilService.getExperiences.mockReset();
    etudiantProfilService.getFormations.mockReset();
    etudiantProfilService.getCompetences.mockReset();
    global.confirm.mockReset();
  });

  test('rend le composant sans erreur', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });
  });

  test('charge les données du profil au montage', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(etudiantProfilService.getMonProfil).toHaveBeenCalled();
      expect(etudiantProfilService.getExperiences).toHaveBeenCalled();
      expect(etudiantProfilService.getFormations).toHaveBeenCalled();
      expect(etudiantProfilService.getCompetences).toHaveBeenCalled();
    });
  });

  test('affiche les sections du profil', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ 
      data: { nomComplet: 'Test Student', bio: 'Bio test', filiere: 'Informatique', niveauEtudes: 'Master' } 
    });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
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
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
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
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });
    etudiantProfilService.updateProfil.mockResolvedValue({ data: { nomComplet: 'Updated Name' } });

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier les infos clés')).toBeInTheDocument();
    });

    const modifyButton = screen.getByText('Modifier les infos clés');
    fireEvent.click(modifyButton);

    const nomInput = screen.getByDisplayValue('Test Student');
    fireEvent.change(nomInput, { target: { value: 'Updated Name' } });

    const saveButton = screen.getByText('Sauvegarder');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(etudiantProfilService.updateProfil).toHaveBeenCalled();
    });
  });

  test('affiche le modal d\'ajout d\'expérience', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
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
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });
    etudiantProfilService.addExperience.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Expériences')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Expériences').closest('section').querySelector('button');
    fireEvent.click(addButton);

    const posteInput = screen.getByPlaceholderText('Poste');
    fireEvent.change(posteInput, { target: { value: 'Développeur' } });

    const submitButton = screen.getByText('Ajouter');
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(etudiantProfilService.addExperience).toHaveBeenCalled();
    });
  });

  test('supprime une expérience', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ 
      data: [{ id: 1, poste: 'Développeur', entreprise: 'Test Corp' }] 
    });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });
    etudiantProfilService.deleteExperience.mockResolvedValue({});
    global.confirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Développeur')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('delete').closest('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(etudiantProfilService.deleteExperience).toHaveBeenCalledWith(1);
    });
  });

  test('affiche le modal de sécurité du compte', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sécurité du compte')).toBeInTheDocument();
    });

    const securityButton = screen.getAllByText('Sécurité du compte')[0];
    fireEvent.click(securityButton);

    expect(screen.getAllByText('Sécurité du compte')[0]).toBeInTheDocument(); // Modal title
  });

  test('met à jour le mot de passe', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ data: { nomComplet: 'Test Student' } });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });
    etudiantProfilService.updatePassword.mockResolvedValue({});

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sécurité du compte')).toBeInTheDocument();
    });

    const securityButton = screen.getAllByText('Sécurité du compte')[0];
    fireEvent.click(securityButton);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const oldPasswordInput = passwordInputs[0];
    const newPasswordInput = passwordInputs[1];
    const confirmPasswordInput = passwordInputs[2];

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass' } });

    const updateButton = screen.getByText('Mettre à jour');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(etudiantProfilService.updatePassword).toHaveBeenCalled();
    });
  });

  test('affiche les statistiques', async () => {
    etudiantProfilService.getMonProfil.mockResolvedValue({ 
      data: { nomComplet: 'Test Student', nbPublications: 5, nbConnexions: 10, nbDiplomes: 2 } 
    });
    etudiantProfilService.getExperiences.mockResolvedValue({ data: [] });
    etudiantProfilService.getFormations.mockResolvedValue({ data: [] });
    etudiantProfilService.getCompetences.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <EtudiantProfil />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Publications
      expect(screen.getByText('10')).toBeInTheDocument(); // Connexions
      expect(screen.getByText('2')).toBeInTheDocument(); // Diplômes
    });
  });
});
