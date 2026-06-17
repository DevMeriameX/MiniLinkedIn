import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMismatch = useMemo(
    () => confirm.length > 0 && confirm !== nouveauMotDePasse,
    [confirm, nouveauMotDePasse]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isMismatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, nouveauMotDePasse);
      setSuccess(res.data?.message || 'Mot de passe reinitialise.');
      setNouveauMotDePasse('');
      setConfirm('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de reinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#faf9f6', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Reinitialiser le mot de passe</h1>
        <p style={{ color: '#414752', marginBottom: 16 }}>Saisissez le token recu et votre nouveau mot de passe.</p>

        {error && <div style={{ background: '#ffdad6', color: '#ba1a1a', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: 10, borderRadius: 8, marginBottom: 12 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e9e8e5', marginBottom: 12 }}
          />
          <input
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            placeholder="Nouveau mot de passe"
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e9e8e5', marginBottom: 12 }}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            required
            style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${isMismatch ? '#ba1a1a' : '#e9e8e5'}`, marginBottom: 12 }}
          />
          <button
            type="submit"
            disabled={loading || isMismatch}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#0a66c2', color: '#fff', fontWeight: 700 }}
          >
            {loading ? 'Reinitialisation...' : 'Valider'}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <Link to="/login">Retour connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
