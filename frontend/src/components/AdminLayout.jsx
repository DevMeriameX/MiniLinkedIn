// src/components/LayoutAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '../services/api';

const LayoutAdmin = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [nonLus, setNonLus] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications || []);
      setNonLus(res.data.nonLus || 0);
    } catch (err) {
      console.error("Erreur chargement notifications", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.marquerCommeLue(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/admin');
  };

  // Menu latéral – ajout de "Publications"
  const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', path: '/dashboard' },
      // <-- NOUVEAU
    { name: 'Gestion des comptes', icon: 'group', path: '/comptes' },
    { name: 'Modération', icon: 'gavel', path: '/moderation' },
    { name: 'Signalements', icon: 'report', path: '/signalements' },
    { name: 'Vérification des attestations', icon: 'verified', path: '/attestations' },
    { name: 'Publications', icon: 'article', path: '/publications' }, 
    { name: 'Statistiques', icon: 'leaderboard', path: '/statistiques' },
    { name: 'Paramètres', icon: 'settings', path: '/parametres' },
  ];

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
    navIcons: { display: 'flex', gap: '1rem', alignItems: 'center' },
    iconBtn: { padding: '0.5rem', color: '#414752', cursor: 'pointer', background: 'none', border: 'none', borderRadius: '50%', position: 'relative' },
    badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ba1a1a', color: 'white', borderRadius: '9999px', fontSize: '10px', padding: '2px 6px', minWidth: '18px', textAlign: 'center' },
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
    notificationDropdown: {
      position: 'absolute', top: '50px', right: '0', width: '320px', maxHeight: '400px',
      backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      zIndex: 100, overflowY: 'auto', border: '1px solid #e9e8e5',
    },
    notifItem: { padding: '1rem', borderBottom: '1px solid #efeeeb', cursor: 'pointer', transition: 'background 0.2s' },
    notifUnread: { backgroundColor: '#f0f7ff' },
    notifRead: { backgroundColor: '#ffffff' },
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.container}>
      {/* TopNavBar */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>Mini LinkedIn Admin</div>
        <div style={styles.navIcons}>
          <div style={{ position: 'relative' }}>
            <button style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
              <span className="material-symbols-outlined">notifications</span>
              {nonLus > 0 && <span style={styles.badge}>{nonLus}</span>}
            </button>
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#414752' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      style={{ ...styles.notifItem, ...(notif.statut === 'NON_LU' ? styles.notifUnread : styles.notifRead) }}
                      onClick={() => notif.statut === 'NON_LU' && handleMarkAsRead(notif.id)}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: notif.statut === 'NON_LU' ? 'bold' : 'normal' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#727783', marginTop: '0.25rem' }}>
                        {new Date(notif.dateNotification).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={styles.navItem(isActive(item.path))}>
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
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
};

export default LayoutAdmin;