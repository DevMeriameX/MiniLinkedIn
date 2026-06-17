import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { etudiantEnseignantService } from '../services/api';
import { BASE_URL } from '../config';

const EnseignantPublicProfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfil = async () => {
      setLoading(true);
      try {
        const res = await etudiantEnseignantService.getProfilEnseignant(id);
        setProfil(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de charger le profil enseignant');
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, [id]);

  if (loading) return <div className="p-6">Chargement du profil...</div>;
  if (!profil) return <div className="p-6 text-red-600">{error || 'Profil introuvable'}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
        {profil.photo ? (
          <img src={`${BASE_URL}${profil.photo}`} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-sm border" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
          </div>
        )}
        <div className="flex-1 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{profil.nomComplet}</h1>
            <p className="text-sm text-gray-600">{profil.email}</p>
            <p className="text-sm text-gray-700 mt-2">{profil.depart || 'Département non précisé'} - {profil.labo || 'Laboratoire non précisé'}</p>
            <p className="text-xs text-blue-700 mt-1 font-bold">ENSEIGNANT</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-full font-bold hover:bg-gray-50 transition-colors">Retour</button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="font-bold mb-3 text-lg">À propos</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profil.bio || "L'enseignant n'a pas encore ajouté de description."}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">star</span> Compétences</h2>
          {(profil.competences || []).length === 0 && <p className="text-sm text-gray-500 italic">Aucune compétence renseignée.</p>}
          <div className="flex flex-wrap gap-2">
            {(profil.competences || []).map((c) => (
              <span key={c.id} className="px-3 py-1 bg-gray-50 border rounded-full text-xs font-semibold text-gray-700">
                {c.nom} <span className="text-blue-600 ml-1 opacity-75">{c.niveau}</span>
              </span>
            ))}
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
          <h2 className="font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">work</span> Expériences & Formations</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Expériences</h3>
            {(profil.experiences || []).length === 0 && <p className="text-sm text-gray-500 italic">Aucune expérience renseignée.</p>}
            <div className="space-y-4">
              {(profil.experiences || []).map((e) => (
                <div key={e.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <p className="font-bold text-gray-900">{e.poste}</p>
                  <p className="text-sm text-gray-600">{e.entreprise}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Formations</h3>
            {(profil.formations || []).length === 0 && <p className="text-sm text-gray-500 italic">Aucune formation renseignée.</p>}
            <div className="space-y-4">
              {(profil.formations || []).map((f) => (
                <div key={f.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <p className="font-bold text-gray-900">{f.diplome}</p>
                  <p className="text-sm text-gray-600">{f.etablissement}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnseignantPublicProfil;
