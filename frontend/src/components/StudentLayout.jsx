import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { BASE_URL } from '../config';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const {
    nonLusCount,
    socialNotifications,
    socialNonLusCount,
    totalNonLusCount,
    markSocialAsRead,
    markAllSocialAsRead,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = sessionStorage.getItem('studentSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    sessionStorage.setItem('studentSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { name: 'Fil d\'actualité', icon: 'rss_feed', path: '/etudiant/dashboard' },
    { name: 'Mes publications', icon: 'article', path: '/etudiant/publications' },
    { name: 'Mes diplômes', icon: 'school', path: '/etudiant/diplomes' },
    { name: 'Connexions', icon: 'group', path: '/etudiant/reseau' },
    { name: 'Messagerie', icon: 'mail', path: '/etudiant/messages' },
    { name: 'Mon profil', icon: 'person', path: '/etudiant/profil' },
    { name: 'Offres', icon: 'work', path: '/etudiant/offres' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#faf9f6', display: 'flex', flexDirection: 'column' },
    header: { 
      backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 110, 
      boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', padding: '0 1.5rem',
      height: '64px', display: 'flex', alignItems: 'center'
    },
    headerContent: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    leftHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
    toggleBtn: { 
      background: 'none', border: 'none', cursor: 'pointer', color: '#414752', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
      borderRadius: '50%', transition: 'background 0.2s'
    },
    logo: { fontSize: '1.4rem', fontWeight: 900, color: '#0a66c2', letterSpacing: '-0.025em', textDecoration: 'none' },
    navIcons: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#414752', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    iconText: { fontSize: '10px', fontWeight: 500 },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e9e8e5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    
    mainWrapper: { display: 'flex', flex: 1, position: 'relative' },
    
    sidebar: { 
      width: isSidebarOpen ? '260px' : '0px', 
      backgroundColor: 'white', 
      borderRight: isSidebarOpen ? '1px solid #efeeeb' : 'none',
      transition: 'width 0.3s ease, padding 0.3s ease',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      position: 'sticky', top: '64px',
      zIndex: 100
    },
    
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 120,
      display: isSidebarOpen ? 'block' : 'none'
    },
    
    profileCard: { padding: '1.5rem 1rem', textAlign: 'center', borderBottom: '1px solid #f4f3f0' },
    avatarLarge: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e9e8e5', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    welcomeText: { fontSize: '0.875rem', fontWeight: 'bold', color: '#1b1c1a' },
    
    navMenu: { padding: '1rem 0.5rem', flex: 1, overflowY: 'auto' },
    navItem: (path) => {
      const isActive = location.pathname === path;
      return {
        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
        cursor: 'pointer', transition: 'background 0.2s', textDecoration: 'none', marginBottom: '4px',
        backgroundColor: isActive ? '#0a66c210' : 'transparent',
        color: isActive ? '#0a66c2' : '#414752',
        fontWeight: isActive ? 'bold' : '500',
      };
    },
    
    content: { 
      flex: 1, padding: '2rem', minWidth: 0,
      transition: 'margin-left 0.3s ease'
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 767px) {
          .desktop-sidebar { position: fixed !important; left: 0; top: 0; height: 100vh !important; z-index: 130 !important; width: 260px !important; transform: translateX(${isSidebarOpen ? '0' : '-100%'}); transition: transform 0.3s ease !important; }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; }
        }
        @media (min-width: 768px) {
          .mobile-sidebar-overlay { display: none !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.leftHeader}>
            <button style={styles.toggleBtn} onClick={toggleSidebar}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/etudiant/dashboard" style={styles.logo}>Mini LinkedIn</Link>
          </div>

          <div style={styles.navIcons}>
            <Link to="/etudiant/reseau" style={{ textDecoration: 'none' }}>
              <div style={styles.iconBtn} className="desktop-only">
                <span className="material-symbols-outlined">group</span>
                <span style={styles.iconText}>Réseau</span>
              </div>
            </Link>
            <Link to="/etudiant/offres" style={{ textDecoration: 'none' }}>
              <div style={styles.iconBtn} className="desktop-only">
                 <span className="material-symbols-outlined">work</span>
                  <span style={styles.iconText}>Offres</span>
              </div>
            </Link>
            <Link to="/etudiant/messages" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.iconBtn, position: 'relative' }}>
                <span className="material-symbols-outlined">mail</span>
                <span style={styles.iconText}>Messages</span>
                {nonLusCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-5px', right: '5px',
                    backgroundColor: '#ba1a1a', color: 'white', fontSize: '9px', 
                    borderRadius: '50%', width: '15px', height: '15px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    {nonLusCount}
                  </span>
                )}
              </div>
            </Link>
            <div style={styles.iconBtn} onClick={() => setShowNotificationPanel((v) => !v)}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">notifications</span>
                {totalNonLusCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-6px', right: '-6px',
                    backgroundColor: '#ba1a1a', color: 'white', fontSize: '9px',
                    borderRadius: '50%', width: '15px', height: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    {Math.min(totalNonLusCount, 9)}
                  </span>
                )}
              </div>
              <span style={styles.iconText}>Notifications</span>
            </div>
            <div style={styles.iconBtn} onClick={() => navigate('/etudiant/profil')}>
              <div style={styles.avatar}>
                {user?.photo ? (
                  <img src={`${BASE_URL}${user.photo}`} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="material-symbols-outlined">account_circle</span>
                )}
              </div>
              <span style={styles.iconText}>Moi ▼</span>
            </div>
            <button style={{ ...styles.iconBtn, color: '#ba1a1a' }} onClick={handleLogout} className="desktop-only">
              <span className="material-symbols-outlined">logout</span>
              <span style={styles.iconText}>Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Wrapper */}
      <div style={styles.mainWrapper}>
        {showNotificationPanel && (
          <div style={{
            position: 'fixed', right: '1rem', top: '72px', width: '360px', maxHeight: '420px',
            overflowY: 'auto', background: '#fff', border: '1px solid #efeeeb',
            borderRadius: '0.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 150, padding: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong>Notifications</strong>
              {socialNonLusCount > 0 && (
                <button onClick={markAllSocialAsRead} style={{ border: 'none', background: 'none', color: '#0a66c2', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            {socialNotifications.length === 0 ? (
              <div style={{ color: '#727783', fontSize: '0.875rem', padding: '0.75rem 0.25rem' }}>Aucune notification.</div>
            ) : (
              socialNotifications.slice(0, 15).map((n) => (
                <div key={n.id} style={{
                  padding: '0.6rem', borderRadius: '0.5rem', marginBottom: '0.35rem',
                  backgroundColor: n.statut === 'NON_LU' ? '#f0f7ff' : '#f9f9f9',
                  border: '1px solid #efeeeb', cursor: n.statut === 'NON_LU' ? 'pointer' : 'default',
                }} onClick={() => n.statut === 'NON_LU' && markSocialAsRead(n.id)}>
                  <div style={{ fontSize: '0.85rem', color: '#1b1c1a' }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: '#727783', marginTop: '0.25rem' }}>{new Date(n.dateNotification).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mobile-sidebar-overlay" style={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>

        <aside className="desktop-sidebar" style={styles.sidebar}>
          <div style={styles.profileCard}>
            <div style={styles.avatarLarge}>
              {user?.photo ? (
                <img src={`${BASE_URL}${user.photo}`} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#004e99' }}>account_circle</span>
              )}
            </div>
            <div style={styles.welcomeText}>Bienvenue, {user?.nomComplet?.split(' ')[0] || 'Étudiant'}</div>
            <p style={{ fontSize: '0.75rem', color: '#414752', marginTop: '4px' }}>Espace Étudiant</p>
          </div>

          <nav style={styles.navMenu}>
            {menuItems.map((item) => (
              <Link 
                key={item.path} to={item.path} style={styles.navItem(item.path)}
                onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.name === 'Messagerie' && nonLusCount > 0 && (
                  <span style={{ 
                    backgroundColor: '#ba1a1a', color: 'white', fontSize: '10px', 
                    borderRadius: '50%', width: '18px', height: '18px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>{nonLusCount}</span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content" style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
