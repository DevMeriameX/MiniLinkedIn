import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connexionService, enseignantEtudiantService } from '../services/api';
import { BASE_URL } from '../config';

// ── Kebab menu component ─────────────────────────────────────────────────────
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
            minWidth: '160px',
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

// ── Avatar helper ────────────────────────────────────────────────────────────
const UserAvatar = ({ user, size = 50 }) => {
  const initial = user?.nomComplet?.charAt(0)?.toUpperCase() || '?';
  if (user?.photo) {
    return (
      <img
        src={`${BASE_URL}${user.photo}`}
        alt={user.nomComplet}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          marginRight: '1rem',
          border: '2px solid #e9e8e5',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      backgroundColor: '#e8f0fb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, color: '#0a66c2', fontWeight: 'bold',
      marginRight: '1rem', flexShrink: 0,
    }}>
      {initial}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const EnseignantReseau = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connexions');
  const [connexions, setConnexions] = useState([]);
  const [demandesRecues, setDemandesRecues] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'connexions') {
        const res = await connexionService.getConnexionsAcceptees();
        setConnexions(res.data);
      } else if (activeTab === 'recues') {
        const res = await connexionService.getDemandesRecues();
        setDemandesRecues(res.data);
      } else if (activeTab === 'rechercher') {
        const sug = await connexionService.getSuggestions(8);
        setSuggestions((sug.data || []).filter(u => u.role !== 'ADMIN'));
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) { setResultats([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await connexionService.rechercherUtilisateurs(query, {
        role: filterRole || undefined,
        filiere: filterFiliere || undefined,
        niveauEtudes: filterNiveau || undefined,
      });
      const rawData = res.data;
      const resultsArray = Array.isArray(rawData) ? rawData : (rawData?.content || []);
      const currentUserId = user?.id || JSON.parse(sessionStorage.getItem('user'))?.id;
      setResultats(resultsArray.filter((u) => String(u.id) !== String(currentUserId) && u.role !== 'ADMIN'));
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'rechercher') return;
    const t = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, activeTab, filterRole, filterFiliere, filterNiveau]);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const envoyerDemande = async (id) => {
    try { await connexionService.envoyerDemande(id); notify('Demande envoyée'); }
    catch (err) { notify(err.response?.data || 'Erreur', true); }
  };

  const accepterDemande = async (id) => {
    try { await connexionService.accepterDemande(id); notify('Demande acceptée'); fetchData(); }
    catch { notify('Erreur lors de l\'acceptation', true); }
  };

  const refuserDemande = async (id) => {
    try { await connexionService.refuserDemande(id); notify('Demande refusée'); fetchData(); }
    catch { notify('Erreur lors du refus', true); }
  };

  const ouvrirMessagerie = (userId) => navigate(`/enseignant/messages?userId=${userId}`);

  const supprimerConnexion = async (id) => {
    if (!window.confirm('Supprimer cette connexion ?')) return;
    try { await connexionService.supprimerConnexion(id); notify('Connexion supprimée'); fetchData(); }
    catch { notify('Erreur lors de la suppression', true); }
  };

  const voirProfilEtudiant = (id) => navigate(`/enseignant/etudiants/${id}`);
  const voirProfilEnseignant = (id) => navigate(`/enseignant/enseignants/${id}`);

  const recommanderEtudiant = async (id) => {
    try {
      const res = await enseignantEtudiantService.recommanderEtudiant(id);
      notify(res.data?.message || 'Étudiant recommandé');
    } catch (err) { notify(err.response?.data?.error || 'Erreur recommandation', true); }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    container: { padding: '1.5rem' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.4rem' },
    subtitle: { color: '#666', fontSize: '0.95rem' },
    tabs: { display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e9e8e5', marginBottom: '2rem' },
    tab: (active) => ({
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      borderBottom: active ? '3px solid #0a66c2' : '3px solid transparent',
      marginBottom: '-2px',
      color: active ? '#0a66c2' : '#555',
      fontWeight: active ? 700 : 500,
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      borderRadius: '4px 4px 0 0',
    }),
    card: {
      backgroundColor: 'white',
      borderRadius: '0.85rem',
      padding: '1rem 1.25rem',
      boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      border: '1px solid #f0f0f0',
    },
    userInfo: { flex: 1 },
    userName: { fontWeight: 700, fontSize: '1rem', color: '#1b1c1a' },
    userMeta: { fontSize: '0.82rem', color: '#666', marginTop: '0.1rem' },
    roleBadge: (role) => ({
      display: 'inline-block',
      padding: '0.15rem 0.6rem',
      borderRadius: '99px',
      fontSize: '0.72rem',
      fontWeight: 700,
      marginLeft: '0.4rem',
      background: role === 'ETUDIANT' ? '#e8f0fb' : '#e8faf0',
      color: role === 'ETUDIANT' ? '#0a66c2' : '#166534',
    }),
    btnPrimary: {
      backgroundColor: '#0a66c2', color: 'white', border: 'none',
      borderRadius: '2rem', padding: '0.45rem 1.1rem', fontWeight: 700,
      cursor: 'pointer', fontSize: '0.88rem',
    },
    btnSecondary: {
      backgroundColor: 'transparent', color: '#0a66c2', border: '1px solid #0a66c2',
      borderRadius: '2rem', padding: '0.45rem 1.1rem', fontWeight: 700,
      cursor: 'pointer', fontSize: '0.88rem', marginRight: '0.5rem',
    },
    btnDanger: {
      backgroundColor: 'transparent', color: '#ba1a1a', border: '1px solid #ba1a1a',
      borderRadius: '2rem', padding: '0.45rem 1.1rem', fontWeight: 700,
      cursor: 'pointer', fontSize: '0.88rem',
    },
    searchBar: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
    searchInput: {
      flex: 1, padding: '0.7rem 1rem', borderRadius: '0.5rem',
      border: '1px solid #e0e0e0', fontSize: '0.95rem', minWidth: '160px',
      outline: 'none',
    },
    emptyState: {
      textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: 'white',
      borderRadius: '0.85rem', border: '2px dashed #e9e8e5', color: '#888',
    },
    alert: (type) => ({
      padding: '0.9rem 1.2rem', borderRadius: '0.5rem', marginBottom: '1.25rem',
      fontSize: '0.9rem', fontWeight: 600,
      backgroundColor: type === 'error' ? '#ffdad6' : '#dcfce7',
      color: type === 'error' ? '#ba1a1a' : '#166534',
    }),
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Mon Réseau</h1>
        <p style={s.subtitle}>Développez votre réseau professionnel et connectez-vous avec d'autres enseignants et étudiants.</p>
      </div>

      <div style={s.tabs}>
        {[['connexions', 'Mes connexions'], ['recues', 'Demandes reçues'], ['rechercher', 'Rechercher']].map(([key, label]) => (
          <div key={key} style={s.tab(activeTab === key)} onClick={() => setActiveTab(key)}>{label}</div>
        ))}
      </div>

      {error && <div style={s.alert('error')}>{error}</div>}
      {success && <div style={s.alert('success')}>{success}</div>}

      {/* ── TAB: MES CONNEXIONS ── */}
      {activeTab === 'connexions' && (
        <div>
          {connexions.length > 0 ? connexions.map((c) => {
            const other = c.demandeur.id === user?.id ? c.destinataire : c.demandeur;
            const menuItems = [
              { icon: '', label: 'Envoyer un message', action: () => ouvrirMessagerie(other.id) },
              ...(other.role === 'ETUDIANT' ? [
                { icon: '', label: 'Voir le profil', action: () => voirProfilEtudiant(other.id) },
                { icon: '', label: 'Recommander', action: () => recommanderEtudiant(other.id) },
              ] : [
                { icon: '', label: 'Voir le profil', action: () => voirProfilEnseignant(other.id) },
              ]),
              { icon: '', label: 'Supprimer la connexion', danger: true, action: () => supprimerConnexion(c.id) },
            ];
            return (
              <div key={c.id} style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserAvatar user={other} />
                  <div style={s.userInfo}>
                    <div style={s.userName}>
                      {other.nomComplet}
                      <span style={s.roleBadge(other.role)}>{other.role === 'ETUDIANT' ? 'Étudiant' : 'Enseignant'}</span>
                    </div>
                    <div style={s.userMeta}>{other.email}</div>
                  </div>
                </div>
                <KebabMenu items={menuItems} />
              </div>
            );
          }) : (!loading && (
            <div style={s.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
              <p style={{ fontWeight: 600 }}>Vous n'avez pas encore de connexions.</p>
              <p style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>Recherchez des collègues et des étudiants pour développer votre réseau.</p>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: DEMANDES REÇUES ── */}
      {activeTab === 'recues' && (
        <div>
          {demandesRecues.length > 0 ? demandesRecues.map((c) => (
            <div key={c.id} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserAvatar user={c.demandeur} />
                <div style={s.userInfo}>
                  <div style={s.userName}>
                    {c.demandeur.nomComplet}
                    <span style={s.roleBadge(c.demandeur.role)}>{c.demandeur.role === 'ETUDIANT' ? 'Étudiant' : 'Enseignant'}</span>
                  </div>
                  <div style={s.userMeta}>{c.demandeur.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={s.btnPrimary} onClick={() => accepterDemande(c.id)}>Accepter</button>
                <button style={s.btnDanger} onClick={() => refuserDemande(c.id)}>Refuser</button>
              </div>
            </div>
          )) : (!loading && (
            <div style={s.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📬</div>
              <p style={{ fontWeight: 600 }}>Aucune demande en attente.</p>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: RECHERCHER ── */}
      {activeTab === 'rechercher' && (
        <>
          <form style={s.searchBar} onSubmit={(e) => e.preventDefault()}>
            <input style={s.searchInput} placeholder="Rechercher par nom ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select style={s.searchInput} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">Tous rôles</option>
              <option value="ETUDIANT">Étudiants</option>
              <option value="ENSEIGNANT">Enseignants</option>
            </select>
            <input style={s.searchInput} placeholder="Filière" value={filterFiliere} onChange={(e) => setFilterFiliere(e.target.value)} />
            <input style={s.searchInput} placeholder="Niveau" value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)} />
          </form>

          {suggestions.length > 0 && !searchQuery && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#1b1c1a', fontWeight: 700 }}>Suggestions</h3>
              {suggestions.map((s_) => (
                <div key={`s-${s_.id}`} style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserAvatar user={s_} />
                    <div style={s.userInfo}>
                      <div style={s.userName}>
                        {s_.nomComplet}
                        <span style={s.roleBadge(s_.role)}>{s_.role === 'ETUDIANT' ? 'Étudiant' : 'Enseignant'}</span>
                      </div>
                      <div style={s.userMeta}>{s_.email} {s_.filiere ? `• ${s_.filiere}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={s.btnPrimary} onClick={() => envoyerDemande(s_.id)}>Se connecter</button>
                    {s_.role === 'ETUDIANT' ? (
                      <button style={s.btnSecondary} onClick={() => voirProfilEtudiant(s_.id)}>Profil</button>
                    ) : (
                      <button style={s.btnSecondary} onClick={() => voirProfilEnseignant(s_.id)}>Profil</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultats.length > 0 ? (
            <div>
              {resultats.map((u) => (
                <div key={u.id} style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserAvatar user={u} />
                    <div style={s.userInfo}>
                      <div style={s.userName}>
                        {u.nomComplet}
                        <span style={s.roleBadge(u.role)}>{u.role === 'ETUDIANT' ? 'Étudiant' : 'Enseignant'}</span>
                      </div>
                      <div style={s.userMeta}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={s.btnPrimary} onClick={() => envoyerDemande(u.id)}>Se connecter</button>
                    <button style={s.btnSecondary} onClick={() => ouvrirMessagerie(u.id)}>Message</button>
                    {u.role === 'ETUDIANT' ? (
                      <button style={s.btnSecondary} onClick={() => voirProfilEtudiant(u.id)}>Profil</button>
                    ) : (
                      <button style={s.btnSecondary} onClick={() => voirProfilEnseignant(u.id)}>Profil</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            searchQuery && !loading && (
              <div style={s.emptyState}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                <p style={{ fontWeight: 600 }}>Aucun utilisateur trouvé pour "{searchQuery}"</p>
              </div>
            )
          )}
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
          Chargement...
        </div>
      )}
    </div>
  );
};

export default EnseignantReseau;
