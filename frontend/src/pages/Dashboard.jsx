// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import LayoutAdmin from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import { authService, diplomeService, adminService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ utilisateursActifs: 0, publicationsTotales: 0, connexions: 0, signalements: 0 });
  const [documents, setDocuments] = useState([]);
  const [publicationsEnAttente, setPublicationsEnAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchData();
    fetchPublicationsEnAttente();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await authService.getAllUsers();
      const users = usersResponse.data?.users || [];
      const statsResponse = await adminService.getStatistiques();
      const globalStats = statsResponse.data || {};
      const docsResponse = await diplomeService.getDocumentsEnAttente();
      const documentsData = docsResponse.data?.documents || [];

      setStats({
        utilisateursActifs: globalStats.utilisateursActifs || users.filter(u => u.actif).length,
        publicationsTotales: globalStats.totalPublications || 0,
        connexions: globalStats.totalConnexions || users.length,
        signalements: globalStats.signalementsEnAttente || 0,
        etudiantsCount: globalStats.totalEtudiants || users.filter(u => u.role === 'ETUDIANT').length,
        enseignantsCount: globalStats.totalEnseignants || users.filter(u => u.role === 'ENSEIGNANT').length,
        activiteRecente: globalStats.activiteRecente || {}
      });
      setDocuments(documentsData.slice(0, 3));
    } catch (err) {
      setError('Impossible de charger les données.');
      setStats({ utilisateursActifs: 124, publicationsTotales: 342, connexions: 890, signalements: 5, etudiantsCount: 80, enseignantsCount: 44, activiteRecente: {} });
    } finally { setLoading(false); }
  };

  const fetchPublicationsEnAttente = async () => {
    try {
      const response = await adminService.getPublicationsEnAttente();
      setPublicationsEnAttente(response.data?.publications || []);
    } catch (err) {
      console.error('Erreur chargement publications en attente', err);
      setPublicationsEnAttente([]);
    }
  };

  const handleValider = async (publicationId) => {
    if (!window.confirm('Valider cette publication ?')) return;
    setActionLoading(true);
    try {
      await adminService.validerPublication(publicationId);
      alert('Publication validée avec succès');
      await fetchPublicationsEnAttente();
      await fetchData(); // rafraîchir les stats (publications totales)
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la validation');
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
      alert('Publication refusée');
      await fetchPublicationsEnAttente();
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors du refus');
    } finally {
      setActionLoading(false);
    }
  };

  // Données pour les graphiques (dynamiques)
  const activite = stats.activiteRecente || {};
  const activiteKeys = Object.keys(activite);
  const days = activiteKeys.length > 0 ? activiteKeys : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const barHeights = activiteKeys.length > 0 ? Object.values(activite).map(v => Math.min(v * 1.5, 100)) : [40, 55, 75, 90, 80, 45, 35];
  
  const totalProfiles = (stats.etudiantsCount || 0) + (stats.enseignantsCount || 0);
  const etudiantsPercent = totalProfiles > 0 ? Math.round(((stats.etudiantsCount || 0) / totalProfiles) * 100) : 0;
  const enseignantsCount = stats.enseignantsCount || 0;
  const etudiantsCount = stats.etudiantsCount || 0;

  // Styles (inchangés)
  const styles = {
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' },
    headerTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.5rem' },
    headerSubtitle: { color: '#414752', fontSize: '1rem' },
    welcomeBadge: { backgroundColor: '#004e99', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '0.5rem' },
    periodSelector: { display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f4f3f0', padding: '0.25rem', borderRadius: '0.75rem' },
    periodBtnActive: { padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.875rem', fontWeight: 'bold', color: '#004e99', border: 'none', cursor: 'pointer' },
    periodBtnInactive: { padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'transparent', fontSize: '0.875rem', fontWeight: 500, color: '#414752', border: 'none', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
    statCard: (borderColor) => ({ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderLeft: `4px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '1rem' }),
    statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    statIconBox: (bgColor) => ({ padding: '0.5rem', backgroundColor: bgColor, borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }),
    statBadge: (bgColor, textColor) => ({ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '9999px', backgroundColor: bgColor, color: textColor }),
    statValue: { fontSize: '1.875rem', fontWeight: 800, color: '#1b1c1a' },
    statLabel: { fontSize: '0.875rem', color: '#414752' },
    analyticsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' },
    chartCard: { backgroundColor: '#f4f3f0', padding: '2rem', borderRadius: '1rem' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    chartTitle: { fontSize: '1.25rem', fontWeight: 'bold' },
    chartLegend: { display: 'flex', alignItems: 'center', gap: '1rem' },
    legendDot: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, marginRight: '0.25rem' }),
    chartContainer: { height: '256px', position: 'relative', display: 'flex', flexDirection: 'column' },
    dayLabel: { fontSize: '12px', textAlign: 'center', color: '#414752', fontWeight: 'bold', marginTop: '0.5rem', flex: 1 },
    distributionCard: { backgroundColor: '#e3e2df', padding: '2rem', borderRadius: '1rem' },
    pieContainer: { position: 'relative', width: '192px', height: '192px', margin: '0 auto' },
    pieOuter: { position: 'absolute', inset: 0, borderRadius: '50%', border: '16px solid #bfd5ff' },
    pieSlice: (percent) => ({ position: 'absolute', inset: 0, borderRadius: '50%', border: '16px solid #833900', borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: `rotate(-${90 - (percent / 100) * 180}deg)`, clipPath: percent <= 50 ? `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI * (percent / 100) * 2)}% ${50 - 50 * Math.sin(Math.PI * (percent / 100) * 2)}%, 50% 50%)` : undefined }),
    pieCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    piePercentage: { fontSize: '1.5rem', fontWeight: 800, color: '#1b1c1a' },
    pieLabel: { fontSize: '10px', fontWeight: 'bold', color: '#414752', textTransform: 'uppercase' },
    distributionList: { marginTop: '2rem' },
    distItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    distLabel: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    distColor: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }),
    mentorBox: { marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' },
    verificationSection: { marginTop: '3rem' },
    verificationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    verificationTitle: { fontSize: '1.5rem', fontWeight: 800 },
    viewAll: { fontSize: '0.875rem', fontWeight: 'bold', color: '#004e99', background: 'none', border: 'none', cursor: 'pointer' },
    verificationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
    verificationCard: { backgroundColor: '#fff', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
    avatarBox: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e9e8e5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    onlineDot: { position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid white' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: '0.875rem', fontWeight: 'bold', display: 'block' },
    cardTitle: { fontSize: '11px', color: '#414752' },
    arrowButton: { color: '#004e99', background: 'none', border: 'none', cursor: 'pointer' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <LayoutAdmin>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.headerTitle}>Aperçu Analytique</h1>
          <p style={styles.headerSubtitle}>
            Bienvenue, {user?.nomComplet || 'Administrateur'}. Voici l'état actuel de votre réseau.
            {user?.role === 'ADMIN' && <span style={styles.welcomeBadge}>Admin</span>}
          </p>
        </div>
        <div style={styles.periodSelector}>
          <button style={styles.periodBtnActive}>7 derniers jours</button>
          <button style={styles.periodBtnInactive}>Mensuel</button>
        </div>
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}

      {/* Cartes statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#004e99')}>
          <div style={styles.statHeader}>
            <div style={styles.statIconBox('#004e9910')}>
              <span className="material-symbols-outlined" style={{ color: '#004e99' }}>person</span>
            </div>
            <span style={styles.statBadge('#dcfce7', '#166534')}>+12.5%</span>
          </div>
          <div>
            <div style={styles.statValue}>{stats.utilisateursActifs.toLocaleString()}</div>
            <div style={styles.statLabel}>Utilisateurs actifs</div>
          </div>
        </div>
        <div style={styles.statCard('#495f83')}>
          <div style={styles.statHeader}>
            <div style={styles.statIconBox('#bfd5ff30')}>
              <span className="material-symbols-outlined" style={{ color: '#495f83' }}>article</span>
            </div>
            <span style={styles.statBadge('#dcfce7', '#166534')}>+8.2%</span>
          </div>
          <div>
            <div style={styles.statValue}>{stats.publicationsTotales.toLocaleString()}</div>
            <div style={styles.statLabel}>Publications totales</div>
          </div>
        </div>
        <div style={styles.statCard('#833900')}>
          <div style={styles.statHeader}>
            <div style={styles.statIconBox('#ffdbca30')}>
              <span className="material-symbols-outlined" style={{ color: '#833900' }}>hub</span>
            </div>
            <span style={styles.statBadge('#efeeeb', '#414752')}>Stable</span>
          </div>
          <div>
            <div style={styles.statValue}>{stats.connexions.toLocaleString()}</div>
            <div style={styles.statLabel}>Connexions établies</div>
          </div>
        </div>
        <div style={styles.statCard('#ba1a1a')}>
          <div style={styles.statHeader}>
            <div style={styles.statIconBox('#ffdad630')}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>warning</span>
            </div>
            <span style={styles.statBadge('#ffdad6', '#ba1a1a')}>-2.4%</span>
          </div>
          <div>
            <div style={styles.statValue}>{stats.signalements}</div>
            <div style={styles.statLabel}>Signalements en attente</div>
          </div>
        </div>
      </div>

      {/* Graphique activité + Répartition des comptes */}
      <div style={styles.analyticsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>Activité de la plateforme</h2>
            <div style={styles.chartLegend}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={styles.legendDot('#004e99')}></span>
                <span style={{ fontSize: '0.75rem' }}>Visiteurs</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={styles.legendDot('#bfd5ff')}></span>
                <span style={{ fontSize: '0.75rem' }}>Interactions</span>
              </span>
            </div>
          </div>
          <div style={styles.chartContainer}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg viewBox="0 -10 400 220" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {/* Lignes de grille */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#e9e8e5" strokeWidth="1" />
                ))}
                
                {/* Ligne secondaire (Interactions) */}
                <polyline
                  fill="none"
                  stroke="#bfd5ff"
                  strokeWidth="4"
                  points={barHeights.map((h, i) => `${i * (400 / 6)},${200 - (h * 1.5)}`).join(' ')}
                />
                
                {/* Points ligne secondaire */}
                {barHeights.map((h, i) => (
                  <circle key={`sec-${i}`} cx={i * (400 / 6)} cy={200 - (h * 1.5)} r="5" fill="#ffffff" stroke="#bfd5ff" strokeWidth="2" />
                ))}

                {/* Ligne principale (Visiteurs) */}
                <polyline
                  fill="none"
                  stroke="#004e99"
                  strokeWidth="4"
                  points={barHeights.map((h, i) => `${i * (400 / 6)},${200 - (h * 2)}`).join(' ')}
                />
                
                {/* Points ligne principale */}
                {barHeights.map((h, i) => (
                  <circle key={`prim-${i}`} cx={i * (400 / 6)} cy={200 - (h * 2)} r="5" fill="#ffffff" stroke="#004e99" strokeWidth="3" />
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
              {days.map((day) => (
                <div key={day} style={styles.dayLabel}>{day}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={styles.distributionCard}>
          <h2 style={styles.chartTitle}>Répartition des comptes</h2>
          <div style={styles.pieContainer}>
            <div style={styles.pieOuter}></div>
            <div style={styles.pieSlice(etudiantsPercent)}></div>
            <div style={styles.pieCenter}>
              <span style={styles.piePercentage}>{etudiantsPercent}%</span>
              <span style={styles.pieLabel}>Étudiants</span>
            </div>
          </div>
          <div style={styles.distributionList}>
            <div style={styles.distItem}>
              <div style={styles.distLabel}>
                <div style={styles.distColor('#bfd5ff')}></div>
                <span>Étudiants</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{etudiantsCount}</span>
            </div>
            <div style={styles.distItem}>
              <div style={styles.distLabel}>
                <div style={styles.distColor('#833900')}></div>
                <span>Enseignants</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{enseignantsCount}</span>
            </div>
          </div>
          <div style={styles.mentorBox}>
            <img
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANQ_GGbklcogqRUt2D3rzhVenUS3T5XDtqNAxW7A2u8f9pRp0sAPxbCayHVshzoP85TqG6gBLVaVJ5Krc3KJJ3K1yip6S9j37smd0qEPMjt_EDjWPP4Pv2NEEkZpkJSgskcRTpjEoXiYypNP23Gc_MZ3oB9wZgQRtKeoW_I2SVhRP5zxlKVk7BdKBzFB4rErVOqTyYfArRR0v6kTBsNJt_fnWq8KAFZ1KOUDdnalxymzk451xKeetUB1I0pyHm_-fwmxJ8qgoVEns"
              alt="avatar"
            />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#004e99' }}>Dernière vérification</div>
              <div>Dr. Sophie Martin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section : Documents en attente (attestations) */}
      {documents.length > 0 && (
        <section style={styles.verificationSection}>
          <div style={styles.verificationHeader}>
            <h2 style={styles.verificationTitle}>Vérifications en attente</h2>
            <Link to="/attestations" style={styles.viewAll}>Voir tout le registre</Link>
          </div>
          <div style={styles.verificationGrid}>
            {documents.map(doc => (
              <div key={doc.id} style={styles.verificationCard}>
                <div style={styles.avatarBox}>
                  <span className="material-symbols-outlined">person</span>
                  <div style={styles.onlineDot}></div>
                </div>
                <div style={styles.cardInfo}>
                  <span style={styles.cardName}>{doc.enseignantNom || 'Utilisateur'}</span>
                  <span style={styles.cardTitle}>{doc.diplomeNom || 'Document'}</span>
                </div>
                <Link to="/attestations" style={styles.arrowButton}>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🆕 Section : Publications en attente de validation */}
      {publicationsEnAttente.length > 0 ? (
        <section style={styles.verificationSection}>
          <div style={styles.verificationHeader}>
            <h2 style={styles.verificationTitle}>Publications en attente de validation</h2>
            <span style={{ fontSize: '0.875rem', color: '#414752' }}>{publicationsEnAttente.length} en attente</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {publicationsEnAttente.map(pub => (
              <div key={pub.id} style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e9e8e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{pub.utilisateur?.nomComplet || 'Enseignant'}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                      {new Date(pub.datePublication).toLocaleString()}
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    EN ATTENTE
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#1b1c1a', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                  {pub.contenu?.substring(0, 150)}{pub.contenu?.length > 150 ? '…' : ''}
                </p>
                {pub.image && (
                  <img src={pub.image} alt="aperçu" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '0.5rem', marginBottom: '0.75rem' }} />
                )}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleValider(pub.id)}
                    disabled={actionLoading}
                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✓ Valider
                  </button>
                  <button
                    onClick={() => handleRefuser(pub.id)}
                    disabled={actionLoading}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✗ Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        !loading && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6c757d' }}>
            Aucune publication en attente de validation.
          </p>
        )
      )}
    </LayoutAdmin>
  );
};

export default Dashboard;