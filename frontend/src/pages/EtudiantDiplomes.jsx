import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { etudiantDiplomeService } from '../services/api';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const EtudiantDiplomes = () => {
  const { user } = useAuth();
  const [diplomes, setDiplomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resubmitId, setResubmitId] = useState(null);

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    typeDocument: 'DIPLOME_MASTER',
    etablissement: '',
    diplomeNom: '',
    anneeObtention: '',
    numeroDiplome: '',
    document: null
  });

  const fetchDiplomes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await etudiantDiplomeService.getMesDiplomes(user.id);
      setDiplomes(response.data || []);
    } catch (err) {
      toast.error("Erreur lors du chargement de vos diplômes");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) {
      fetchDiplomes();
    }
  }, [user, fetchDiplomes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, document: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.document) {
      toast.error("Veuillez joindre le justificatif (PDF/Image)");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    
    try {
      if (resubmitId) {
        // Re-soumission d'une nouvelle version
        data.append('etudiantId', user.id);
        data.append('document', formData.document);
        await etudiantDiplomeService.resoumettreDiplome(resubmitId, data);
        toast.success("Nouvelle version soumise avec succès");
      } else {
        // Nouvelle soumission complète
        data.append('etudiantId', user.id);
        data.append('typeDocument', formData.typeDocument);
        data.append('etablissement', formData.etablissement);
        data.append('diplomeNom', formData.diplomeNom);
        data.append('anneeObtention', formData.anneeObtention);
        data.append('numeroDiplome', formData.numeroDiplome);
        data.append('document', formData.document);
        await etudiantDiplomeService.soumettreDiplome(data);
        toast.success("Diplôme soumis pour vérification");
      }
      
      resetForm();
      fetchDiplomes();
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string' 
        ? err.response?.data 
        : err.response?.data?.error || err.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      typeDocument: 'DIPLOME_MASTER',
      etablissement: '',
      diplomeNom: '',
      anneeObtention: '',
      numeroDiplome: '',
      document: null
    });
    setResubmitId(null);
  };

  const startResubmit = (diplome) => {
    setResubmitId(diplome.id);
    setFormData({
      ...formData,
      typeDocument: diplome.typeDocument,
      etablissement: diplome.etablissement,
      diplomeNom: diplome.diplomeNom,
      anneeObtention: diplome.anneeObtention,
      numeroDiplome: diplome.numeroDiplome || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce diplôme définitivement ?")) return;
    try {
      await etudiantDiplomeService.supprimerDiplome(id, user.id);
      toast.success("Diplôme supprimé avec succès");
      fetchDiplomes();
    } catch (err) {
      toast.error("Erreur lors de la suppression du diplôme");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* En-tête de page */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes Diplômes</h1>
        <p className="text-slate-500 mt-2 text-lg">Gérez et authentifiez vos titres académiques pour renforcer votre profil.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne GAUCHE (5/12) : Formulaire d'ajout */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-ambient border border-slate-100 sticky top-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <span className="material-symbols-outlined text-2xl">{resubmitId ? 'sync' : 'add_task'}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{resubmitId ? 'Nouvelle version' : 'Soumettre un diplôme'}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{resubmitId ? 'Mise à jour du document' : 'Formulaire de vérification'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Type de diplôme</label>
              <select 
                name="typeDocument"
                disabled={!!resubmitId}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold appearance-none cursor-pointer disabled:opacity-60 transition-all"
                value={formData.typeDocument}
                onChange={handleInputChange}
              >
                <option value="DIPLOME_LICENCE">Licence</option>
                <option value="DIPLOME_MASTER">Master</option>
                <option value="DIPLOME_DOCTORAT">Doctorat</option>
                <option value="CERTIFICAT_PROFESSIONNEL">Certification Professionnelle</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Intitulé exact</label>
              <input 
                type="text"
                name="diplomeNom"
                disabled={!!resubmitId}
                placeholder="Ex: Master en Intelligence Artificielle"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold disabled:opacity-60 transition-all"
                required
                value={formData.diplomeNom}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Établissement d'obtention</label>
              <input 
                type="text"
                name="etablissement"
                disabled={!!resubmitId}
                placeholder="Ex: Université Mohammed V"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold disabled:opacity-60 transition-all"
                required
                value={formData.etablissement}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Année</label>
                <input 
                  type="text"
                  name="anneeObtention"
                  disabled={!!resubmitId}
                  placeholder="Ex: 2022"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold disabled:opacity-60 transition-all"
                  required
                  value={formData.anneeObtention}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">N° Diplôme (Optionnel)</label>
                <input 
                  type="text"
                  name="numeroDiplome"
                  disabled={!!resubmitId}
                  placeholder="ID unique"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold disabled:opacity-60 transition-all"
                  value={formData.numeroDiplome}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Justificatif (PDF / Scan)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="w-full px-6 py-8 bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 rounded-2xl transition-all flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-blue-500 transition-all">cloud_upload</span>
                  <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">
                    {formData.document ? formData.document.name : "Cliquez pour uploader"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              {resubmitId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 border-2 border-slate-100 text-slate-400 rounded-2xl font-black hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
              )}
              <button 
                type="submit" 
                disabled={submitting}
                className={`flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <span className="animate-spin material-symbols-outlined">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">{resubmitId ? 'publish' : 'send'}</span>
                    {resubmitId ? 'Mettre à jour' : 'Soumettre le dossier'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Colonne DROITE (7/12) : Liste des diplômes */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de vos documents...</p>
            </div>
          ) : diplomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center px-10">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">folder_off</span>
              <h3 className="text-xl font-black text-slate-900">Aucun diplôme trouvé</h3>
              <p className="text-slate-500 mt-2">Commencez par soumettre votre diplôme le plus récent via le formulaire pour authentifier votre expertise.</p>
            </div>
          ) : (
            diplomes.map(doc => (
              <div 
                key={doc.id} 
                className={`bg-white rounded-3xl p-8 shadow-ambient border-l-8 transition-all hover:scale-[1.01] ${
                  doc.statut === 'VERIFIE' ? 'border-green-500' : 
                  doc.statut === 'REJETE' ? 'border-red-500' : 'border-amber-500'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      doc.statut === 'VERIFIE' ? 'bg-green-50 text-green-600' : 
                      doc.statut === 'REJETE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">
                        {doc.typeDocument === 'DIPLOME_DOCTORAT' ? 'school' : 'history_edu'}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{doc.diplomeNom}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          doc.statut === 'VERIFIE' ? 'bg-green-100 text-green-700' : 
                          doc.statut === 'REJETE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span className="material-symbols-outlined text-xs">
                            {doc.statut === 'VERIFIE' ? 'verified' : doc.statut === 'REJETE' ? 'cancel' : 'pending'}
                          </span>
                          {doc.statut.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 font-bold">{doc.etablissement}</p>
                      <p className="text-slate-400 text-sm font-medium mt-1">Obtenu en {doc.anneeObtention} • Soumis le {new Date(doc.dateSoumission).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-3">
                    <button 
                      onClick={() => handleSupprimer(doc.id)}
                      className="px-5 py-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Supprimer
                    </button>
                    <a 
                      href={`${BASE_URL}${doc.documentUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                      Voir
                    </a>
                  </div>
                </div>

                {/* Section Rejet / Commentaire Admin */}
                {doc.statut === 'REJETE' && (
                  <div className="mt-8 pt-8 border-t border-red-50 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-2">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Commentaire Administration</p>
                        <p className="text-sm text-red-700 italic font-medium leading-relaxed">"{doc.commentaireAdmin || "Votre document n'est pas lisible ou non conforme. Veuillez renvoyer une version claire."}"</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startResubmit(doc)}
                      className="whitespace-now8 py-3 px-6 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">sync</span>
                      Soumettre à nouveau
                    </button>
                  </div>
                )}
                
                {doc.statut === 'VERIFIE' && doc.commentaireAdmin && (
                  <div className="mt-8 pt-8 border-t border-green-50 flex gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">verified_user</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Note de validation</p>
                      <p className="text-sm text-green-800 font-medium">{doc.commentaireAdmin}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .shadow-ambient {
          box-shadow: 0px 4px 20px rgba(27, 28, 26, 0.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default EtudiantDiplomes;
