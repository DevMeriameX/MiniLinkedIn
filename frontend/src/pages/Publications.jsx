// src/pages/Publications.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

const Publications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('en_attente'); // 'en_attente', 'valide', 'refuse'
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, [statusFilter]); // recharger si le filtre change

  const fetchPublications = async () => {
    setLoading(true);
    setError('');
    try {
      // Selon le filtre, on appelle différents endpoints
      // Pour 'en_attente' : /api/admin/publications/en-attente
      // Pour les autres statuts, il faudrait un endpoint dédié. Pour simplifier, on affiche juste les en attente.
      // Ici, on ne gère que les EN_ATTENTE, mais on peut étendre plus tard.
      const response = await adminService.getPublicationsEnAttente();
      const data = response.data?.publications || [];
      setPublications(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les publications');
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (publicationId) => {
    if (!window.confirm('Valider cette publication ?')) return;
    setActionLoading(true);
    try {
      await adminService.validerPublication(publicationId);
      setSuccess('Publication validée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchPublications(); // rafraîchir
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la validation');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuser = async (publicationId) => {
    const raison = window.prompt('Motif du refus (optionnel) :');
    if (raison === null) return;
    setActionLoading(true);
    try {
      await adminService.refuserPublication(publicationId, raison);
      setSuccess('Publication refusée');
      setTimeout(() => setSuccess(''), 3000);
      fetchPublications();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du refus');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // ========== FONCTION openDocument ==========
  const openDocument = async (url) => {
    if (!url) return;
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
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

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/admin');
  };

  // Filtrer localement (search)
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = searchTerm === '' ||
      pub.contenu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.utilisateur?.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Styles (identiques à VerificationAttestations, avec quelques ajouts)
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
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
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
    roleBadge: {
      padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '10px',
      fontWeight: 'bold', backgroundColor: '#833900', color: 'white',
    },
    statusBadge: (statut) => ({
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.75rem', borderRadius: '9999px',
      backgroundColor: statut === 'EN_ATTENTE' ? '#fff3cd' : (statut === 'VALIDE' ? '#dcfce7' : '#ffdbca'),
      color: statut === 'EN_ATTENTE' ? '#856404' : (statut === 'VALIDE' ? '#166534' : '#773300'),
      fontSize: '11px', fontWeight: 'bold', marginBottom: '1rem',
    }),
    publicationContent: {
      fontSize: '0.875rem', color: '#1b1c1a', marginBottom: '1rem',
      whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '0.75rem',
      borderRadius: '0.5rem', border: '1px solid #efeeeb',
    },
    imagePreview: {
      maxWidth: '100%', maxHeight: '150px', borderRadius: '0.5rem',
      marginBottom: '0.75rem', objectFit: 'cover', border: '1px solid #efeeeb',
    },
    fileLink: {
      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem',
      backgroundColor: '#f4f3f0', borderRadius: '0.5rem', marginBottom: '1rem',
      textDecoration: 'none', color: '#004e99', fontSize: '0.8rem',
    },
    fileButton: {
      width: '100%', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0.75rem', backgroundColor: '#efeeeb',
      borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginBottom: '1rem',
    },
    fileInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    fileName: { fontSize: '0.875rem', fontWeight: 'medium' },
    actionButtons: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
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
    { name: 'Tableau de bord', icon: 'dashboard', path: '/dashboard' },
    { name: 'Gestion des comptes', icon: 'group', path: '/comptes' },
    { name: 'Modération', icon: 'gavel', path: '/moderation' },
    { name: 'Vérification des attestations', icon: 'verified', path: '/attestations' },
    { name: 'Signalements', icon: 'flag', path: '/signalements' },
    { name: 'Publications', icon: 'article', path: '/publications', active: true },
    { name: 'Statistiques', icon: 'insights', path: '/statistiques' },
    { name: 'Paramètres', icon: 'settings', path: '/parametres' },
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
          <input type="text" style={styles.searchInput} placeholder="Rechercher une publication..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
          <Link key={index} to={item.path} style={styles.navItem(item.path === '/publications')}>
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
            <h1 style={styles.pageTitle}>Gestion des publications</h1>
            <p style={styles.pageSubtitle}>
              Validez ou refusez les publications soumises par les enseignants.
            </p>
          </header>

          {error && <div style={styles.errorMsg}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <section style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <span className="material-symbols-outlined" style={styles.filterIcon}>search</span>
              <input type="text" style={styles.filterInput} placeholder="Rechercher par contenu ou auteur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="en_attente">En attente seulement</option>
              {/* On pourrait ajouter d'autres options si le backend les supporte */}
            </select>
          </section>

          {filteredPublications.length === 0 ? (
            <div style={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c1c6d4' }}>article</span>
              <p>Aucune publication en attente de validation</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Les publications soumises par les enseignants apparaîtront ici.
              </p>
            </div>
          ) : (
            <div style={styles.bentoGrid}>
              {filteredPublications.map((pub) => (
                <article key={pub.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.userInfo}>
                      <div style={styles.userAvatar}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>person</span>
                      </div>
                      <div>
                        <div style={styles.userName}>{pub.utilisateur?.nomComplet || 'Enseignant'}</div>
                        <div style={styles.userEmail}>{pub.utilisateur?.email || ''}</div>
                      </div>
                    </div>
                    <span style={styles.roleBadge}>
                      Enseignant
                    </span>
                  </div>

                  <div style={styles.statusBadge(pub.statut)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                      {pub.statut === 'EN_ATTENTE' ? 'pending' : (pub.statut === 'VALIDE' ? 'check_circle' : 'cancel')}
                    </span>
                    <span>
                      {pub.statut === 'EN_ATTENTE' ? 'En attente' : (pub.statut === 'VALIDE' ? 'Validé' : 'Refusé')}
                    </span>
                  </div>

                  <div style={styles.publicationContent}>
                    {pub.contenu || '(Aucun contenu textuel)'}
                  </div>

                  {pub.image && (
                    <img src={`http://localhost:8081${pub.image}`} alt="Publication" style={styles.imagePreview} />
                  )}

                  {pub.fichierJointUrl && (
                    <button 
                      style={styles.fileButton} 
                      onClick={() => openDocument(pub.fichierJointUrl)}
                    >
                      <div style={styles.fileInfo}>
                        <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>picture_as_pdf</span>
                        <span style={styles.fileName}>
                          {pub.fichierJointUrl?.split('/').pop() || 'Document.pdf'}
                        </span>
                      </div>
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  )}

                  {pub.statut === 'EN_ATTENTE' && (
                    <div style={styles.actionButtons}>
                      <button style={styles.approveBtn} onClick={() => handleValider(pub.id)} disabled={actionLoading}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check</span>
                        Valider
                      </button>
                      <button style={styles.rejectBtn} onClick={() => handleRefuser(pub.id)} disabled={actionLoading}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span>
                        Refuser
                      </button>
                    </div>
                  )}

                  {pub.statut !== 'EN_ATTENTE' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', textAlign: 'center', color: '#414752' }}>
                      {pub.statut === 'VALIDE' ? '✓ Publication validée' : '✗ Publication refusée'}
                      {pub.modifie && <span> (modifiée)</span>}
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

export default Publications;