// src/pages/Signalements.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signalementService } from '../services/api';

const Signalements = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchSignalements();
  }, []);

  const fetchSignalements = async () => {
    setLoading(true);
    try {
      const data = await signalementService.getAll();
      setSignalements(data);
    } catch (err) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleTraiter = async (id, action) => {
    if (!window.confirm(`Confirmer l'action : ${action === 'SUPPRIMER_PUBLICATION' ? 'Supprimer la publication' : 'Ignorer le signalement'} ?`)) return;
    setSelectedId(id);
    try {
      await signalementService.traiter({
        signalementId: id,
        action,
        commentaire: action === 'SUPPRIMER_PUBLICATION' ? 'Supprimé par admin' : 'Signalement ignoré'
      });
      setSuccess('Signalement traité');
      fetchSignalements();
    } catch (err) {
      setError('Erreur lors du traitement');
    } finally {
      setSelectedId(null);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/admin');
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#faf9f6' },
    topNav: {
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      backgroundColor: '#faf9f6', backdropFilter: 'blur(20px)', opacity: 0.9,
      borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0px 4px 20px rgba(27,28,26,0.06)',
      height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 1.5rem',
    },
    logo: { fontSize: '1.25rem', fontWeight: 800, color: '#004e99', fontFamily: 'Manrope, sans-serif' },
    searchContainer: {
      display: 'flex', alignItems: 'center', backgroundColor: '#e9e8e5', borderRadius: '0.5rem',
      padding: '0.375rem 0.75rem', width: '320px', gap: '0.5rem',
    },
    searchInput: { background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%' },
    navIcons: { display: 'flex', gap: '1rem', alignItems: 'center' },
    iconBtn: { padding: '0.5rem', color: '#414752', cursor: 'pointer', background: 'none', border: 'none', borderRadius: '50%' },
    avatar: {
      width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e9e8e5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a66c2',
    },
    sideNav: {
      position: 'fixed', left: 0, top: '64px', width: '256px', height: 'calc(100vh - 64px)',
      backgroundColor: '#faf9f6', display: 'flex', flexDirection: 'column', padding: '1rem 0',
    },
    sideHeader: { padding: '0 1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #efeeeb', marginBottom: '0.5rem' },
    sideTitle: { fontSize: '1.125rem', fontWeight: 'bold', color: '#004e99' },
    sideSubtitle: { fontSize: '0.75rem', color: '#414752' },
    navItem: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem',
      color: isActive ? '#004e99' : '#414752', backgroundColor: isActive ? '#0a66c210' : 'transparent',
      borderRight: isActive ? '4px solid #004e99' : 'none', fontWeight: isActive ? 'bold' : 'normal',
      fontSize: '0.875rem', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s',
    }),
    addButton: { marginTop: 'auto', padding: '0 1.5rem', paddingBottom: '2rem' },
    addBtn: {
      width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #004e99 0%, #0a66c2 100%)',
      color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer',
    },
    mainContent: { marginLeft: '256px', marginTop: '64px', padding: '2rem', maxWidth: '1280px' },
    pageHeader: { marginBottom: '2rem' },
    pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.5rem' },
    pageSubtitle: { color: '#414752', maxWidth: '672px' },
    tableContainer: { width: '100%', backgroundColor: '#ffffff', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0px 4px 20px rgba(27,28,26,0.06)' },
    th: { textAlign: 'left', padding: '1rem 1.5rem', backgroundColor: '#efeeeb', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#414752' },
    td: { padding: '1rem 1.5rem', borderBottom: '1px solid #efeeeb' },
    statusBadge: (statut) => ({
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 'bold',
      backgroundColor: statut === 'EN_ATTENTE' ? '#ffdbca' : '#dcfce7',
      color: statut === 'EN_ATTENTE' ? '#773300' : '#166534',
    }),
    actionBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginRight: '0.5rem' },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    successMsg: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
  };

  const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', active: false, path: '/dashboard' },
    { name: 'Gestion des comptes', icon: 'group', active: false, path: '/comptes' },
    { name: 'Modération', icon: 'gavel', active: false, path: '/moderation' },
    { name: 'Signalements', icon: 'report', active: true, path: '/signalements' },
    { name: 'Vérification des attestations', icon: 'verified', active: false, path: '/attestations' },
    { name: 'Publications', icon: 'article', path: '/publications', active: true },
    { name: 'Statistiques', icon: 'leaderboard', active: false, path: '/statistiques' },
    { name: 'Paramètres', icon: 'settings', active: false, path: '/parametres' },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* TopNavBar */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>Mini LinkedIn Admin</div>
        <div style={styles.searchContainer}>
          <span className="material-symbols-outlined" style={{ color: '#414752' }}>search</span>
          <input type="text" style={styles.searchInput} placeholder="Rechercher un signalement..." />
        </div>
        <div style={styles.navIcons}>
          <button style={styles.iconBtn}><span className="material-symbols-outlined">notifications</span></button>
          <button style={styles.iconBtn}><span className="material-symbols-outlined">account_circle</span></button>
          <button onClick={handleLogout} style={styles.iconBtn}><span className="material-symbols-outlined">logout</span></button>
          <div style={styles.avatar}><span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>account_circle</span></div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside style={styles.sideNav}>
        <div style={styles.sideHeader}>
          <div style={styles.sideTitle}>Mini LinkedIn</div>
          <div style={styles.sideSubtitle}>Espace Administrateur</div>
        </div>
        <nav>
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.path} style={styles.navItem(item.active)}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div style={styles.addButton}>
          <button style={styles.addBtn}><span className="material-symbols-outlined">add_alert</span>Nouveau Rapport</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Signalements</h1>
          <p style={styles.pageSubtitle}>Surveillez et gérez les rapports d'utilisateurs pour maintenir l'intégrité de l'Atelier.</p>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        <div style={styles.tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Publication</th>
                <th style={styles.th}>Signalé par</th>
                <th style={styles.th}>Raison</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {signalements.map((sig) => (
                <tr key={sig.id}>
                  <td style={styles.td}>{sig.id}</td>
                  <td style={styles.td}>
                    <div>{sig.publication?.contenu?.substring(0, 60)}...</div>
                    <div style={{ fontSize: '0.7rem', color: '#414752' }}>par {sig.publication?.utilisateur?.nomComplet}</div>
                  </td>
                  <td style={styles.td}>{sig.signaleur?.nomComplet}</td>
                  <td style={styles.td}>{sig.raison}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(sig.statut)}>{sig.statut}</span>
                  </td>
                  <td style={styles.td}>
                    {sig.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          style={{ ...styles.actionBtn, backgroundColor: '#10b981', color: 'white' }}
                          onClick={() => handleTraiter(sig.id, 'IGNORER')}
                          disabled={selectedId === sig.id}
                        >
                          Ignorer
                        </button>
                        <button
                          style={{ ...styles.actionBtn, backgroundColor: '#ba1a1a', color: 'white' }}
                          onClick={() => handleTraiter(sig.id, 'SUPPRIMER_PUBLICATION')}
                          disabled={selectedId === sig.id}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {signalements.length === 0 && <div style={{ textAlign: 'center', padding: '2rem' }}>Aucun signalement trouvé.</div>}
        </div>
      </main>
    </div>
  );
};

export default Signalements;