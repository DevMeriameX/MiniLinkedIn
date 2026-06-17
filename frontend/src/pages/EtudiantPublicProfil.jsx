import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enseignantEtudiantService, etudiantEnseignantService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';

const EtudiantPublicProfil = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfil = async () => {
      setLoading(true);
      try {
        let res;
        if (user?.role === 'ENSEIGNANT') {
          res = await enseignantEtudiantService.getProfilEtudiant(id);
        } else {
          res = await etudiantEnseignantService.getProfilEtudiant(id);
        }
        setProfil(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de charger le profil étudiant');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfil();
  }, [id, user]);

  const handleRecommend = async () => {
    try {
      const res = await enseignantEtudiantService.recommanderEtudiant(id);
      setSuccess(res.data?.message || 'Étudiant recommandé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la recommandation');
      setTimeout(() => setError(''), 3000);
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

  if (!profil) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 inline-block">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <p className="font-bold">{error || 'Profil introuvable'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full font-bold">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors mb-2">
        <span className="material-symbols-outlined">arrow_back</span> Retour au réseau
      </button>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-bold">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne Gauche : Infos Clés */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div className="px-6 pb-6 text-center">
              <div className="relative inline-block -mt-12 mb-4">
                {profil.photo ? (
                  <img src={`${BASE_URL}${profil.photo}`} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" alt="Profile" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-400">person</span>
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{profil.nomComplet}</h1>
              <p className="text-blue-600 font-semibold text-sm mb-4">Étudiant</p>
              
              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6 bg-slate-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">mail</span>
                  <span className="truncate" title={profil.email}>{profil.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">school</span>
                  <span>{profil.filiere || 'Filière non précisée'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">stairs</span>
                  <span>{profil.niveauEtudes || 'Niveau non précisé'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">info</span>
                  <span>Statut: {profil.statutAcademique || 'Actif'}</span>
                </div>
              </div>

              {profil.isConnected && !profil.hasRecommended && (
                <button 
                  onClick={handleRecommend} 
                  className="w-full py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  Recommander cet étudiant
                </button>
              )}
              {profil.hasRecommended && (
                <div className="w-full py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-bold flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Déjà recommandé
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Sections Détaillées */}
        <div className="lg:col-span-2 space-y-6">

          {/* À Propos */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-blue-600">person_book</span>
              <h2 className="text-xl font-bold text-gray-900">À propos</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profil.bio || "Cet utilisateur n'a pas encore ajouté de description à son profil."}
            </p>
          </section>

          {/* Compétences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              <h2 className="text-xl font-bold text-gray-900">Compétences</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profil.competences && profil.competences.length > 0 ? profil.competences.map(s => (
                <div key={s.id} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {s.nom}
                  <span className="text-[10px] text-blue-600 uppercase font-bold bg-blue-50 px-2 py-0.5 rounded-full">{s.niveau}</span>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune compétence renseignée.</p>}
            </div>
          </section>

          {/* Expériences */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-600">work</span>
              <h2 className="text-xl font-bold text-gray-900">Expériences professionnelles</h2>
            </div>
            <div className="space-y-6">
              {profil.experiences && profil.experiences.length > 0 ? profil.experiences.map(exp => (
                <div key={exp.id} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <span className="material-symbols-outlined">business</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{exp.poste}</h4>
                    <p className="text-gray-700 font-medium">{exp.entreprise}</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {new Date(exp.dateDebut).toLocaleDateString()} - {exp.actuel ? "Aujourd'hui" : (exp.dateFin ? new Date(exp.dateFin).toLocaleDateString() : '')}
                    </p>
                    {exp.description && <p className="text-gray-600 text-sm mt-3 bg-slate-50 p-3 rounded-lg">{exp.description}</p>}
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune expérience renseignée.</p>}
            </div>
          </section>

          {/* Formations */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-600">school</span>
              <h2 className="text-xl font-bold text-gray-900">Formations</h2>
            </div>
            <div className="space-y-6">
              {profil.formations && profil.formations.length > 0 ? profil.formations.map(f => (
                <div key={f.id} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <span className="material-symbols-outlined">history_edu</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{f.etablissement}</h4>
                    <p className="text-gray-700 font-medium">{f.diplome}</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {new Date(f.dateDebut).toLocaleDateString()} - {f.dateFin ? new Date(f.dateFin).toLocaleDateString() : 'Présent'}
                    </p>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm italic">Aucune formation renseignée.</p>}
            </div>
          </section>

          {/* Publications */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-600">article</span>
              <h2 className="text-xl font-bold text-gray-900">Publications</h2>
            </div>
            <div className="space-y-4">
              {profil.publications && profil.publications.length > 0 ? profil.publications.map(pub => (
                <div key={pub.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{pub.titre}</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                      {pub.typePublication || 'Publication'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {new Date(pub.datePublication).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 text-sm">{pub.resume}</p>
                  {pub.fichierUrl && (
                    <a 
                      href={`${BASE_URL}${pub.fichierUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span className="material-symbols-outlined text-[18px]">attachment</span>
                      Voir la pièce jointe
                    </a>
                  )}
                </div>
              )) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">description</span>
                  <p className="text-gray-500 text-sm font-medium">Aucune publication</p>
                </div>
              )}
            </div>
          </section>

          {/* Recommandations */}
          {profil.recommandations && profil.recommandations.length > 0 && (
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-amber-500">star</span>
              <h2 className="text-xl font-bold text-gray-900">Recommandations</h2>
            </div>
            <div className="space-y-4">
              {profil.recommandations.map(rec => (
                <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-4 items-start hover:bg-white transition-colors hover:shadow-sm">
                  {rec.enseignantPhoto ? (
                    <img src={`${BASE_URL}${rec.enseignantPhoto}`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover bg-white shrink-0" alt="Prof" />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {rec.enseignantNom?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{rec.enseignantNom}</h4>
                    <p className="text-sm text-gray-600 font-medium">{rec.enseignantDepart || 'Département non précisé'} • {rec.enseignantLabo || 'Laboratoire non précisé'}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      Recommandé le {new Date(rec.dateRecommandation).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default EtudiantPublicProfil;
