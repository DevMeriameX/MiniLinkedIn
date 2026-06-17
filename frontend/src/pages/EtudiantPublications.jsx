import React, { useEffect, useState } from 'react';
import { etudiantPublicationService, connexionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const EtudiantPublications = () => {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    titre: '',
    resume: '',
    contenu: '',
    typePublication: 'PROJET',
    coAuthorId: '',
    fichier: null
  });

  // Co-author Search State
  const [chercheurs, setChercheurs] = useState([]);
  const [searchChercheur, setSearchChercheur] = useState('');

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const res = await etudiantPublicationService.getMesPublications();
      setPublications(res.data.publications || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors du chargement de vos publications';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchPublications();
  }, [user]);

  // Search for teachers when typing in co-author field
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchChercheur.length < 2) {
        setChercheurs([]);
        return;
      }
      try {
        const res = await connexionService.rechercherUtilisateurs(searchChercheur, { role: 'ENSEIGNANT' });
        setChercheurs((res.data || []).filter(u => u.role !== 'ADMIN'));
      } catch (err) {
        console.error('Erreur recherche chercheurs', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchChercheur]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Student + Scientific Article must have a Researcher co-author
    if (formData.typePublication === 'ARTICLE_RECHERCHE' && !formData.coAuthorId) {
      toast.error('Un article de recherche doit être co-écrit avec un chercheur/enseignant.');
      return;
    }

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('resume', formData.resume);
    data.append('contenu', formData.contenu);
    data.append('typePublication', formData.typePublication);
    if (formData.coAuthorId) data.append('coAuthorId', formData.coAuthorId);
    if (formData.fichier) data.append('fichierJoint', formData.fichier);

    try {
      if (editingPub) {
        await etudiantPublicationService.modifierPublication(editingPub.id, data);
        toast.success('Publication modifiée !');
      } else {
        await etudiantPublicationService.creerPublication(data);
        toast.success('Publication créée ! En attente de validation.');
      }
      setShowModal(false);
      resetForm();
      fetchPublications();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la publication');
    }
  };

  const resetForm = () => {
    setFormData({ titre: '', resume: '', contenu: '', typePublication: 'PROJET', coAuthorId: '', fichier: null });
    setEditingPub(null);
    setSearchChercheur('');
  };

  const handleEdit = (pub) => {
    setEditingPub(pub);
    setFormData({
      titre: pub.titre,
      resume: pub.resume,
      contenu: pub.contenu,
      typePublication: pub.typePublication,
      coAuthorId: pub.coAuthorId || '',
      fichier: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await etudiantPublicationService.supprimerPublication(id);
      toast.success('Publication supprimée');
      fetchPublications();
    } catch (err) {
      toast.error('Erreur suppression');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Publications</h1>
          <p className="text-slate-500">Gérez vos projets académiques et articles de recherche.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Nouvelle Publication
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">article</span>
              <p className="text-slate-500 font-medium">Vous n'avez pas encore de publications.</p>
            </div>
          ) : (
            publications.map(pub => (
              <div key={pub.id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {pub.statut === 'EN_ATTENTE' && (
                    <button onClick={() => handleEdit(pub)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  )}
                  <button onClick={() => handleDelete(pub.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    pub.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 
                    pub.statut === 'REFUSE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {pub.statut}
                  </span>
                  
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center bg-slate-50">
                    {pub.auteurPhoto ? (
                      <img 
                        src={pub.auteurPhoto.startsWith('http') ? pub.auteurPhoto : `${BASE_URL}${pub.auteurPhoto}`} 
                        className="w-full h-full object-cover" 
                        alt="Author"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nomComplet); }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-lg">person</span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{pub.titre}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-3">{pub.resume}</p>
                
                {pub.statut === 'REFUSE' && pub.motifRefus && (
                  <div className="bg-red-50 p-3 rounded-xl mb-4 border border-red-100">
                    <p className="text-[10px] text-red-600 font-black uppercase mb-1">Motif du comité :</p>
                    <p className="text-xs text-red-700 italic">{pub.motifRefus}</p>
                  </div>
                )}
                
                {pub.fichierUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    {(pub.fichierType === 'PNG' || pub.fichierType === 'JPEG' || pub.fichierType === 'JPG' || pub.fichierType === 'GIF') ? (
                      <img 
                        src={`${BASE_URL}${pub.fichierUrl}`} 
                        alt="Publication" 
                        className="w-full h-auto max-h-[300px] object-cover rounded-xl border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="material-symbols-outlined text-blue-600">description</span>
                        <span className="text-sm font-bold truncate flex-1">{pub.fichierNom || 'Document'}</span>
                        <a href={`${BASE_URL}${pub.fichierUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold">Voir</a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                  <span className="material-symbols-outlined text-slate-400 text-sm">category</span>
                  <span className="text-xs font-bold text-slate-600">{pub.typePublication}</span>
                </div>
                
                {pub.coAuthorNom && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">group</span>
                    <span className="text-xs text-slate-500 italic">Co-écrit avec {pub.coAuthorNom}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Creation/Edition */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {editingPub ? 'Modifier la publication' : 'Créer une publication'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Type de publication</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    value={formData.typePublication}
                    onChange={(e) => setFormData({ ...formData, typePublication: e.target.value })}
                  >
                    <option value="PROJET">Projet Académique</option>
                    <option value="ARTICLE_RECHERCHE">Article de Recherche</option>
                    <option value="COURS">Ressource de Cours</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Titre</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                    placeholder="Ex: Analyse des algorithmes génétiques"
                    required
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Résumé court</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all h-20 font-medium"
                  placeholder="Une brève description..."
                  required
                  value={formData.resume}
                  onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Contenu détaillé</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all h-40 font-medium"
                  placeholder="Expliquez votre projet ou article..."
                  required
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                />
              </div>

              {formData.typePublication === 'ARTICLE_RECHERCHE' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Co-auteur (Chercheur/Enseignant obligatoire)</label>
                  <div className="relative">
                    <input 
                      className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                      placeholder="Rechercher un enseignant..."
                      value={searchChercheur}
                      onChange={(e) => setSearchChercheur(e.target.value)}
                    />
                    {chercheurs.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-40 overflow-y-auto">
                        {chercheurs.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setFormData({ ...formData, coAuthorId: c.id });
                              setSearchChercheur(c.nomComplet);
                              setChercheurs([]);
                            }}
                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold text-sm">{c.nomComplet}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase">Chercheur</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.coAuthorId && (
                    <p className="text-xs text-green-600 font-bold mt-1">✓ Co-auteur sélectionné</p>
                  )}
                </div>
              )}

              {editingPub ? (
                editingPub.statut === 'EN_ATTENTE' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Modifier le fichier (PDF ou Image) - facultatif</label>
                    <input 
                      type="file"
                      className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all"
                      onChange={(e) => setFormData({ ...formData, fichier: e.target.files[0] })}
                    />
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fichier joint (PDF ou Image)</label>
                  <input 
                    type="file"
                    className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all"
                    onChange={(e) => setFormData({ ...formData, fichier: e.target.files[0] })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  {editingPub ? 'Enregistrer les modifications' : 'Publier maintenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantPublications;
