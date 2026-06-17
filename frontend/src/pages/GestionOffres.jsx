import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { offreEnseignantService } from '../services/api';

const GestionOffres = () => {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState({ active: true, archivee: false });
  const [filterTypes, setFilterTypes] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffre, setEditingOffre] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'stage',
    nbCandidatures: 0,
    statut: 'active'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch data from API
  const fetchOffres = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatut.active && !filterStatut.archivee) params.statut = 'active';
      else if (!filterStatut.active && filterStatut.archivee) params.statut = 'archivee';
      if (filterTypes.length > 0) params.types = filterTypes.join(',');

      const response = await offreEnseignantService.getMesOffres(params);
      setOffres(response.data.offres || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des offres", error);
      toast.error("Impossible de charger les offres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, [filterStatut, filterTypes]);

  // Modal Handlers
  const openModal = (offre = null) => {
    if (offre) {
      setEditingOffre(offre);
      setFormData({
        titre: offre.titre,
        description: offre.description,
        type: offre.type,
        nbCandidatures: offre.nbCandidatures,
        statut: offre.statut
      });
    } else {
      setEditingOffre(null);
      setFormData({
        titre: '',
        description: '',
        type: 'stage',
        nbCandidatures: 0,
        statut: 'active'
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffre(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = "Le titre est obligatoire";
    if (!formData.description.trim()) newErrors.description = "La description est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingOffre) {
        await offreEnseignantService.modifierOffre(editingOffre.id, formData);
        toast.success("Offre mise à jour");
      } else {
        await offreEnseignantService.creerOffre(formData);
        toast.success("Offre créée avec succès");
      }
      closeModal();
      fetchOffres();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  // Actions
  const handleSupprimer = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await offreEnseignantService.supprimerOffre(id);
        toast.success("Offre supprimée");
        fetchOffres();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleArchiver = async (id) => {
    try {
      await offreEnseignantService.archiverOffre(id);
      toast.success("Offre archivée");
      fetchOffres();
    } catch (error) {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleReactiver = async (id) => {
    try {
      await offreEnseignantService.reactiverOffre(id);
      toast.success("Offre réactivée");
      fetchOffres();
    } catch (error) {
      toast.error("Erreur lors de la réactivation");
    }
  };

  const toggleType = (type) => {
    setFilterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const countActives = offres.filter(o => o.statut === 'active').length;
  const countArchivees = offres.filter(o => o.statut === 'archivee').length;

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="w-full px-6 py-10">
        {/* Header & Action Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-headline font-black tracking-tight text-gray-900 mb-2">Gestion des Offres</h1>
            <p className="text-gray-500 max-w-md font-medium">Pilotez vos opportunités académiques et suivez les candidatures de vos étudiants en temps réel.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-black rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Publier une nouvelle offre
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-headline font-bold mb-6 flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtres
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3 block">Statut</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={filterStatut.active}
                        onChange={() => setFilterStatut({...filterStatut, active: !filterStatut.active})}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Actives ({countActives})</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={filterStatut.archivee}
                        onChange={() => setFilterStatut({...filterStatut, archivee: !filterStatut.archivee})}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">Archivées ({countArchivees})</span>
                    </label>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3 block">Type d'offre</label>
                  <div className="flex flex-wrap gap-2">
                    {['stage', 'projet', 'recherche'].map(type => (
                      <span 
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                          filterTypes.includes(type) 
                            ? 'bg-primary text-black shadow-md shadow-primary/20' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* Main List */}
          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold">Chargement des offres...</p>
              </div>
            ) : offres.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-100">
                <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">search_off</span>
                <p className="text-gray-400 font-bold text-lg">Aucune offre ne correspond à vos critères.</p>
              </div>
            ) : (
              offres.map(offre => (
                <OffreCard 
                  key={offre.id} 
                  offre={offre} 
                  onVoir={() => console.log("Voir", offre.id)}
                  onModifier={() => openModal(offre)}
                  onSupprimer={() => handleSupprimer(offre.id)}
                  onArchiver={() => handleArchiver(offre.id)}
                  onReactiver={() => handleReactiver(offre.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-xl w-full mx-auto animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    {editingOffre ? 'edit' : 'add_circle'}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-headline font-black text-gray-900 tracking-tight">
                    {editingOffre ? "Modifier l'offre" : "Nouvelle Offre"}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">Remplissez les détails de votre proposition</p>
                </div>
              </div>
              <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Titre de l'offre</label>
                <input 
                  type="text" 
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Stage Analyse de Données"
                  className={`w-full p-5 bg-white border-2 rounded-2xl outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold text-gray-900 ${
                    errors.titre ? 'border-red-500' : 'border-gray-100 focus:border-primary'
                  }`}
                />
                {errors.titre && <p className="text-red-500 text-xs font-black mt-1 ml-1">{errors.titre}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Description détaillée</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Décrivez les missions, pré-requis..."
                  className={`w-full p-5 bg-white border-2 rounded-2xl outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold text-gray-900 resize-none leading-relaxed ${
                    errors.description ? 'border-red-500' : 'border-gray-100 focus:border-primary'
                  }`}
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs font-black mt-1 ml-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Type d'offre</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-black text-gray-700"
                  >
                    <option value="stage">Stage</option>
                    <option value="projet">Projet</option>
                    <option value="recherche">Recherche</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Candidatures</label>
                  <input 
                    type="number" 
                    name="nbCandidatures"
                    value={formData.nbCandidatures}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-black text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Statut de visibilité</label>
                <div className="flex p-1.5 bg-gray-50 rounded-2xl gap-1.5">
                  {['active', 'archivee'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, statut: s})}
                      className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                        formData.statut === s 
                          ? 'bg-white text-primary shadow-sm border border-gray-100' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {s === 'active' ? 'Active' : 'Archivée'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-10">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-5 px-6 text-gray-700 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-900 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 px-6 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Publication...' : (editingOffre ? 'Mettre à jour' : 'Publier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OffreCard = ({ offre, onVoir, onModifier, onSupprimer, onArchiver, onReactiver }) => {
  const isArchive = offre.statut === 'archivee';

  return (
    <article className={`bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50 group relative overflow-hidden ${isArchive ? 'opacity-70 bg-gray-50/50 grayscale-[0.5]' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-5">
            <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl tracking-widest uppercase ${
              isArchive ? 'bg-gray-200 text-gray-500' : 
              offre.type === 'stage' ? 'bg-blue-50 text-blue-600' : 
              offre.type === 'recherche' ? 'bg-orange-50 text-orange-600' : 
              'bg-indigo-50 text-indigo-600'
            }`}>
              {offre.type}
            </span>
            <span className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {isArchive ? 'Archivée le ' : 'Publiée le '} {new Date(offre.datePublication).toLocaleDateString()}
            </span>
          </div>
          
          <h2 className={`text-2xl font-headline font-black mb-3 transition-colors tracking-tight ${isArchive ? 'text-gray-500 italic' : 'text-gray-900 group-hover:text-primary'}`}>
            {offre.titre}
          </h2>
          
          <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">{offre.description}</p>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <span className="material-symbols-outlined text-[20px]">person_off</span>
              </div>
              <span className="text-xs font-black text-gray-700">{offre.nbCandidatures} <span className="text-gray-400 font-bold ml-1">candidatures</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isArchive ? 'bg-gray-300' : 'bg-emerald-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isArchive ? 'Archivée' : 'Offre Active'}</span>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col justify-center gap-3 shrink-0">
          {!isArchive ? (
            <>
            
              <button 
                onClick={onModifier}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-50 text-black-600 hover:bg-gray-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Editer
              </button>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={onArchiver}
                  className="flex-1 p-3 text-gray-400 hover:text-black hover:bg-primary/5 rounded-xl transition-all"
                  title="Archiver"
                >
                  <span className="material-symbols-outlined text-lg">archive</span>
                </button>
                <button 
                  onClick={onSupprimer}
                  className="flex-1 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Supprimer"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed mb-2">
                <span className="material-symbols-outlined text-sm">history</span>
                Archivée
              </div>
              <button 
                onClick={onReactiver}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-primary text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">unarchive</span>
                Réactiver
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default GestionOffres;
