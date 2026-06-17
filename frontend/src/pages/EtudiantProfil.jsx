import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { etudiantProfilService } from '../services/api';
import { BASE_URL } from '../config';

const EtudiantProfil = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [profil, setProfil] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProfilModal, setShowProfilModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Editing state
  const [editingItem, setEditingItem] = useState(null);

  const [profilForm, setProfilForm] = useState({
    nomComplet: '',
    bio: '',
    filiere: '',
    niveauEtudes: '',
    statutAcademique: 'ETUDIANT',
    photoFile: null,
    documentFile: null,
  });

  const [expForm, setExpForm] = useState({
    poste: '',
    entreprise: '',
    dateDebut: '',
    dateFin: '',
    description: '',
    actuel: false,
  });

  const [formForm, setFormForm] = useState({
    etablissement: '',
    diplome: '',
    dateDebut: '',
    dateFin: '',
  });

  const [skillForm, setSkillForm] = useState({
    nom: '',
    niveau: 'INTERMEDIAIRE',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilRes, expRes, formRes, skillRes] = await Promise.all([
        etudiantProfilService.getMonProfil(),
        etudiantProfilService.getExperiences(),
        etudiantProfilService.getFormations(),
        etudiantProfilService.getCompetences(),
      ]);

      setProfil(profilRes.data);
      setExperiences(expRes.data);
      setFormations(formRes.data);
      setCompetences(skillRes.data);

      setProfilForm({
        nomComplet: profilRes.data.nomComplet || '',
        bio: profilRes.data.bio || '',
        filiere: profilRes.data.filiere || '',
        niveauEtudes: profilRes.data.niveauEtudes || '',
        statutAcademique: profilRes.data.statutAcademique || 'ETUDIANT',
        photoFile: null,
        documentFile: null,
      });
    } catch (err) {
      toast.error("Erreur lors du chargement du profil étudiant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(profilForm).forEach((key) => {
      if (profilForm[key]) data.append(key, profilForm[key]);
    });
    try {
      const res = await etudiantProfilService.updateProfil(data);
      toast.success('Profil mis à jour');
      setShowProfilModal(false);
      fetchData();
      if (res.data) {
        updateUser({
          nomComplet: res.data.nomComplet,
          photo: res.data.photo,
          bio: res.data.bio,
        });
      }
    } catch (err) {
      toast.error('Erreur mise à jour profil');
    }
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await etudiantProfilService.updateExperience(editingItem.id, expForm);
        toast.success('Expérience mise à jour');
      } else {
        await etudiantProfilService.addExperience(expForm);
        toast.success('Expérience ajoutée');
      }
      setShowExpModal(false);
      setEditingItem(null);
      setExpForm({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '', actuel: false });
      fetchData();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await etudiantProfilService.updateFormation(editingItem.id, formForm);
        toast.success('Formation mise à jour');
      } else {
        await etudiantProfilService.addFormation(formForm);
        toast.success('Formation ajoutée');
      }
      setShowFormModal(false);
      setEditingItem(null);
      setFormForm({ etablissement: '', diplome: '', dateDebut: '', dateFin: '' });
      fetchData();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      await etudiantProfilService.addCompetence(skillForm);
      toast.success('Compétence ajoutée');
      setShowSkillModal(false);
      setSkillForm({ nom: '', niveau: 'INTERMEDIAIRE' });
      fetchData();
    } catch {
      toast.error('Erreur ajout compétence');
    }
  };

  const handleDeleteExp = async (id) => {
    if (window.confirm('Supprimer cette expérience ?')) {
      try {
        await etudiantProfilService.deleteExperience(id);
        toast.success('Expérience supprimée');
        fetchData();
      } catch {
        toast.error('Erreur suppression');
      }
    }
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm('Supprimer cette formation ?')) {
      try {
        await etudiantProfilService.deleteFormation(id);
        toast.success('Formation supprimée');
        fetchData();
      } catch {
        toast.error('Erreur suppression');
      }
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Supprimer cette compétence ?')) {
      try {
        await etudiantProfilService.deleteCompetence(id);
        toast.success('Compétence supprimée');
        fetchData();
      } catch {
        toast.error('Erreur suppression');
      }
    }
  };

  const openEditExp = (exp) => {
    setEditingItem(exp);
    setExpForm({
      poste: exp.poste,
      entreprise: exp.entreprise,
      dateDebut: exp.dateDebut ? exp.dateDebut.split('T')[0] : '',
      dateFin: exp.dateFin ? exp.dateFin.split('T')[0] : '',
      description: exp.description || '',
      actuel: exp.actuel || false
    });
    setShowExpModal(true);
  };

  const openEditForm = (form) => {
    setEditingItem(form);
    setFormForm({
      etablissement: form.etablissement,
      diplome: form.diplome,
      dateDebut: form.dateDebut ? form.dateDebut.split('T')[0] : '',
      dateFin: form.dateFin ? form.dateFin.split('T')[0] : ''
    });
    setShowFormModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await etudiantProfilService.updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Mot de passe mis à jour');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data || 'Erreur mot de passe');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-blue-600 font-bold">Chargement du profil...</div>;

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche : Infos Clés */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div className="px-6 pb-6 text-center">
              <div className="relative inline-block -mt-12 mb-4">
                {profil?.photo ? (
                  <img 
                    src={profil.photo.startsWith('http') ? profil.photo : `${BASE_URL}${profil.photo}`} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" 
                    alt="Profile" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profil.nomComplet); }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-400">person</span>
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{profil?.nomComplet}</h1>
              <p className="text-gray-600 text-sm mb-4">Étudiant</p>
              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">school</span>
                  {profil?.filiere || 'Filière'}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">history_edu</span>
                  {profil?.niveauEtudes || 'Niveau d\'études'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setShowProfilModal(true)} className="w-full py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all">
                  Modifier les infos clés
                </button>
                <button onClick={() => setShowPasswordModal(true)} className="w-full py-2 border border-gray-200 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-all text-sm">
                  Sécurité du compte
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Aperçu de l'activité</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Publications</span>
                <span className="font-bold text-blue-600">{profil?.nbPublications || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Connexions</span>
                <span className="font-bold text-blue-600">{profil?.nbConnexions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diplômes vérifiés</span>
                <span className="font-bold text-blue-600">{profil?.nbDiplomes || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Sections LinkedIn */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* À Propos */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">À propos</h2>
              <button onClick={() => setShowProfilModal(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-600">edit</span>
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profil?.bio || "Ajoutez un résumé de votre parcours académique."}
            </p>
          </section>

          {/* Expériences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Expériences</h2>
              <button onClick={() => { setEditingItem(null); setExpForm({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '', actuel: false }); setShowExpModal(true); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="space-y-6">
              {experiences.length > 0 ? experiences.map(exp => (
                <div key={exp.id} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-400">business</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{exp.poste}</h4>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditExp(exp)} className="p-1 text-gray-400 hover:text-blue-600"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDeleteExp(exp.id)} className="p-1 text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{exp.entreprise}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {exp.dateDebut ? new Date(exp.dateDebut).toLocaleDateString() : 'N/A'} - {exp.actuel ? "Aujourd'hui" : (exp.dateFin ? new Date(exp.dateFin).toLocaleDateString() : 'N/A')}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune expérience ajoutée.</p>}
            </div>
          </section>

          {/* Formations */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Formations</h2>
              <button onClick={() => { setEditingItem(null); setFormForm({ etablissement: '', diplome: '', dateDebut: '', dateFin: '' }); setShowFormModal(true); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="space-y-6">
              {formations.length > 0 ? formations.map(f => (
                <div key={f.id} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-400">school</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{f.etablissement}</h4>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditForm(f)} className="p-1 text-gray-400 hover:text-blue-600"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDeleteForm(f.id)} className="p-1 text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{f.diplome}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {f.dateDebut ? new Date(f.dateDebut).toLocaleDateString() : 'N/A'} - {f.dateFin ? new Date(f.dateFin).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune formation ajoutée.</p>}
            </div>
          </section>

          {/* Compétences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Compétences</h2>
              <button onClick={() => setShowSkillModal(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {competences.length > 0 ? competences.map(s => (
                <div key={s.id} className="group relative px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {s.nom}
                  <span className="text-[10px] text-blue-600 uppercase font-bold">{s.niveau}</span>
                  <button onClick={() => handleDeleteSkill(s.id)} className="ml-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune compétence ajoutée.</p>}
            </div>
          </section>

        </div>
      </div>

      {/* MODALS */}
      {showProfilModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">Modifier le profil</h3>
            <form onSubmit={handleUpdateProfil} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nom complet</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={profilForm.nomComplet} onChange={(e) => setProfilForm({ ...profilForm, nomComplet: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Filière</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={profilForm.filiere} onChange={(e) => setProfilForm({ ...profilForm, filiere: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Niveau d'études</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={profilForm.niveauEtudes} onChange={(e) => setProfilForm({ ...profilForm, niveauEtudes: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bio</label>
                <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24" value={profilForm.bio} onChange={(e) => setProfilForm({ ...profilForm, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Photo (Max 2MB)</label>
                  <input type="file" className="text-xs" onChange={(e) => setProfilForm({ ...profilForm, photoFile: e.target.files[0] })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">CV (PDF)</label>
                  <input type="file" className="text-xs" onChange={(e) => setProfilForm({ ...profilForm, documentFile: e.target.files[0] })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowProfilModal(false)} className="px-6 py-2.5 font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">{editingItem ? 'Modifier l\'expérience' : 'Ajouter une expérience'}</h3>
            <form onSubmit={handleExpSubmit} className="space-y-4">
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required placeholder="Poste" value={expForm.poste} onChange={(e) => setExpForm({ ...expForm, poste: e.target.value })} />
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required placeholder="Organisation" value={expForm.entreprise} onChange={(e) => setExpForm({ ...expForm, entreprise: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Début</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={expForm.dateDebut} onChange={(e) => setExpForm({ ...expForm, dateDebut: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Fin</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" disabled={expForm.actuel} value={expForm.dateFin} onChange={(e) => setExpForm({ ...expForm, dateFin: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={expForm.actuel} onChange={(e) => setExpForm({ ...expForm, actuel: e.target.checked })} /> Poste actuel</label>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24" placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowExpModal(false); setEditingItem(null); }} className="px-6 py-2.5 font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl">{editingItem ? 'Mettre à jour' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">{editingItem ? 'Modifier la formation' : 'Ajouter une formation'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required placeholder="Etablissement" value={formForm.etablissement} onChange={(e) => setFormForm({ ...formForm, etablissement: e.target.value })} />
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required placeholder="Diplôme" value={formForm.diplome} onChange={(e) => setFormForm({ ...formForm, diplome: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Début</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={formForm.dateDebut} onChange={(e) => setFormForm({ ...formForm, dateDebut: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Fin</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={formForm.dateFin} onChange={(e) => setFormForm({ ...formForm, dateFin: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowFormModal(false); setEditingItem(null); }} className="px-6 py-2.5 font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl">{editingItem ? 'Mettre à jour' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSkillModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">Ajouter une compétence</h3>
            <form onSubmit={handleSkillSubmit} className="space-y-4">
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required placeholder="Compétence" value={skillForm.nom} onChange={(e) => setSkillForm({ ...skillForm, nom: e.target.value })} />
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={skillForm.niveau} onChange={(e) => setSkillForm({ ...skillForm, niveau: e.target.value })}>
                <option value="DEBUTANT">DEBUTANT</option>
                <option value="INTERMEDIAIRE">INTERMEDIAIRE</option>
                <option value="AVANCE">AVANCE</option>
                <option value="EXPERT">EXPERT</option>
              </select>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowSkillModal(false)} className="px-6 py-2.5 font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">Sécurité du compte</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ancien mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Confirmer</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-6 py-2.5 font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantProfil;