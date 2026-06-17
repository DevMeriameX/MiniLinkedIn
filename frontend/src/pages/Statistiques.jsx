// src/pages/Statistiques.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { statsService } from '../services/api';

const Statistiques = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsService.getGlobal();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/admin');
  };

  // Styles inspirés du template HTML (Tailwind converti en objet)
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#faf9f6' },
    topNav: {
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      backgroundColor: '#faf9f6', backdropFilter: 'blur(20px)', opacity: 0.9,
      borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0px 4px 20px rgba(27,28,26,0.06)',
      height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 1.5rem',
    },
    logo: { fontSize: '1.25rem', fontWeight: 800, color: '#004e99', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.025em' },
    searchWrapper: {
      display: 'flex', alignItems: 'center', backgroundColor: '#e9e8e5', borderRadius: '9999px',
      padding: '0.5rem 1rem', gap: '0.5rem', width: '320px',
    },
    searchIcon: { color: '#414752', fontSize: '1rem' },
    searchInput: {
      background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem',
      width: '100%', color: '#1b1c1a',
    },
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
    sideHeader: { padding: '0 1.5rem', marginBottom: '2rem' },
    sideTitle: { fontSize: '1.125rem', fontWeight: 800, color: '#004e99' },
    sideSubtitle: { fontSize: '0.75rem', color: '#414752', opacity: 0.7 },
    navItem: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem',
      color: isActive ? '#004e99' : '#414752', backgroundColor: isActive ? '#ffffff' : 'transparent',
      borderRadius: '0 9999px 9999px 0', fontSize: '0.875rem', fontWeight: 500,
      textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer',
    }),
    addButton: { marginTop: 'auto', padding: '0 1rem', marginBottom: '2rem' },
    addBtn: {
      width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #004e99 0%, #0a66c2 100%)',
      color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer',
    },
    mainContent: { marginLeft: '256px', marginTop: '64px', padding: '2rem', minHeight: 'calc(100vh - 64px)' },
    headerSection: {
      display: 'flex', flexDirection: 'column', gap: '1rem',
      marginBottom: '2rem',
    },
    headerTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.5rem' },
    headerSubtitle: { color: '#414752', fontSize: '1rem', maxWidth: '672px' },
    periodSelector: {
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      backgroundColor: '#f4f3f0', padding: '0.25rem', borderRadius: '0.75rem',
      alignSelf: 'flex-start',
    },
    periodBtnActive: {
      padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.875rem', fontWeight: 'bold',
      color: '#004e99', border: 'none', cursor: 'pointer',
    },
    periodBtnInactive: {
      padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'transparent',
      fontSize: '0.875rem', fontWeight: 500, color: '#414752', border: 'none', cursor: 'pointer',
    },
    kpiGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem',
    },
    kpiCard: (borderColor) => ({
      backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem',
      boxShadow: '0px 4px 20px rgba(27,28,26,0.06)', borderLeft: `4px solid ${borderColor}`,
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }),
    kpiValue: { fontSize: '1.875rem', fontWeight: 800, color: '#1b1c1a' },
    kpiLabel: { fontSize: '0.75rem', color: '#414752', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' },
    analyticsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' },
    chartCard: { backgroundColor: '#f4f3f0', padding: '1.5rem', borderRadius: '1rem' },
    chartTitle: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' },
    chartLegend: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' },
    legendDot: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, marginRight: '0.25rem' }),
    chartContainer: { height: '256px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', position: 'relative' },
    barWrapper: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.25rem' },
    barPrimary: (height) => ({ width: '100%', backgroundColor: '#004e99', borderRadius: '0.5rem 0.5rem 0 0', height: `${height}%` }),
    barSecondary: (height) => ({ width: '100%', backgroundColor: '#bfd5ff', borderRadius: '0.5rem 0.5rem 0 0', height: `${height * 0.6}%` }),
    dayLabel: { fontSize: '10px', textAlign: 'center', color: '#414752', fontWeight: 'bold', marginTop: '0.5rem' },
    distributionCard: { backgroundColor: '#e3e2df', padding: '1.5rem', borderRadius: '1rem' },
    pieContainer: { position: 'relative', width: '192px', height: '192px', margin: '0 auto 1.5rem' },
    pieOuter: { position: 'absolute', inset: 0, borderRadius: '50%', border: '16px solid #bfd5ff' },
    pieInner: (percent) => {
      const angle = 360 * percent / 100;
      // style simplifié pour le camembert – ici on utilise un simple dégradé ou un clipping, mais pour rester simple on affiche un cercle avec un pourcentage
      return {
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `conic-gradient(#833900 0% ${percent}%, #bfd5ff ${percent}% 100%)`,
      };
    },
    pieCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderRadius: '50%' },
    piePercentage: { fontSize: '1.5rem', fontWeight: 800, color: '#1b1c1a' },
    pieLabel: { fontSize: '10px', fontWeight: 'bold', color: '#414752', textTransform: 'uppercase' },
    distributionList: { marginTop: '1rem' },
    distItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
    distLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    distColor: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }),
    mentorBox: { marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' },
  };

  const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', active: false, path: '/dashboard' },
    { name: 'Gestion des comptes', icon: 'group', active: false, path: '/comptes' },
    { name: 'Modération', icon: 'gavel', active: false, path: '/moderation' },
    { name: 'Signalements', icon: 'report', active: false, path: '/signalements' },
    { name: 'Vérification des attestations', icon: 'verified', active: false, path: '/attestations' },
    { name: 'Publications', icon: 'article', path: '/publications', active: true },
    { name: 'Statistiques', icon: 'leaderboard', active: true, path: '/statistiques' },
    { name: 'Paramètres', icon: 'settings', active: false, path: '/parametres' },
  ];

  // Données pour le graphique (fictives, mais peuvent être rendues dynamiques plus tard)
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const barHeights = [40, 55, 75, 90, 80, 45, 35];

  // Calcul du pourcentage d'étudiants
  const totalUsers = stats?.totalUtilisateurs || 1;
  const etudiantsCount = stats?.totalEtudiants || 0;
  const etudiantsPercent = Math.round((etudiantsCount / totalUsers) * 100);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) return <div style={styles.errorMsg}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* TopNavBar */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>Mini LinkedIn Admin</div>
        <div style={styles.searchWrapper}>
          <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
          <input type="text" style={styles.searchInput} placeholder="Rechercher des stats..." />
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
          <div style={styles.sideTitle}>Admin Panel</div>
          <div style={styles.sideSubtitle}>Gestion Atelier</div>
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
          <button style={styles.addBtn}><span className="material-symbols-outlined">add</span>Nouveau Rapport</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.headerTitle}>Analytique de la Plateforme</h1>
            <p style={styles.headerSubtitle}>
              Vue d'ensemble des performances de l'Atelier. Suivez l'engagement, la croissance des utilisateurs et les interactions en temps réel.
            </p>
          </div>
          <div style={styles.periodSelector}>
            <button style={styles.periodBtnActive}>7 derniers jours</button>
            <button style={styles.periodBtnInactive}>Mensuel</button>
          </div>
        </div>

        {/* KPI Grid */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard('#004e99')}>
            <div style={styles.kpiValue}>{stats?.utilisateursActifs?.toLocaleString() || 0}</div>
            <div style={styles.kpiLabel}>Utilisateurs Actifs</div>
          </div>
          <div style={styles.kpiCard('#495f83')}>
            <div style={styles.kpiValue}>{stats?.totalPublications?.toLocaleString() || 0}</div>
            <div style={styles.kpiLabel}>Nouveaux Posts</div>
          </div>
          <div style={styles.kpiCard('#833900')}>
            <div style={styles.kpiValue}>{stats?.totalUtilisateurs?.toLocaleString() || 0}</div>
            <div style={styles.kpiLabel}>Connexions</div>
          </div>
          <div style={{ ...styles.kpiCard('#0a66c2'), background: 'linear-gradient(135deg, #004e99, #0a66c2)', color: 'white' }}>
            <div style={styles.kpiValue}>{stats?.signalementsEnAttente || 0}</div>
            <div style={styles.kpiLabel}>Signalements en attente</div>
          </div>
        </div>

        {/* Chart + Distribution */}
        <div style={styles.analyticsGrid}>
          <div style={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={styles.chartTitle}>Courbe d'Engagement Hebdomadaire</h2>
              <div style={styles.chartLegend}>
                <span style={{ display: 'flex', alignItems: 'center' }}><span style={styles.legendDot('#004e99')}></span><span style={{ fontSize: '0.75rem' }}>Semaine courante</span></span>
                <span style={{ display: 'flex', alignItems: 'center' }}><span style={styles.legendDot('#bfd5ff')}></span><span style={{ fontSize: '0.75rem' }}>Précédente</span></span>
              </div>
            </div>
            <div style={styles.chartContainer}>
              {days.map((day, i) => (
                <div key={day} style={styles.barWrapper}>
                  <div style={styles.barSecondary(barHeights[i])}></div>
                  <div style={styles.barPrimary(barHeights[i])}></div>
                  <div style={styles.dayLabel}>{day}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.distributionCard}>
            <h2 style={styles.chartTitle}>Profils Utilisateurs</h2>
            <div style={styles.pieContainer}>
              <div style={styles.pieOuter}></div>
              <div style={styles.pieInner(etudiantsPercent)}></div>
              <div style={styles.pieCenter}>
                <span style={styles.piePercentage}>{etudiantsPercent}%</span>
                <span style={styles.pieLabel}>Étudiants</span>
              </div>
            </div>
            <div style={styles.distributionList}>
              <div style={styles.distItem}>
                <div style={styles.distLabel}><div style={styles.distColor('#bfd5ff')}></div><span>Étudiants</span></div>
                <span style={{ fontWeight: 'bold' }}>{stats?.totalEtudiants || 0}</span>
              </div>
              <div style={styles.distItem}>
                <div style={styles.distLabel}><div style={styles.distColor('#833900')}></div><span>Enseignants</span></div>
                <span style={{ fontWeight: 'bold' }}>{stats?.totalEnseignants || 0}</span>
              </div>
            </div>
            <div style={styles.mentorBox}>
              <img
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANQ_GGbklcogqRUt2D3rzhVenUS3T5XDtqNAxW7A2u8f9pRp0sAPxbCayHVshzoP85TqG6gBLVaVJ5Krc3KJJ3K1yip6S9j37smd0qEPMjt_EDjWPP4Pv2NEEkZpkJSgskcRTpjEoXiYypNP23Gc_MZ3oB9wZgQRtKeoW_I2SVhRP5zxlKVk7BdKBzFB4rErVOqTyYfArRR0v6kTBsNJt_fnWq8KAFZ1KOUDdnalxymzk451xKeetUB1I0pyHm_-fwmxJ8qgoVEns"
                alt="mentor"
              />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#004e99' }}>Dernière vérification</div>
                <div style={{ fontSize: '0.875rem' }}>Dr. Sophie Martin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section supplémentaire similaire au HTML : performance par contenu (facultatif) */}
        <div style={{ ...styles.chartCard, marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={styles.chartTitle}>Performance par Type de Contenu</h2>
            <button style={{ color: '#004e99', fontWeight: 'bold' }}>Voir le détail</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div><div style={{ height: '80px', backgroundColor: '#004e99', width: '100%', borderRadius: '0.5rem' }}></div><div>Articles de Recherche</div><div>Avg: 450 likes</div></div>
            <div><div style={{ height: '40px', backgroundColor: '#495f83', width: '100%', borderRadius: '0.5rem' }}></div><div>Offres d'Emploi</div><div>Avg: 210 applies</div></div>
            <div><div style={{ height: '60px', backgroundColor: '#833900', width: '100%', borderRadius: '0.5rem' }}></div><div>Photos & Médias</div><div>Avg: 320 clicks</div></div>
            <div><div style={{ height: '100px', backgroundColor: '#0a66c2', width: '100%', borderRadius: '0.5rem' }}></div><div>Vidéos de Mentorat</div><div>Avg: 680 views</div></div>
          </div>
        </div>

        {/* Répartition géographique (optionnel) */}
        <div style={{ ...styles.chartCard, marginTop: '2rem', position: 'relative', overflow: 'hidden' }}>
          <h2 style={styles.chartTitle}>Répartition Géographique</h2>
          <p style={{ fontSize: '0.875rem', color: '#414752', marginBottom: '1rem' }}>Top 5 des villes les plus actives</p>
          <div style={{ maxWidth: '300px' }}>
            <div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Paris</span><span>42%</span></div><div style={{ height: '4px', backgroundColor: '#e9e8e5', borderRadius: '9999px', marginTop: '0.25rem' }}><div style={{ width: '42%', height: '100%', backgroundColor: '#004e99', borderRadius: '9999px' }}></div></div></div>
            <div className="mt-2"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lyon</span><span>18%</span></div><div style={{ height: '4px', backgroundColor: '#e9e8e5', borderRadius: '9999px', marginTop: '0.25rem' }}><div style={{ width: '18%', height: '100%', backgroundColor: '#004e99', borderRadius: '9999px' }}></div></div></div>
            <div className="mt-2"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bordeaux</span><span>12%</span></div><div style={{ height: '4px', backgroundColor: '#e9e8e5', borderRadius: '9999px', marginTop: '0.25rem' }}><div style={{ width: '12%', height: '100%', backgroundColor: '#004e99', borderRadius: '9999px' }}></div></div></div>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', opacity: 0.2, pointerEvents: 'none' }}>
            <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb1FQqlvp91YR2vdkhELM8WDVk_cY9KnQ_xztoqYybnMg_Do2QwmQ5lV2MxJXGCaa8WOOGOuVuIWpg-IwXC-SIR8WiwCAN0BjyqohsWzhkcBSFe03IFy2nMysdBFZ3hlDfpLMkxetdxqAVZImBtaEiI07NZgbsjyauG2uqA3WQbq7ldKgKquWJFf0xg1COzQr67dK2UoA7A8M2hXn8_Ku2KnXhWtKYlWupTVZpxSTBbTPL6ZMfelUd9bbt3ppSI4oQqWuPVC9Wc5Y" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistiques;