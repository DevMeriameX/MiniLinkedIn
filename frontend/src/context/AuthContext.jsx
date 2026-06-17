import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      if (!userData.id) {
        // Tentative de récupération asynchrone si l'ID est manquant
        const recoverId = async () => {
          try {
            console.log('Tentative de récupération auto de l\'ID via /enseignant/me...');
            const meRes = await api.get('/enseignant/me');
            console.log('Auto-recovery Response:', meRes.data);
            if (meRes.data && meRes.data.id) {
              userData.id = meRes.data.id;
              sessionStorage.setItem('user', JSON.stringify(userData));
              setUser({ ...userData });
            }
          } catch (err) {
            console.warn('Echec de récupération auto de l\'ID:', err.response?.status, err.message);
          }
        };
        recoverId();
      }
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Erreur décodage JWT:', e);
      return null;
    }
  };

  const login = async (email, motDePasse) => {
    try {
      const response = await authService.login({ email, motDePasse });
      console.log('Login API Response:', response.data);
      let { token, ...userData } = response.data;
      
      // Tentative de récupération de l'ID via le nouvel endpoint /enseignant/me
      if (!userData.id) {
        try {
          // IMPORTANT: Stocker le token AVANT l'appel pour que l'intercepteur axios puisse le lire
          sessionStorage.setItem('token', token); 
          
          console.log('Appel à /enseignant/me avec token:', token.substring(0, 15) + '...');
          const meRes = await api.get('/enseignant/me');
          
          console.log('Me Response success:', meRes.data);
          if (meRes.data && meRes.data.id) {
            userData.id = meRes.data.id;
            // On peut aussi stocker l'ID séparément si besoin
            sessionStorage.setItem('enseignantId', meRes.data.id);
            console.log('ID récupéré et stocké:', userData.id);
          }
        } catch (err) {
          console.error('Erreur lors de l\'appel à /enseignant/me:', {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url
          });
        }
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful, user photo:', userData.photo);
      
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Email ou mot de passe incorrect'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!sessionStorage.getItem('token'),
    isAdmin: user?.role === 'ADMIN',
    isEnseignant: user?.role === 'ENSEIGNANT',
    isEtudiant: user?.role === 'ETUDIANT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};