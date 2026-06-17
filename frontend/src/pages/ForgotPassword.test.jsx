import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

describe('ForgotPassword', () => {
  let authService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    authService = api.authService;
    authService.forgotPassword.mockReset();
  });

  test('rend le composant sans erreur', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Mot de passe oublie')).toBeInTheDocument();
  });

  test('affiche le champ email', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('email@exemple.com')).toBeInTheDocument();
  });

  test('met à jour le champ email', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    expect(emailInput.value).toBe('test@test.com');
  });

  test('appelle forgotPassword avec le bon email', async () => {
    authService.forgotPassword.mockResolvedValue({ data: { token: 'test-token-123' } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    const submitButton = screen.getByText('Generer un token');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  test('affiche le token après génération réussie', async () => {
    authService.forgotPassword.mockResolvedValue({ data: { token: 'test-token-123' } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    const submitButton = screen.getByText('Generer un token');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('test-token-123')).toBeInTheDocument();
    });
  });

  test('affiche le lien vers reset-password avec le token', async () => {
    authService.forgotPassword.mockResolvedValue({ data: { token: 'test-token-123' } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    const submitButton = screen.getByText('Generer un token');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Aller a la page de reinitialisation')).toBeInTheDocument();
    });
  });

  test('affiche une erreur si la demande échoue', async () => {
    authService.forgotPassword.mockRejectedValue({
      response: { data: { error: 'Email non trouvé' } }
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    const submitButton = screen.getByText('Generer un token');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email non trouvé')).toBeInTheDocument();
    });
  });

  test('désactive le bouton pendant le chargement', async () => {
    authService.forgotPassword.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@exemple.com');
    const submitButton = screen.getByText('Generer un token');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Generation...')).toBeInTheDocument();
    });
  });

  test('affiche le lien retour connexion', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Retour connexion')).toBeInTheDocument();
  });
});
