// src/pages/Moderation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signalementService, publicationService } from '../services/api';

const Moderation = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchSignalements();
  }, []);

  const fetchSignalements = async () => {
    setLoading(true);
    try {
      const data = await signalementService.getAll();
      setSignalements(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les signalements');
    } finally {
      setLoading(false);
    }
  };

  const handleAvertir = async (signalement) => {
    setProcessingId(signalement.id);
    try {
      await signalementService.traiter({
        signalementId: signalement.id,
        action: 'IGNORER',
        commentaire: 'Avertissement envoyé à l\'utilisateur'
      });
      setSuccess('Avertissement envoyé');
      fetchSignalements();
    } catch (err) {
      setError('Erreur lors de l\'avertissement');
    } finally {
      setProcessingId(null);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleSupprimer = async (signalement) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    setProcessingId(signalement.id);
    try {
      await publicationService.supprimer(signalement.publication.id, 'Publication inappropriée');
      await signalementService.traiter({
        signalementId: signalement.id,
        action: 'SUPPRIMER_PUBLICATION',
        commentaire: 'Publication supprimée par modération'
      });
      setSuccess('Publication supprimée et signalement traité');
      fetchSignalements();
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setProcessingId(null);
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
    bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' },
    card: { backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0px 4px 20px rgba(27,28,26,0.06)' },
    flagBadge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: '#ffdbca', color: '#773300', marginBottom: '0.75rem',
    },
    publicationContent: {
      backgroundColor: '#f4f3f0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontStyle: 'italic',
    },
    actionButtons: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
    warnBtn: {
      flex: 1, padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white',
      border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer',
    },
    deleteBtn: {
      flex: 1, padding: '0.5rem', backgroundColor: '#ba1a1a', color: 'white',
      border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer',
    },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    successMsg: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
  };

  const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', active: false, path: '/dashboard' },
    { name: 'Gestion des comptes', icon: 'group', active: false, path: '/comptes' },
    { name: 'Modération', icon: 'gavel', active: true, path: '/moderation' },
    { name: 'Signalements', icon: 'report', active: false, path: '/signalements' },
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
          <input type="text" style={styles.searchInput} placeholder="Rechercher une publication..." />
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
          <button style={styles.addBtn}><span className="material-symbols-outlined">add_alert</span>Nouvelle Alerte</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Files de Modération</h1>
          <p style={styles.pageSubtitle}>Passez en revue les publications signalées par la communauté.</p>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {signalements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#414752' }}>Aucun signalement en attente.</div>
        ) : (
          <div style={styles.bentoGrid}>
            {signalements.map((sig) => (
              <div key={sig.id} style={styles.card}>
                <div style={styles.flagBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>flag</span> Signalé par {sig.signaleur?.nomComplet || 'un utilisateur'}
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold' }}>{sig.publication?.utilisateur?.nomComplet}</h3>
                  <p style={{ fontSize: '0.7rem', color: '#414752' }}>{new Date(sig.dateSignalement).toLocaleString()}</p>
                </div>
                <div style={styles.publicationContent}>
                  <p style={{ fontSize: '0.875rem' }}>{sig.publication?.contenu}</p>
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ba1a1a' }}>Raison : {sig.raison}</p>
                <div style={styles.actionButtons}>
                  <button style={styles.warnBtn} onClick={() => handleAvertir(sig)} disabled={processingId === sig.id}>
                    Avertir l'utilisateur
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleSupprimer(sig)} disabled={processingId === sig.id}>
                    Supprimer la publication
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Moderation;