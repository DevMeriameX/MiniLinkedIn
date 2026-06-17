import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connexionService } from '../services/api';

// ── COMPOSANT DROPDOWN (KEBAB MENU) ──────────────────────────────────────────
const KebabMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.4rem 0.6rem',
          borderRadius: '50%',
          fontSize: '1.3rem',
          color: '#555',
          lineHeight: 1,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        title="Options"
      >
        ⋮
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            background: 'white',
            borderRadius: '0.6rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            minWidth: '180px',
            zIndex: 100,
            overflow: 'hidden',
            border: '1px solid #ececec',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.65rem 1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: item.danger ? '#ba1a1a' : '#1b1c1a',
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = item.danger ? '#fff5f5' : '#f4f6f8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
const EtudiantReseau = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connexions');
  const [connexions, setConnexions] = useState([]);
  const [demandesRecues, setDemandesRecues] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterUniversite, setFilterUniversite] = useState('');
  const [filterCompetence, setFilterCompetence] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const currentUserId = JSON.parse(sessionStorage.getItem('user') || '{}')?.id;

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'connexions') {
        const res = await connexionService.getConnexionsAcceptees();
        setConnexions(res.data || []);
      } else if (activeTab === 'recues') {
        const res = await connexionService.getDemandesRecues();
        setDemandesRecues(res.data || []);
      } else if (activeTab === 'rechercher') {
        const sug = await connexionService.getSuggestions(8);
        setSuggestions((sug.data || []).filter(u => u.role !== 'ADMIN'));
      }
    } catch (err) {
      setError('Erreur de chargement réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'rechercher') return;
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResultats([]);
        return;
      }
      try {
        const res = await connexionService.rechercherUtilisateurs(searchQuery, {
          role: filterRole || undefined,
          filiere: filterFiliere || undefined,
          niveauEtudes: filterNiveau || undefined,
          universite: filterUniversite || undefined,
          competence: filterCompetence || undefined,
        });
        setResultats((Array.isArray(res.data) ? res.data : []).filter(u => u.role !== 'ADMIN'));
      } catch (err) {
        setError('Erreur lors de la recherche');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterRole, filterFiliere, filterNiveau, filterUniversite, filterCompetence, activeTab]);

  const envoyerDemande = async (destinataireId) => {
    try {
      await connexionService.envoyerDemande(destinataireId);
      setSuccess('Demande envoyée');
      setSuggestions(prev => prev.filter(u => u.id !== destinataireId));
      setResultats(prev => prev.filter(u => u.id !== destinataireId));
    } catch (err) {
      setError(err.response?.data || 'Erreur envoi');
    } finally {
      setTimeout(() => { setSuccess(''); setError(''); }, 2500);
    }
  };

  const accepterDemande = async (id) => {
    try {
      await connexionService.accepterDemande(id);
      setSuccess('Demande acceptée');
      fetchData();
    } catch {
      setError('Erreur acceptation');
    } finally {
      setTimeout(() => { setSuccess(''); setError(''); }, 2500);
    }
  };

  const refuserDemande = async (id) => {
    try {
      await connexionService.refuserDemande(id);
      setSuccess('Demande refusée');
      fetchData();
    } catch {
      setError('Erreur refus');
    } finally {
      setTimeout(() => { setSuccess(''); setError(''); }, 2500);
    }
  };

  const supprimerConnexion = async (id) => {
    if (!window.confirm('Supprimer cette connexion ?')) return;
    try {
      await connexionService.supprimerConnexion(id);
      setSuccess('Connexion supprimée');
      fetchData();
    } catch {
      setError('Erreur suppression');
    } finally {
      setTimeout(() => { setSuccess(''); setError(''); }, 2500);
    }
  };

  const ouvrirMessagerie = (userId) => navigate(`/etudiant/messages?userId=${userId}`);

  // NAVIGATION VERS LE PROFIL (C'est ici qu'elle doit vivre !)
  // Si cliquer n'affiche toujours rien, modifie les chaînes de texte ci-dessous 
  // pour qu'elles correspondent EXACTEMENT à tes routes dans App.jsx
  const voirProfil = (user) => {
    if (user.role === 'ENSEIGNANT') {
      navigate(`/etudiant/voir-enseignant/${user.id}`);
    } else {
      navigate(`/etudiant/voir-etudiant/${user.id}`);
    }
  };

  const card = (u, menuItems) => (
    <div key={u.id} style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{u.nomComplet}</div>
        <div style={{ fontSize: '0.85rem', color: '#414752' }}>{u.email} • {u.role}</div>
        {(u.filiere || u.niveauEtudes) && (
          <div style={{ fontSize: '0.75rem', color: '#666' }}>{u.filiere || '—'} • {u.niveauEtudes || '—'}</div>
        )}
      </div>
      <div>
        <KebabMenu items={menuItems} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Réseau étudiant</h1>
      <p style={{ color: '#414752', marginBottom: '1rem' }}>Gérez vos connexions avec étudiants et enseignants.</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['connexions', 'recues', 'rechercher'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              border: '1px solid #d9d9d9',
              background: activeTab === tab ? '#0a66c2' : '#fff',
              color: activeTab === tab ? '#fff' : '#1b1c1a',
              cursor: 'pointer',
            }}
          >
            {tab === 'connexions' ? 'Mes connexions' : tab === 'recues' ? 'Demandes reçues' : 'Rechercher'}
          </button>
        ))}
      </div>

      {error && <div style={{ background: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{success}</div>}

      {activeTab === 'rechercher' && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nom ou email" style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }} />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }}>
              <option value="">Tous rôles</option>
              <option value="ETUDIANT">Étudiant</option>
              <option value="ENSEIGNANT">Enseignant</option>
            </select>
            <input value={filterFiliere} onChange={(e) => setFilterFiliere(e.target.value)} placeholder="Filière" style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }} />
            <input value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)} placeholder="Niveau" style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }} />
            <input value={filterUniversite} onChange={(e) => setFilterUniversite(e.target.value)} placeholder="Université" style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }} />
            <input value={filterCompetence} onChange={(e) => setFilterCompetence(e.target.value)} placeholder="Compétence" style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e9e8e5' }} />
          </div>
        </div>
      )}

      {loading && <div>Chargement...</div>}

      {/* ── TAB: MES CONNEXIONS ── */}
      {!loading && activeTab === 'connexions' && (
        <>
          {connexions.length === 0 && <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>Aucune connexion.</div>}
          {connexions.map((c) => {
            const other = c.demandeur?.id === currentUserId ? c.destinataire : c.demandeur;
            if (!other) return null;

            const menuItems = [
              { icon: '👤', label: 'Voir profil', action: () => voirProfil(other) },
              { icon: '💬', label: 'Message', action: () => ouvrirMessagerie(other.id) },
              { icon: '🗑️', label: 'Supprimer', danger: true, action: () => supprimerConnexion(c.id) }
            ];

            return card(other, menuItems);
          })}
        </>
      )}

      {/* ── TAB: DEMANDES REÇUES ── */}
      {!loading && activeTab === 'recues' && (
        <>
          {demandesRecues.length === 0 && <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>Aucune demande reçue.</div>}
          {demandesRecues.map((c) => {
            const menuItems = [
              { icon: '👤', label: 'Voir profil', action: () => voirProfil(c.demandeur) },
              { icon: '✅', label: 'Accepter', action: () => accepterDemande(c.id) },
              { icon: '❌', label: 'Refuser', danger: true, action: () => refuserDemande(c.id) }
            ];
            return card(c.demandeur, menuItems);
          })}
        </>
      )}

      {/* ── TAB: RECHERCHER ── */}
      {!loading && activeTab === 'rechercher' && (
        <>
          {suggestions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Suggestions</h3>
              {suggestions.map((s) => {
                const menuItems = [
                  { icon: '👤', label: 'Voir profil', action: () => voirProfil(s) },
                  { icon: '➕', label: 'Se connecter', action: () => envoyerDemande(s.id) },
                  { icon: '💬', label: 'Message', action: () => ouvrirMessagerie(s.id) }
                ];
                return card(s, menuItems);
              })}
            </div>
          )}
          {resultats.length === 0 && searchQuery && <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>Aucun résultat.</div>}
          {resultats.map((u) => {
            const menuItems = [
              { icon: '👤', label: 'Voir profil', action: () => voirProfil(u) },
              { icon: '➕', label: 'Demande de connexion', action: () => envoyerDemande(u.id) },
              { icon: '💬', label: 'Message', action: () => ouvrirMessagerie(u.id) }
            ];
            return card(u, menuItems);
          })}
        </>
      )}
    </div>
  );
};

export default EtudiantReseau;