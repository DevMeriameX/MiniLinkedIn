import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';

describe('ResetPassword', () => {
  let authService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    authService = api.authService;
    authService.resetPassword.mockReset();
  });

  test('rend le composant sans erreur', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Reinitialiser le mot de passe')).toBeInTheDocument();
  });

  test('affiche les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Token')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmer le mot de passe')).toBeInTheDocument();
  });

  test('met à jour les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');

    fireEvent.change(tokenInput, { target: { value: 'test-token-123' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });

    expect(tokenInput.value).toBe('test-token-123');
    expect(passwordInput.value).toBe('newpassword123');
    expect(confirmInput.value).toBe('newpassword123');
  });

  test('détecte une incompatibilité de mots de passe', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });

    expect(confirmInput).toHaveStyle({ border: '1px solid #ba1a1a' });
  });

  test('appelle resetPassword avec les bonnes données', async () => {
    authService.resetPassword.mockResolvedValue({ data: { message: 'Mot de passe réinitialisé' } });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(tokenInput, { target: { value: 'test-token-123' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('test-token-123', 'newpassword123');
    });
  });

  test('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument();
    });
  });

  test('affiche un message de succès après réinitialisation', async () => {
    authService.resetPassword.mockResolvedValue({ data: { message: 'Mot de passe réinitialisé' } });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(tokenInput, { target: { value: 'test-token-123' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Mot de passe réinitialisé')).toBeInTheDocument();
    });
  });

  test('affiche une erreur si la réinitialisation échoue', async () => {
    authService.resetPassword.mockRejectedValue({
      response: { data: { error: 'Token invalide' } }
    });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Token invalide')).toBeInTheDocument();
    });
  });

  test('désactive le bouton pendant le chargement', async () => {
    authService.resetPassword.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(tokenInput, { target: { value: 'test-token-123' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Reinitialisation...')).toBeInTheDocument();
    });
  });

  test('désactive le bouton si les mots de passe ne correspondent pas', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Nouveau mot de passe');
    const confirmInput = screen.getByPlaceholderText('Confirmer le mot de passe');
    const submitButton = screen.getByText('Valider');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });

    expect(submitButton).toBeDisabled();
  });

  test('affiche le lien retour connexion', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Retour connexion')).toBeInTheDocument();
  });

  test('lit le token depuis l\'URL', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=test-token-from-url']}>
        <ResetPassword />
      </MemoryRouter>
    );

    const tokenInput = screen.getByPlaceholderText('Token');
    expect(tokenInput.value).toBe('test-token-from-url');
  });
});
