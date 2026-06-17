import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicationEnseignantService } from '../services/api';

const EnseignantPublications = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    resume: '',
    typePublication: 'PROJET',
    contenu: '',
    fichier: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Helper pour récupérer l'ID enseignant
  const getEnseignantId = () => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    const u = user || storedUser;
    return u?.id || u?.userId || u?.enseignantId || sessionStorage.getItem('enseignantId');
  };

  useEffect(() => {
    const id = getEnseignantId();
    if (id) {
      fetchPublications();
    }
  }, [user]);

  const fetchPublications = async () => {
    const id = getEnseignantId();
    if (!id) {
      setError('Identifiant enseignant manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await publicationEnseignantService.getMesPublications(id);
      const data = response.data.publications || response.data;
      setPublications(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos publications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, fichier: e.target.files[0] }));
  };

  const resetForm = () => {
    setFormData({ titre: '', resume: '', typePublication: 'PROJET', contenu: '', fichier: null });
    setEditingPub(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = getEnseignantId();
    if (!id) {
      setError("Identifiant enseignant manquant.");
      return;
    }
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('resume', formData.resume);
      formDataToSend.append('typePublication', formData.typePublication);
      formDataToSend.append('contenu', formData.contenu);
      formDataToSend.append('auteurEmail', user?.email || '');

      // On n'envoie le fichier que s'il a été sélectionné
      if (formData.fichier) {
        formDataToSend.append('fichierJoint', formData.fichier);
      }

      if (editingPub) {
        // Le backend attend du JSON (ModifierPublicationRequest) pour le PUT
        const updateData = {
          titre: formData.titre,
          resume: formData.resume,
          typePublication: formData.typePublication,
          contenu: formData.contenu
        };
        await publicationEnseignantService.modifierPublication(id, editingPub.id, updateData);
        setSuccess('Publication mise à jour');
      } else {
        // Le backend attend du FormData pour le POST (création avec fichier)
        await publicationEnseignantService.creerPublication(id, formDataToSend);
        setSuccess('Publication créée (en attente de validation)');
      }
      resetForm();
      fetchPublications();
    } catch (err) {
      console.error('API Error:', err);
      setError(err.customMessage || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleEdit = (pub) => {
    setEditingPub(pub);
    setFormData({
      titre: pub.titre || '',
      resume: pub.resume || '',
      typePublication: pub.typePublication || 'PROJET',
      contenu: pub.contenu || '',
      fichier: null, // Reset file selection for edit
    });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (pubId) => {
    const id = getEnseignantId();
    if (!id) return;
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    setProcessingId(pubId);
    try {
      await publicationEnseignantService.supprimerPublication(id, pubId);
      setSuccess('Publication supprimée');
      fetchPublications();
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setProcessingId(null);
    }
  };

  const styles = {
    pageHeader: { marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#1b1c1a' },
    createButton: {
      background: '#0a66c2', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem',
      fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
    },
    formCard: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
    formGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#414752', marginBottom: '0.5rem' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #e9e8e5', borderRadius: '0.5rem', fontSize: '0.875rem', minHeight: '120px', fontFamily: 'inherit' },
    fileInput: { marginTop: '0.5rem', fontSize: '0.875rem' },
    formActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
    submitBtn: { padding: '0.6rem 2rem', backgroundColor: '#0a66c2', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { padding: '0.6rem 2rem', backgroundColor: '#f4f3f0', color: '#1b1c1a', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' },
    bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' },
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    statusBadge: (statut) => ({
      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold',
      backgroundColor: statut === 'VALIDE' ? '#dcfce7' : statut === 'REFUSE' ? '#ffdad6' : '#fff3c4',
      color: statut === 'VALIDE' ? '#166534' : statut === 'REFUSE' ? '#ba1a1a' : '#92400e',
    }),
    publicationContent: { fontSize: '0.95rem', color: '#1b1c1a', margin: '1rem 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
    fichierBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f0f7ff', color: '#004e99', borderRadius: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', marginTop: 'auto' },
    actionButtons: { display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f4f3f0', paddingTop: '1rem' },
    editBtn: { flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: '#0a66c2', border: '1px solid #0a66c2', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' },
    deleteBtn: { flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: '#ba1a1a', border: '1px solid #ba1a1a', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' },
    loadingContainer: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: '40px', height: '40px', border: '3px solid #e9e8e5', borderTopColor: '#0a66c2', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    errorMsg: { backgroundColor: '#ffdad6', color: '#ba1a1a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' },
    successMsg: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' },
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
    <>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Mes publications</h1>
          <p style={{ color: '#414752' }}>Gérez vos contenus de recherche et documents joints.</p>
        </div>
        <button style={styles.createButton} onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined">add</span> Nouvelle publication
        </button>
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {editingPub ? 'Modifier la publication' : 'Créer une publication'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type de publication *</label>
              <select
                name="typePublication"
                value={formData.typePublication}
                onChange={handleInputChange}
                style={{ ...styles.textarea, minHeight: 'unset' }}
                required
              >
                <option value="OFFRE_STAGE">Offre de stage</option>
                <option value="PROJET">Projet</option>
                <option value="COURS">Cours</option>
                <option value="ARTICLE_RECHERCHE">Article de recherche</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Titre *</label>
              <input
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Titre de la publication"
                style={{ ...styles.textarea, minHeight: 'unset' }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Résumé *</label>
              <textarea
                name="resume"
                value={formData.resume}
                onChange={handleInputChange}
                placeholder="Résumé rapide"
                style={{ ...styles.textarea, minHeight: '90px' }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contenu de la publication *</label>
              <textarea 
                name="contenu" 
                value={formData.contenu} 
                onChange={handleInputChange} 
                placeholder="Décrivez votre recherche ou partagez un article..."
                style={styles.textarea} 
                required 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Pièce jointe (PDF ou Image)</label>
              {editingPub && (editingPub.fichierJointUrl || editingPub.image) && !formData.fichier && (
                <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#0a66c2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>attach_file</span>
                  Fichier actuel : {editingPub.fichierNom || 'Document joint'}
                </div>
              )}
              <input type="file" onChange={handleFileChange} style={styles.fileInput} accept=".pdf,.jpg,.jpeg,.png" />
              <p style={{ fontSize: '0.75rem', color: '#414752', marginTop: '0.25rem' }}>
                Laissez vide pour conserver le fichier actuel lors d'une modification.
              </p>
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Envoi...' : (editingPub ? 'Enregistrer les modifications' : 'Publier maintenant')}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelBtn}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {publications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px dashed #e9e8e5' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#a0a0a0', marginBottom: '1rem' }}>post_add</span>
          <p style={{ color: '#414752' }}>Vous n'avez pas encore publié de contenu.</p>
          <button onClick={() => setShowForm(true)} style={{ ...styles.createButton, margin: '1.5rem auto 0' }}>Commencer</button>
        </div>
      ) : (
        <div style={styles.bentoGrid}>
          {publications.map((pub) => (
            <div key={pub.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={styles.statusBadge(pub.statut)}>
                  {pub.statut === 'VALIDE' ? '✅ Validé' : pub.statut === 'REFUSE' ? '❌ Refusé' : '⏳ En attente'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#414752' }}>
                  {new Date(pub.datePublication).toLocaleDateString()}
                </span>
              </div>
              
              <div style={styles.publicationContent}>
                {pub.typePublication && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#004e99', marginBottom: '0.25rem' }}>
                    {pub.typePublication}
                  </div>
                )}
                {pub.titre && (
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {pub.titre}
                  </div>
                )}
                {pub.resume && (
                  <div style={{ fontSize: '0.85rem', color: '#414752', marginBottom: '0.5rem' }}>
                    {pub.resume}
                  </div>
                )}
                {pub.contenu?.length > 300 ? pub.contenu.substring(0, 300) + '...' : pub.contenu}
              </div>

              {(pub.fichierJointUrl || pub.image) && (
                <a href={pub.fichierJointUrl || pub.image} target="_blank" rel="noopener noreferrer" style={styles.fichierBadge}>
                  <span className="material-symbols-outlined">attach_file</span>
                  <span>{pub.fichierNom || 'Voir la pièce jointe'}</span>
                </a>
              )}

              <div style={styles.actionButtons}>
                <button style={styles.editBtn} onClick={() => handleEdit(pub)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '4px' }}>edit</span>
                  Modifier
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(pub.id)} disabled={processingId === pub.id}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '4px' }}>delete</span>
                  {processingId === pub.id ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EnseignantPublications;