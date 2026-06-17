import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AdminLogin from './AdminLogin';

// Mock du login
const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  test('rend le composant sans erreur', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Mini LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Connexion Administrateur')).toBeInTheDocument();
  });

  test('affiche les champs du formulaire', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('admin@atlashorizon.ma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Se connecter en tant qu\'administrateur')).toBeInTheDocument();
  });

  test('met à jour les champs email et password', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    expect(emailInput.value).toBe('admin@test.com');
    expect(passwordInput.value).toBe('admin123');
  });

  test('appelle login avec les bonnes credentials', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ADMIN' } });

    const history = createMemoryHistory();
    history.push('/admin');

    render(
      <Router location={history.location} navigator={history}>
        <AdminLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter en tant qu'administrateur/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'admin123');
    });
  });

  test('redirige vers /dashboard pour un admin', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ADMIN' } });

    const history = createMemoryHistory();
    history.push('/admin');

    render(
      <Router location={history.location} navigator={history}>
        <AdminLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter en tant qu'administrateur/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/dashboard');
    });
  });

  test('redirige vers /user/dashboard si non admin', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { role: 'ENSEIGNANT' } });

    const history = createMemoryHistory();
    history.push('/admin');

    render(
      <Router location={history.location} navigator={history}>
        <AdminLogin />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter en tant qu'administrateur/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/user/dashboard');
    });
  });

  test('affiche une erreur si login échoue', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Identifiants invalides' });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter en tant qu'administrateur/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });

  test('affiche le badge Admin Portal', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  test('affiche le lien vers forgot-password', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Oublié ?')).toBeInTheDocument();
  });

  test('affiche le checkbox Maintenir la session active', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByText('Maintenir la session active')).toBeInTheDocument();
  });

  test('désactive le bouton pendant le chargement', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('admin@atlashorizon.ma');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter en tant qu'administrateur/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Connexion...')).toBeInTheDocument();
    });
  });

  test('affiche le message de sécurité', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByText(/strictement réservée au personnel autorisé/i)).toBeInTheDocument();
  });
});
