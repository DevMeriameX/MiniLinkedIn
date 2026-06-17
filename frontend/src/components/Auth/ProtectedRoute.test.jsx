import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock de AuthContext avec variable modifiable
let mockAuth = {
  isAuthenticated: false,
  loading: false,
  isAdmin: false,
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    vi.clearAllMocks();
    mockAuth = {
      isAuthenticated: false,
      loading: false,
      isAdmin: false,
    };
  });

  test('affiche un spinner pendant le chargement', () => {
    mockAuth = {
      isAuthenticated: false,
      loading: true,
      isAdmin: false,
    };
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Vérifie que le spinner est affiché
    const spinner = document.querySelector('div[style*="animation"]');
    expect(spinner).toBeInTheDocument();
  });

  test('redirige vers /login si non authentifié', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Vérifie que le contenu n'est pas affiché
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  test('affiche le contenu si authentifié', () => {
    mockAuth = {
      isAuthenticated: true,
      loading: false,
      isAdmin: false,
    };
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Vérifie que le contenu est affiché
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  test('redirige vers /user/dashboard si adminOnly=true mais pas admin', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute adminOnly={true}>
          <div>Contenu admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Vérifie que le contenu n'est pas affiché
    expect(screen.queryByText('Contenu admin')).not.toBeInTheDocument();
  });

  test('affiche le contenu si adminOnly=true et admin', () => {
    mockAuth = {
      isAuthenticated: true,
      loading: false,
      isAdmin: true,
    };
    
    render(
      <MemoryRouter>
        <ProtectedRoute adminOnly={true}>
          <div>Contenu admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Vérifie que le contenu est affiché
    expect(screen.getByText('Contenu admin')).toBeInTheDocument();
  });
});
