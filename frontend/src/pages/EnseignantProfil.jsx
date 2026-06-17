import React, { useState, useEffect } from 'react';
import { profilService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const EnseignantProfil = () => {
  const { user, updateUser } = useAuth();
  const [profil, setProfil] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showExpModal, setShowExpModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showProfilModal, setShowProfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Editing states
  const [editingExpId, setEditingExpId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState(null);

  // Form states
  const [expForm, setExpForm] = useState({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '', actuel: false });
  const [formForm, setFormForm] = useState({ etablissement: '', diplome: '', dateDebut: '', dateFin: '' });
  const [skillForm, setSkillForm] = useState({ nom: '', niveau: 'INTERMEDIAIRE' });
  const [profilForm, setProfilForm] = useState({ nomComplet: '', bio: '', labo: '', depart: '', photoFile: null, documentFile: null });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilRes, expRes, formRes, skillRes] = await Promise.all([
        profilService.getMonProfil(),
        profilService.getExperiences(),
        profilService.getFormations(),
        profilService.getCompetences()
      ]);
      setProfil(profilRes.data);
      setExperiences(expRes.data);
      setFormations(formRes.data);
      setCompetences(skillRes.data);

      if (profilRes.data) {
        updateUser({
          nomComplet: profilRes.data.nomComplet,
          photo: profilRes.data.photo,
          email: profilRes.data.email,
        });
      }

      setProfilForm({
        nomComplet: profilRes.data.nomComplet || '',
        bio: profilRes.data.bio || '',
        labo: profilRes.data.labo || '',
        depart: profilRes.data.depart || '',
        photoFile: null,
        documentFile: null
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddExp = () => {
    setEditingExpId(null);
    setExpForm({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '', actuel: false });
    setShowExpModal(true);
  };

  const handleOpenEditExp = (exp) => {
    setEditingExpId(exp.id);
    setExpForm({
      poste: exp.poste || '',
      entreprise: exp.entreprise || '',
      dateDebut: exp.dateDebut ? exp.dateDebut.substring(0, 10) : '',
      dateFin: exp.dateFin ? exp.dateFin.substring(0, 10) : '',
      description: exp.description || '',
      actuel: exp.actuel || false
    });
    setShowExpModal(true);
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    try {
      if (editingExpId) {
        await profilService.updateExperience(editingExpId, expForm);
        toast.success("Expérience modifiée");
      } else {
        await profilService.addExperience(expForm);
        toast.success("Expérience ajoutée");
      }
      setShowExpModal(false);
      setEditingExpId(null);
      fetchData();
    } catch (err) { toast.error("Erreur"); }
  };

  const handleDeleteExp = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette expérience ?")) {
      try {
        await profilService.deleteExperience(id);
        toast.success("Expérience supprimée");
        fetchData();
      } catch (err) { toast.error("Erreur lors de la suppression"); }
    }
  };

  const handleOpenAddForm = () => {
    setEditingFormId(null);
    setFormForm({ etablissement: '', diplome: '', dateDebut: '', dateFin: '' });
    setShowFormModal(true);
  };

  const handleOpenEditForm = (f) => {
    setEditingFormId(f.id);
    setFormForm({
      etablissement: f.etablissement || '',
      diplome: f.diplome || '',
      dateDebut: f.dateDebut ? f.dateDebut.substring(0, 10) : '',
      dateFin: f.dateFin ? f.dateFin.substring(0, 10) : ''
    });
    setShowFormModal(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      if (editingFormId) {
        await profilService.updateFormation(editingFormId, formForm);
        toast.success("Formation modifiée");
      } else {
        await profilService.addFormation(formForm);
        toast.success("Formation ajoutée");
      }
      setShowFormModal(false);
      setEditingFormId(null);
      fetchData();
    } catch (err) { toast.error("Erreur"); }
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      try {
        await profilService.deleteFormation(id);
        toast.success("Formation supprimée");
        fetchData();
      } catch (err) { toast.error("Erreur lors de la suppression"); }
    }
  };

  const handleOpenAddSkill = () => {
    setEditingSkillId(null);
    setSkillForm({ nom: '', niveau: 'INTERMEDIAIRE' });
    setShowSkillModal(true);
  };

  const handleOpenEditSkill = (skill) => {
    setEditingSkillId(skill.id);
    setSkillForm({ nom: skill.nom || '', niveau: skill.niveau || 'INTERMEDIAIRE' });
    setShowSkillModal(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      if (editingSkillId) {
        await profilService.updateCompetence(editingSkillId, skillForm);
        toast.success("Compétence modifiée");
      } else {
        await profilService.addCompetence(skillForm);
        toast.success("Compétence ajoutée");
      }
      setShowSkillModal(false);
      setEditingSkillId(null);
      setSkillForm({ nom: '', niveau: 'INTERMEDIAIRE' });
      fetchData();
    } catch (err) { toast.error("Erreur"); }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette compétence ?")) {
      try {
        await profilService.deleteCompetence(id);
        toast.success("Compétence supprimée");
        fetchData();
      } catch (err) { toast.error("Erreur lors de la suppression"); }
    }
  };

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(profilForm).forEach(key => {
      if (profilForm[key]) data.append(key, profilForm[key]);
    });
    try {
      const res = await profilService.updateProfil(data);
      toast.success("Profil mis à jour");
      setShowProfilModal(false);
      fetchData();
      if (res.data) {
        updateUser({
          nomComplet: res.data.nomComplet,
          photo: res.data.photo,
        });
      }
    } catch (err) { toast.error("Erreur"); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await profilService.updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Mot de passe mis à jour');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data || 'Erreur lors du changement de mot de passe');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne Gauche : Infos Clés */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div className="px-6 pb-6 text-center">
              <div className="relative inline-block -mt-12 mb-4">
                {profil.photo ? (
                  <img src={`${BASE_URL}${profil.photo}`} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" alt="Profile" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-400">person</span>
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{profil.nomComplet}</h1>
              <p className="text-gray-600 text-sm mb-4">{profil.role}</p>
              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {profil.depart || 'Département'}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">science</span>
                  {profil.labo || 'Laboratoire'}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={() => setShowProfilModal(true)} className="w-full py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all">
                  Modifier les infos clés
                </button>
                <button onClick={() => setShowPasswordModal(true)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Sécurité
                </button>
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
              {profil.bio || "Ajoutez un résumé de votre parcours et de vos recherches."}
            </p>
          </section>

          {/* Expériences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Expériences</h2>
              <button onClick={handleOpenAddExp} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="space-y-6">
              {experiences.length > 0 ? experiences.map(exp => (
                <div key={exp.id} className="flex gap-4 justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-400">business</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{exp.poste}</h4>
                      <p className="text-gray-700 text-sm">{exp.entreprise}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(exp.dateDebut).toLocaleDateString()} - {exp.actuel ? "Aujourd'hui" : new Date(exp.dateFin).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleOpenEditExp(exp)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 transition-colors" title="Modifier">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDeleteExp(exp.id)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune expérience ajoutée.</p>}
            </div>
          </section>

          {/* Formations */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Formations</h2>
              <button onClick={handleOpenAddForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="space-y-6">
              {formations.length > 0 ? formations.map(f => (
                <div key={f.id} className="flex gap-4 justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-400">school</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{f.etablissement}</h4>
                      <p className="text-gray-700 text-sm">{f.diplome}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(f.dateDebut).toLocaleDateString()} - {new Date(f.dateFin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleOpenEditForm(f)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 transition-colors" title="Modifier">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDeleteForm(f.id)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune formation ajoutée.</p>}
            </div>
          </section>

          {/* Compétences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Compétences</h2>
              <button onClick={handleOpenAddSkill} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600 font-bold">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {competences.length > 0 ? competences.map(s => (
                <div key={s.id} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {s.nom}
                  <span className="text-[10px] text-blue-600 uppercase font-bold">{s.niveau}</span>
                  <button onClick={() => handleOpenEditSkill(s)} className="text-gray-400 hover:text-blue-600 transition-colors flex items-center" title="Modifier">
                    <span className="material-symbols-outlined text-sm font-bold">edit</span>
                  </button>
                  <button onClick={() => handleDeleteSkill(s.id)} className="text-gray-400 hover:text-red-600 transition-colors flex items-center" title="Supprimer">
                    <span className="material-symbols-outlined text-sm font-bold">close</span>
                  </button>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune compétence ajoutée.</p>}
            </div>
          </section>

        </div>
      </div>

      {/* MODAL : INFOS CLES */}
      {showProfilModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Modifier le profil</h2>
            <form onSubmit={handleUpdateProfil} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nom complet</label>
                  <input className="w-full p-2 border rounded-lg" value={profilForm.nomComplet} onChange={e => setProfilForm({ ...profilForm, nomComplet: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Résumé (Bio)</label>
                  <textarea className="w-full p-2 border rounded-lg h-32" value={profilForm.bio} onChange={e => setProfilForm({ ...profilForm, bio: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Laboratoire</label>
                  <input className="w-full p-2 border rounded-lg" value={profilForm.labo} onChange={e => setProfilForm({ ...profilForm, labo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Département</label>
                  <input className="w-full p-2 border rounded-lg" value={profilForm.depart} onChange={e => setProfilForm({ ...profilForm, depart: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Photo (Image)</label>
                  <input type="file" className="text-xs" onChange={e => setProfilForm({ ...profilForm, photoFile: e.target.files[0] })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">CV (PDF)</label>
                  <input type="file" className="text-xs" onChange={e => setProfilForm({ ...profilForm, documentFile: e.target.files[0] })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowProfilModal(false)} className="px-6 py-2 border rounded-full font-bold">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : EXPERIENCE */}
      {showExpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingExpId ? "Modifier l'expérience" : "Ajouter une expérience"}</h2>
            <form onSubmit={handleSaveExp} className="space-y-4">
              <input className="w-full p-2 border rounded-lg" placeholder="Poste (ex: Professeur)" required value={expForm.poste} onChange={e => setExpForm({ ...expForm, poste: e.target.value })} />
              <input className="w-full p-2 border rounded-lg" placeholder="Entreprise / Université" required value={expForm.entreprise} onChange={e => setExpForm({ ...expForm, entreprise: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold">Début</label><input type="date" className="w-full p-2 border rounded-lg" required value={expForm.dateDebut} onChange={e => setExpForm({ ...expForm, dateDebut: e.target.value })} /></div>
                <div><label className="text-xs font-bold">Fin</label><input type="date" className="w-full p-2 border rounded-lg" disabled={expForm.actuel} value={expForm.dateFin} onChange={e => setExpForm({ ...expForm, dateFin: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={expForm.actuel} onChange={e => setExpForm({ ...expForm, actuel: e.target.checked })} /> Poste actuel</label>
              <textarea className="w-full p-2 border rounded-lg h-24" placeholder="Missions..." value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowExpModal(false); setEditingExpId(null); }} className="px-4 py-2 border rounded-full">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">{editingExpId ? "Sauvegarder" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : FORMATION */}
      {showFormModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingFormId ? "Modifier la formation" : "Ajouter une formation"}</h2>
            <form onSubmit={handleSaveForm} className="space-y-4">
              <input className="w-full p-2 border rounded-lg" placeholder="Établissement" required value={formForm.etablissement} onChange={e => setFormForm({ ...formForm, etablissement: e.target.value })} />
              <input className="w-full p-2 border rounded-lg" placeholder="Diplôme" required value={formForm.diplome} onChange={e => setFormForm({ ...formForm, diplome: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold">Début</label><input type="date" className="w-full p-2 border rounded-lg" required value={formForm.dateDebut} onChange={e => setFormForm({ ...formForm, dateDebut: e.target.value })} /></div>
                <div><label className="text-xs font-bold">Fin</label><input type="date" className="w-full p-2 border rounded-lg" required value={formForm.dateFin} onChange={e => setFormForm({ ...formForm, dateFin: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowFormModal(false); setEditingFormId(null); }} className="px-4 py-2 border rounded-full">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">{editingFormId ? "Sauvegarder" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : COMPETENCE */}
      {showSkillModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingSkillId ? "Modifier la compétence" : "Ajouter une compétence"}</h2>
            <form onSubmit={handleSaveSkill} className="space-y-4">
              <input className="w-full p-2 border rounded-lg" placeholder="Compétence (ex: Java, React...)" required value={skillForm.nom} onChange={e => setSkillForm({ ...skillForm, nom: e.target.value })} />
              <select className="w-full p-2 border rounded-lg" value={skillForm.niveau} onChange={e => setSkillForm({ ...skillForm, niveau: e.target.value })}>
                <option value="DEBUTANT">Débutant</option>
                <option value="INTERMEDIAIRE">Intermédiaire</option>
                <option value="AVANCE">Avancé</option>
                <option value="EXPERT">Expert</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowSkillModal(false); setEditingSkillId(null); }} className="px-4 py-2 border rounded-full">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">{editingSkillId ? "Sauvegarder" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : SECURITE */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800">Sécurité du compte</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ancien mot de passe</label>
                <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nouveau mot de passe</label>
                <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Confirmer le nouveau mot de passe</label>
                <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Annuler</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnseignantProfil;
