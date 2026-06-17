import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AdminLayout from './AdminLayout';
import { notificationService } from '../services/api';

// Mock sessionStorage
const viMockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: viMockSessionStorage,
});

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viMockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify({ nomComplet: 'Admin User' });
      return null;
    });
  });

  test('rend le composant sans erreur', () => {
    notificationService.getAll.mockResolvedValue({
      data: { notifications: [], nonLus: 0 }
    });

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu enfant</div>
        </AdminLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Mini LinkedIn Admin')).toBeInTheDocument();
    expect(screen.getByText('Contenu enfant')).toBeInTheDocument();
  });

  test('affiche les éléments de menu', () => {
    notificationService.getAll.mockResolvedValue({
      data: { notifications: [], nonLus: 0 }
    });

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Gestion des comptes')).toBeInTheDocument();
    expect(screen.getByText('Modération')).toBeInTheDocument();
    expect(screen.getByText('Signalements')).toBeInTheDocument();
    expect(screen.getByText('Vérification des attestations')).toBeInTheDocument();
    expect(screen.getByText('Publications')).toBeInTheDocument();
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
  });

  test('affiche le badge de notifications si nonLus > 0', async () => {
    notificationService.getAll.mockResolvedValue({
      data: { notifications: [], nonLus: 5 }
    });

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </MemoryRouter>
    );

    await waitFor(() => {
      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
    });
  });

  test('affiche le panneau de notifications au clic', async () => {
    notificationService.getAll.mockResolvedValue({
      data: {
        notifications: [
          { id: 1, message: 'Test notification', statut: 'NON_LU', dateNotification: new Date() }
        ],
        nonLus: 1
      }
    });

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </MemoryRouter>
    );

    const notificationButton = screen.getByText('notifications').closest('button');
    fireEvent.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });
  });

  test('affiche "Aucune notification" si pas de notifications', async () => {
    notificationService.getAll.mockResolvedValue({
      data: { notifications: [], nonLus: 0 }
    });

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </MemoryRouter>
    );

    const notificationButton = screen.getByText('notifications').closest('button');
    fireEvent.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Aucune notification')).toBeInTheDocument();
    });
  });

  test('gère le logout correctement', () => {
    notificationService.getAll.mockResolvedValue({
      data: { notifications: [], nonLus: 0 }
    });

    const history = createMemoryHistory();
    history.push('/dashboard');

    render(
      <Router location={history.location} navigator={history}>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </Router>
    );

    const logoutButton = screen.getByText('logout').closest('button');
    fireEvent.click(logoutButton);

    expect(viMockSessionStorage.removeItem).toHaveBeenCalledWith('token');
    expect(viMockSessionStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('marque une notification comme lue au clic', async () => {
    notificationService.getAll.mockResolvedValue({
      data: {
        notifications: [
          { id: 1, message: 'Test notification', statut: 'NON_LU', dateNotification: new Date() }
        ],
        nonLus: 1
      }
    });
    notificationService.marquerCommeLue.mockResolvedValue({});

    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Contenu</div>
        </AdminLayout>
      </MemoryRouter>
    );

    const notificationButton = screen.getByText('notifications').closest('button');
    fireEvent.click(notificationButton);

    await waitFor(() => {
      const notifItem = screen.getByText('Test notification');
      fireEvent.click(notifItem);
    });

    await waitFor(() => {
      expect(notificationService.marquerCommeLue).toHaveBeenCalledWith(1);
    });
  });
});
vi.mock('../services/api'); 
