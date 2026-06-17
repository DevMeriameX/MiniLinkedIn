// src/pages/GestionComptes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutAdmin from '../components/AdminLayout';
import { authService } from '../services/api';

const GestionComptes = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changingRole, setChangingRole] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Impossible de charger les utilisateurs');
    } finally { setLoading(false); }
  };

  const handleActiver = async (userId) => {
    try {
      await authService.activerCompte(userId);
      setSuccess('Compte activé');
      fetchUsers();
    } catch (err) { setError('Erreur activation'); }
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleDesactiver = async (userId) => {
    try {
      await authService.desactiverCompte(userId);
      setSuccess('Compte désactivé');
      fetchUsers();
    } catch (err) { setError('Erreur désactivation'); }
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleChangerRole = async (userId, nouveauRole) => {
    if (nouveauRole === 'ADMIN' && !window.confirm('Attention : attribuer le rôle ADMIN donne tous les droits. Confirmer ?')) return;
    setChangingRole(userId);
    try {
      await authService.changerRole(userId, nouveauRole);
      setSuccess(`Rôle changé en ${nouveauRole}`);
      fetchUsers();
    } catch (err) {
      setError('Erreur changement de rôle');
    } finally {
      setChangingRole(null);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  // Filtres (identique)
  const filteredUsers = users.filter(user => {
    const matchSearch = searchTerm === '' || user.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || user.role === roleFilter.toUpperCase();
    const matchStatus = statusFilter === 'all' || (statusFilter === 'actif' && user.actif) || (statusFilter === 'inactif' && !user.actif);
    return matchSearch && matchRole && matchStatus;
  });

  const totalUsers = users.length;
  const actifsCount = users.filter(u => u.actif).length;
  const inactifsCount = users.filter(u => !u.actif).length;
  const enseignantsCount = users.filter(u => u.role === 'ENSEIGNANT').length;
  const etudiantsCount = users.filter(u => u.role === 'ETUDIANT').length;

  const roleOptions = [
    { value: 'ETUDIANT', label: 'Étudiant', color: '#bfd5ff' },
    { value: 'ENSEIGNANT', label: 'Enseignant', color: '#833900' },
    { value: 'ADMIN', label: 'Administrateur', color: '#0a66c2' },
  ];

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'ADMIN': return { backgroundColor: '#0a66c2', color: 'white' };
      case 'ENSEIGNANT': return { backgroundColor: '#833900', color: 'white' };
      default: return { backgroundColor: '#bfd5ff', color: '#001b3c' };
    }
  };

  const styles = {
    pageHeader: { marginBottom: '2rem' },
    pageTitle: { fontSize: '2.25rem', fontWeight: 800, color: '#1b1c1a', marginBottom: '0.5rem' },
    pageSubtitle: { color: '#414752', maxWidth: '672px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
    statCard: (borderColor) => ({ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderLeft: `4px solid ${borderColor}` }),
    statValue: { fontSize: '1.875rem', fontWeight: 800, color: '#1b1c1a' },
    statLabel: { fontSize: '0.75rem', color: '#414752', textTransform: 'uppercase', fontWeight: 'bold' },
    filterBar: { backgroundColor: '#f4f3f0', padding: '1rem', borderRadius: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' },
    searchWrapper: { flex: 1, minWidth: '280px', position: 'relative' },
    filterIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#414752' },
    filterInput: { width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.5rem', backgroundColor: '#fff', border: 'none', borderRadius: '0.5rem', outline: 'none', fontSize: '0.875rem' },
    select: { padding: '0.625rem 1rem', backgroundColor: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' },
    tableContainer: { width: '100%', backgroundColor: '#fff', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
    th: { textAlign: 'left', padding: '1rem 1.5rem', backgroundColor: '#efeeeb', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#414752' },
    td: { padding: '1rem 1.5rem', borderBottom: '1px solid #efeeeb' },
    roleBadge: (role) => ({ ...getRoleBadgeStyle(role), display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }),
    statusDot: (actif) => ({ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: actif ? '#10b981' : '#9ca3af' }),
    actionBtn: { padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.5rem' },
    roleSelect: { marginLeft: '0.5rem', padding: '0.25rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid #c1c6d4' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    successMsg: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' },
    loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#004e99', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <LayoutAdmin>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Gestion des Comptes</h1>
        <p style={styles.pageSubtitle}>Supervisez les membres, ajustez les rôles et activez/désactivez les comptes.</p>
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#004e99')}><div style={styles.statValue}>{totalUsers}</div><div style={styles.statLabel}>Total Membres</div></div>
        <div style={styles.statCard('#10b981')}><div style={styles.statValue}>{actifsCount}</div><div style={styles.statLabel}>Comptes Actifs</div></div>
        <div style={styles.statCard('#833900')}><div style={styles.statValue}>{enseignantsCount}</div><div style={styles.statLabel}>Enseignants</div></div>
        <div style={styles.statCard('#f59e0b')}><div style={styles.statValue}>{inactifsCount}</div><div style={styles.statLabel}>En Attente</div></div>
      </div>

      {/* Filtres */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <span className="material-symbols-outlined" style={styles.filterIcon}>search</span>
          <input type="text" style={styles.filterInput} placeholder="Filtrer par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select style={styles.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Tous les Rôles</option>
          <option value="ADMIN">Admin</option><option value="ENSEIGNANT">Enseignant</option><option value="ETUDIANT">Étudiant</option>
        </select>
        <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tous les Statuts</option><option value="actif">Actif</option><option value="inactif">Inactif</option>
        </select>
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={styles.th}>Nom complet</th><th style={styles.th}>Email</th><th style={styles.th}>Rôle</th><th style={styles.th}>Statut</th><th style={styles.th}>Actions</th>
          </tr></thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 'bold' }}>{user.nomComplet}</div>
                  <div style={{ fontSize: '0.7rem', color: '#414752' }}>Inscrit le {new Date(user.dateInscription).toLocaleDateString()}</div>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={styles.roleBadge(user.role)}>{user.role === 'ADMIN' ? 'Admin' : user.role === 'ENSEIGNANT' ? 'Enseignant' : 'Étudiant'}</span>
                  {user.role !== 'ADMIN' && (
                    <select
                      value={user.role}
                      onChange={(e) => handleChangerRole(user.id, e.target.value)}
                      disabled={changingRole === user.id}
                      style={styles.roleSelect}
                    >
                      {roleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={styles.statusDot(user.actif)}></div><span>{user.actif ? 'Actif' : 'Inactif'}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {user.role !== 'ADMIN' && (
                    user.actif ?
                      <button onClick={() => handleDesactiver(user.id)} style={{ ...styles.actionBtn, color: '#ef4444' }} title="Désactiver"><span className="material-symbols-outlined">block</span></button> :
                      <button onClick={() => handleActiver(user.id)} style={{ ...styles.actionBtn, color: '#10b981' }} title="Activer"><span className="material-symbols-outlined">check_circle</span></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#414752' }}>Aucun utilisateur trouvé</div>}
      </div>
    </LayoutAdmin>
  );
};

export default GestionComptes;