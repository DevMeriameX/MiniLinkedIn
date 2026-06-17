import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { etudiantOffreService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EtudiantOffres = () => {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTypes, setFilterTypes] = useState([]);
  const [selectedOffre, setSelectedOffre] = useState(null);

  const fetchOffres = async () => {
    setLoading(true);
    try {
      const response = await etudiantOffreService.getAll();
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
  }, []);

  const toggleType = (type) => {
    setFilterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleContactTeacher = (auteurId) => {
    navigate(`/etudiant/messages?userId=${auteurId}`);
  };

  const filteredOffres = filterTypes.length > 0 
    ? offres.filter(o => filterTypes.includes(o.type)) 
    : offres;

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="w-full max-w-none px-6 py-10 animate-in fade-in duration-500">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Offres Académiques</h1>
            <p className="text-gray-500 max-w-md font-medium">Découvrez les opportunités de stages, projets et recherche proposées par vos enseignants.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtres
              </h3>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3 block">Type d'offre</label>
                <div className="flex flex-wrap gap-2">
                  {['stage', 'projet', 'recherche'].map(type => (
                    <span 
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                        filterTypes.includes(type) 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </aside>

          {/* Main List */}
          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold">Chargement des offres...</p>
              </div>
            ) : filteredOffres.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-100">
                <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">search_off</span>
                <p className="text-gray-400 font-bold text-lg">Aucune offre disponible pour le moment.</p>
              </div>
            ) : (
              filteredOffres.map(offre => (
                <article key={offre.id} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50 group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-5">
                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl tracking-widest uppercase ${
                          offre.type === 'stage' ? 'bg-blue-50 text-blue-600' : 
                          offre.type === 'recherche' ? 'bg-orange-50 text-orange-600' : 
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {offre.type}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          Publiée le {new Date(offre.datePublication).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-black mb-1 text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {offre.titre}
                      </h2>
                      <p className="text-blue-600 text-sm font-bold mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        Par {offre.auteurNom}
                      </p>
                      
                      <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">{offre.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <button 
                           onClick={() => setSelectedOffre(offre)}
                           className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                         >
                           <span className="material-symbols-outlined text-sm">visibility</span>
                           Voir détails
                         </button>
                         <button 
                           onClick={() => handleContactTeacher(offre.auteurId)}
                           className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2"
                         >
                           <span className="material-symbols-outlined text-sm">mail</span>
                           Contacter
                         </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOffre && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedOffre(null)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-gray-400">close</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl tracking-widest uppercase ${
                selectedOffre.type === 'stage' ? 'bg-blue-50 text-blue-600' : 
                selectedOffre.type === 'recherche' ? 'bg-orange-50 text-orange-600' : 
                'bg-indigo-50 text-indigo-600'
              }`}>
                {selectedOffre.type}
              </span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{selectedOffre.titre}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-bold mb-8 pb-8 border-b border-gray-100">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> {selectedOffre.auteurNom}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(selectedOffre.datePublication).toLocaleDateString()}</span>
            </div>

            <div className="prose prose-slate max-w-none mb-10 overflow-y-auto max-h-[40vh] pr-4 custom-scrollbar">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Description de l'offre</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedOffre.description}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  handleContactTeacher(selectedOffre.auteurId);
                  setSelectedOffre(null);
                }}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">mail</span>
                Contacter l'enseignant
              </button>
              <button 
                onClick={() => setSelectedOffre(null)}
                className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default EtudiantOffres;
