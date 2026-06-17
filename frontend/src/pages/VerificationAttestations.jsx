import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const VerificationAttestations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Récupérer tous les utilisateurs (étudiants et enseignants)
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.getAllUsers();
      console.log('API Response:', response.data);
      const allUsers = response.data.users || [];
      // Filtrer les utilisateurs qui ont un document uploadé
      const usersWithDocuments = allUsers.filter(user => user.document && user.document !== null);
      setUsers(usersWithDocuments);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  // Approuver un document (activer le compte)
  const handleApprouver = async (userId) => {
    try {
      await authService.activerCompte(userId);
      setSuccess('Document approuvé et compte activé avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError('Erreur lors de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Rejeter un document (désactiver ou supprimer)
  const handleRejeter = async (userId) => {
    try {
      await authService.desactiverCompte(userId);
      setSuccess('Document rejeté et compte désactivé');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError('Erreur lors du rejet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  // ========== FONCTION openDocument CORRIGÉE ==========
  const openDocument = async (url) => {
    if (!url) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:8081${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 404 || response.status === 403) {
         alert("Erreur : Le fichier n'existe plus sur le serveur. Il a probablement été supprimé.");
         return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur de chargement du fichier');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Nettoyer l'URL après 5 secondes
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur de connexion au serveur pour récupérer le fichier.");
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'ENSEIGNANT': return 'Enseignant';
      default: return 'Étudiant';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN': return { bg: '#0a66c2', color: 'white' };
      case 'ENSEIGNANT': return { bg: '#833900', color: 'white' };
      default: return { bg: '#bfd5ff', color: '#001b3c' };
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'etudiant' && user.role === 'ETUDIANT') ||
      (roleFilter === 'enseignant' && user.role === 'ENSEIGNANT');
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && user.actif === false) ||
      (statusFilter === 'approved' && user.actif === true);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#faf9f6' },
    topNav: {
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      backgroundColor: '#faf9f6', backdropFilter: 'blur(20px)',
      height: '64px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0 1.5rem',
      boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)',
    },
    logo: { fontSize: '1.25rem', fontWeight: 800, color: '#004e99' },
    searchContainer: {
      display: 'flex', alignItems: 'center', backgroundColor: '#efeeeb',
      padding: '0.375rem 0.75rem', borderRadius: '0.5rem', width: '320px',
    },
    searchInput: {
      background: 'transparent', border: 'none', outline: 'none',
      fontSize: '0.875rem', width: '100%', color: '#1b1c1a',
    },
    navIcons: { display: 'flex', gap: '1rem', alignItems: 'center' },
    iconBtn: {
      padding: '0.5rem', color: '#414752', cursor: 'pointer',
      background: 'none', border: 'none', borderRadius: '50%',
    },
    avatar: {
      width: '40px', height: '40px', borderRadius: '50%',
      backgroundColor: '#e9e8e5', display: 'flex', alignItems: 'center',
      justifyContent: 'center', border: '2px solid #0a66c2',
    },
    sideNav: {
      position: 'fixed', left: 0, top: '64px', width: '256px',
      height: 'calc(100vh - 64px)', backgroundColor: '#faf9f6',
      display: 'flex', flexDirection: 'column', padding: '1rem 0',
    },
    sideHeader: {
      padding: '0 1.5rem', paddingBottom: '1.5rem',
      borderBottom: '1px solid #efeeeb', marginBottom: '0.5rem',
    },
    sideTitle: { fontSize: '1.125rem', fontWeight: 'bold', color: '#004e99' },
    sideSubtitle: { fontSize: '0.75rem', color: '#414752' },
    navItem: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.5rem', color: isActive ? '#004e99' : '#414752',
      backgroundColor: isActive ? '#0a66c210' : 'transparent',
      borderRight: isActive ? '4px solid #004e99' : 'none',
      fontWeight: isActive ? 'bold' : 'normal', fontSize: '0.875rem',
      textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s',
    }),
    addButton: { marginTop: 'auto', padding: '0 1.5rem', paddingBottom: '2rem' },
    addBtn: {
      width: '100%', padding: '0.75rem',
      background: 'linear-gradient(135deg, #004e99 0%, #0a66c2 100%)',
      color: 'white', border: 'none', borderRadius: '0.75rem',
      fontWeight: 'bold', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.5rem', cursor: 'pointer',
    },
    mainContent: {
      marginLeft: '256px', marginTop: '64px', padding: '2rem', maxWidth: '1280px',
    },
    pageHeader: { marginBottom: '2rem' },
    pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.5rem' },
    pageSubtitle: { color: '#414752', maxWidth: '672px' },
    filterBar: {
      backgroundColor: '#f4f3f0', padding: '1rem', borderRadius: '0.75rem',
      display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
      alignItems: 'center',
    },
    searchWrapper: { flex: 1, minWidth: '280px', position: 'relative' },
    filterIcon: {
      position: 'absolute', left: '0.75rem', top: '50%',
      transform: 'translateY(-50%)', color: '#414752',
    },
    filterInput: {
      width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.5rem',
      backgroundColor: '#ffffff', border: 'none', borderRadius: '0.5rem',
      outline: 'none', fontSize: '0.875rem',
    },
    select: {
      padding: '0.625rem 1rem', backgroundColor: '#ffffff',
      border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem',
      cursor: 'pointer',
    },
    bentoGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem',
      boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
    userInfo: { display: 'flex', gap: '1rem' },
    userAvatar: {
      width: '56px', height: '56px', borderRadius: '50%',
      backgroundColor: '#e9e8e5', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
    },
    userName: { fontWeight: 'bold', color: '#1b1c1a' },
    userEmail: { fontSize: '0.75rem', color: '#414752' },
    roleBadge: (role) => {
      const colors = getRoleBadgeColor(role);
      return {
        padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '10px',
        fontWeight: 'bold', backgroundColor: colors.bg, color: colors.color,
      };
    },
    statusBadge: (actif) => ({
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.75rem', borderRadius: '9999px',
      backgroundColor: actif ? '#dcfce7' : '#ffdbca',
      color: actif ? '#166534' : '#773300',
      fontSize: '11px', fontWeight: 'bold', marginBottom: '1rem',
    }),
    fileButton: {
      width: '100%', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0.75rem', backgroundColor: '#efeeeb',
      borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginBottom: '1rem',
    },
    fileInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    fileName: { fontSize: '0.875rem', fontWeight: 'medium' },
    actionButtons: { display: 'flex', gap: '0.75rem' },
    approveBtn: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.5rem', padding: '0.625rem', backgroundColor: '#10b981',
      color: 'white', border: 'none', borderRadius: '0.5rem',
      fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer',
    },
    rejectBtn: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.5rem', padding: '0.625rem', backgroundColor: 'transparent',
      color: '#ba1a1a', border: '1px solid #ba1a1a', borderRadius: '0.5rem',
      fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer',
    },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: {
      width: '40px', height: '40px', border: '3px solid #e9e8e5',
      borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite',
    },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    successMsg: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    emptyState: { textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', color: '#414752' },
  };

  const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', active: false, path: '/dashboard' },
    { name: 'Gestion des comptes', icon: 'group', active: false, path: '/comptes' },
    { name: 'Modération', icon: 'gavel', active: false, path: '/moderation' },
     { name: 'Vérification des attestations', icon: 'verified', active: false, path: '/attestations' },
     { name: 'Publications', icon: 'article', path: '/publications' }, 
    { name: 'Signalements', icon: 'flag', active: false, path: '/signalements' },
    { name: 'Statistiques', icon: 'insights', active: false, path: '/statistiques' },
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
      <nav style={styles.topNav}>
        <div style={styles.logo}>Mini LinkedIn Admin</div>
        <div style={styles.searchContainer}>
          <span className="material-symbols-outlined" style={{ color: '#414752' }}>search</span>
          <input type="text" style={styles.searchInput} placeholder="Rechercher un dossier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={styles.navIcons}>
          <button style={styles.iconBtn}><span className="material-symbols-outlined">notifications</span></button>
          <button style={styles.iconBtn}><span className="material-symbols-outlined">mail</span></button>
          <button style={styles.iconBtn}><span className="material-symbols-outlined">help</span></button>
          <button onClick={handleLogout} style={styles.iconBtn}><span className="material-symbols-outlined">logout</span></button>
          <div style={styles.avatar}><span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>account_circle</span></div>
        </div>
      </nav>

      <aside style={styles.sideNav}>
        <div style={styles.sideHeader}>
          <div style={styles.sideTitle}>Mini LinkedIn</div>
          <div style={styles.sideSubtitle}>Espace Administrateur</div>
        </div>
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} style={styles.navItem(item.active)}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        <div style={styles.addButton}>
          <button style={styles.addBtn}><span className="material-symbols-outlined">add_alert</span>Nouvelle Alerte</button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <div>
          <header style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Vérification des attestations</h1>
            <p style={styles.pageSubtitle}>
              Passez en revue les documents académiques (CV, diplômes) soumis par les utilisateurs lors de leur inscription.
            </p>
          </header>

          {error && <div style={styles.errorMsg}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <section style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <span className="material-symbols-outlined" style={styles.filterIcon}>search</span>
              <input type="text" style={styles.filterInput} placeholder="Rechercher par nom, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select style={styles.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Tous les rôles</option>
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
            </select>
            <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
            </select>
          </section>

          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c1c6d4' }}>inbox</span>
              <p>Aucun document à vérifier</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Les documents uploadés par les utilisateurs lors de leur inscription apparaîtront ici.
              </p>
            </div>
          ) : (
            <div style={styles.bentoGrid}>
              {filteredUsers.map((user) => (
                <article key={user.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.userInfo}>
                      <div style={styles.userAvatar}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>person</span>
                      </div>
                      <div>
                        <div style={styles.userName}>{user.nomComplet}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                    <span style={styles.roleBadge(user.role)}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  <div style={styles.statusBadge(user.actif)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                      {user.actif ? 'check_circle' : 'pending'}
                    </span>
                    <span>{user.actif ? 'Approuvé' : 'En attente de vérification'}</span>
                  </div>

                  <div>
                    <p style={{ fontWeight: 'bold' }}>Document d'inscription</p>
                    <p style={{ fontSize: '0.75rem', color: '#414752' }}>
                      Soumis le {new Date(user.dateInscription).toLocaleDateString()}
                    </p>
                  </div>

                  <button 
                    style={styles.fileButton} 
                    onClick={() => openDocument(user.document)}
                  >
                    <div style={styles.fileInfo}>
                      <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>picture_as_pdf</span>
                      <span style={styles.fileName}>
                        {user.document?.split('/').pop() || 'Document.pdf'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined">open_in_new</span>
                  </button>

                  {!user.actif && (
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.approveBtn} 
                        onClick={() => handleApprouver(user.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check</span>
                        Approuver
                      </button>
                      <button 
                        style={styles.rejectBtn} 
                        onClick={() => handleRejeter(user.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span>
                        Rejeter
                      </button>
                    </div>
                  )}

                  {user.actif && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', textAlign: 'center' }}>
                      ✓ Compte activé
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerificationAttestations;