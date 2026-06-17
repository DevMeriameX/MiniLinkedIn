import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setToken('');
    try {
      const res = await authService.forgotPassword(email);
      setToken(res.data?.token || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#faf9f6', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Mot de passe oublie</h1>
        <p style={{ color: '#414752', marginBottom: 16 }}>Entrez votre email pour generer un token de reinitialisation.</p>

        {error && <div style={{ background: '#ffdad6', color: '#ba1a1a', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        {token && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: 10, borderRadius: 8, marginBottom: 12 }}>
            Token genere: <b>{token}</b>
            <div style={{ marginTop: 8 }}>
              <Link to={`/reset-password?token=${encodeURIComponent(token)}`}>Aller a la page de reinitialisation</Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e9e8e5', marginBottom: 12 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#0a66c2', color: '#fff', fontWeight: 700 }}
          >
            {loading ? 'Generation...' : 'Generer un token'}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <Link to="/login">Retour connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
