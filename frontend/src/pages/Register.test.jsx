import React from 'react';
import * as api from '../services/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Register from './Register';

describe('Register', () => {
  let authService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    authService = api.authService;
    authService.register.mockReset();
  });

  test('rend le composant sans erreur', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Mini LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });

  test('affiche les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jean.dupont@exemple.fr')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Étudiant')).toBeInTheDocument();
    expect(screen.getByText('Enseignant')).toBeInTheDocument();
  });

  test('met à jour les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nomInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('change le rôle de Étudiant à Enseignant', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const enseignantButton = screen.getByText('Enseignant').closest('button');
    fireEvent.click(enseignantButton);

    expect(enseignantButton).toHaveStyle({ backgroundColor: 'rgb(191, 213, 255)' });
  });

  test('toggle la visibilité du mot de passe', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByText('visibility').closest('button');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });

  test('gère le upload de fichier', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('appelle register avec les bonnes données', async () => {
    authService.register.mockResolvedValue({ data: { message: 'Inscription réussie' } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByText('S\'inscrire');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  test('affiche un message de succès après inscription', async () => {
    authService.register.mockResolvedValue({ data: { message: 'Inscription réussie' } });

    const history = createMemoryHistory();
    history.push('/register');

    render(
      <Router location={history.location} navigator={history}>
        <Register />
      </Router>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByText('S\'inscrire');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Inscription réussie')).toBeInTheDocument();
    });
  });

  test('redirige vers /login après inscription réussie', async () => {
    authService.register.mockResolvedValue({ data: { message: 'Inscription réussie' } });

    const history = createMemoryHistory();
    history.push('/register');

    render(
      <Router location={history.location} navigator={history}>
        <Register />
      </Router>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByText('S\'inscrire');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    }, { timeout: 3000 });
  });

  test('affiche une erreur si inscription échoue', async () => {
    authService.register.mockRejectedValue({
      response: { data: { error: 'Email déjà utilisé' } }
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByText('S\'inscrire');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument();
    });
  });

  test('désactive le bouton pendant le chargement', async () => {
    authService.register.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nomInput = screen.getByPlaceholderText('Jean Dupont');
    const emailInput = screen.getByPlaceholderText('jean.dupont@exemple.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByText('S\'inscrire');

    fireEvent.change(nomInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Inscription en cours...')).toBeInTheDocument();
    });
  });

  test('affiche le lien vers login', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });
});
