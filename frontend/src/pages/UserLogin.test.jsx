import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import UserLogin from './UserLogin';

// Mock du login
const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('UserLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  test('rend le composant sans erreur', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Mini LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Connectez-vous')).toBeInTheDocument();
  });

  test('affiche les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('nom@institution.fr')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  test('met à jour les champs email et password', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('appelle login avec les bonnes credentials', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ETUDIANT' } });

    const history = createMemoryHistory();
    history.push('/login');

    render(
      <Router location={history.location} navigator={history}>
        <UserLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  test('redirige vers /user/dashboard pour un étudiant', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ETUDIANT' } });

    const history = createMemoryHistory();
    history.push('/login');

    render(
      <Router location={history.location} navigator={history}>
        <UserLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/user/dashboard');
    });
  });

  test('redirige vers /enseignant/dashboard pour un enseignant', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ENSEIGNANT' } });

    const history = createMemoryHistory();
    history.push('/login');

    render(
      <Router location={history.location} navigator={history}>
        <UserLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'enseignant@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/enseignant/dashboard');
    });
  });

  test('redirige vers /dashboard pour un admin', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ADMIN' } });

    const history = createMemoryHistory();
    history.push('/login');

    render(
      <Router location={history.location} navigator={history}>
        <UserLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/dashboard');
    });
  });

  test('affiche une erreur si login échoue', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Email ou mot de passe incorrect' });

    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });
  });

  test('affiche le lien vers forgot-password', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
  });

  test('affiche le lien vers register', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('S\'inscrire')).toBeInTheDocument();
  });

  test('désactive le bouton pendant le chargement', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('nom@institution.fr');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Connexion...')).toBeInTheDocument();
    });
  });
});
