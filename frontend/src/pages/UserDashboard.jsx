import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { diplomeService, etudiantPublicationService, socialService, connexionService } from '../services/api';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [publicationFormData, setPublicationFormData] = useState({
    titre: '',
    resume: '',
    contenu: '',
    typePublication: 'PROJET',
    coAuthorId: '',
    fichier: null,
  });
  const [enseignants, setEnseignants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [socialFeed, setSocialFeed] = useState([]);
  const [commentDraft, setCommentDraft] = useState({});
  const [commentsByPub, setCommentsByPub] = useState({});
  const [showComments, setShowComments] = useState({});
  const [recommendedStudents, setRecommendedStudents] = useState([]);

  useEffect(() => {
    fetchSocialFeed();
    fetchSuggestions();
    if (user?.role === 'ETUDIANT') {
      fetchEnseignants();
    }
    fetchMyStats();
  }, [user]);

  const fetchMyStats = async () => {
    try {
      const res = await etudiantPublicationService.getMesPublications();
      setPublications(res.data.publications || []);
    } catch (err) {
      console.error('Erreur stats', err);
    } finally {
      setLoadingPubs(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await connexionService.getSuggestions(5);
      setRecommendedStudents((response.data || []).filter(u => u.role !== 'ADMIN'));
    } catch (error) {
      console.error('Erreur suggestions', error);
    }
  };

  const fetchSocialFeed = async () => {
    try {
      const response = await socialService.getPublications();
      setSocialFeed(response.data?.publications || []);
    } catch (error) {
      console.error('Erreur fil social', error);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await connexionService.rechercherUtilisateurs('', { role: 'ENSEIGNANT' });
      setEnseignants((response.data || []).filter(u => u.role !== 'ADMIN'));
    } catch (error) {
      console.error('Erreur enseignants', error);
    }
  };

  const handleReact = async (publicationId) => {
    try {
      await socialService.reactToPublication(publicationId, 'LIKE');
      fetchSocialFeed();
    } catch (error) {
      toast.error('Erreur lors de la réaction');
    }
  };

  const handleComment = async (publicationId) => {
    const contenu = (commentDraft[publicationId] || '').trim();
    if (!contenu) return;
    try {
      await socialService.addCommentaire(publicationId, contenu);
      setCommentDraft((prev) => ({ ...prev, [publicationId]: '' }));
      // Refresh comments for this pub
      fetchComments(publicationId);
      // Refresh the feed to update comment count
      fetchSocialFeed();
      toast.success('Commentaire ajouté');
    } catch (error) {
      toast.error('Erreur lors du commentaire');
    }
  };

  const fetchComments = async (publicationId) => {
    try {
      const response = await socialService.getCommentaires(publicationId);
      setCommentsByPub(prev => ({ ...prev, [publicationId]: response.data.commentaires || [] }));
    } catch (error) {
      console.error('Erreur chargement commentaires', error);
    }
  };

  const toggleComments = (publicationId) => {
    if (!showComments[publicationId]) {
      fetchComments(publicationId);
    }
    setShowComments(prev => ({ ...prev, [publicationId]: !prev[publicationId] }));
  };

  const handleReport = async (publicationId) => {
    const raison = window.prompt("Veuillez indiquer la raison du signalement :");
    if (raison) {
      try {
        await socialService.signalerPublication(publicationId, raison);
        toast.success("Publication signalée avec succès");
      } catch (error) {
        toast.error("Erreur lors du signalement");
      }
    }
  };

  const handleDeletePublication = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
      await etudiantPublicationService.supprimerPublication(id);
      toast.success('Publication supprimée');
      // Update local state to immediately reflect the deletion in the dashboard UI
      setSocialFeed(prev => prev.filter(p => p.id !== id));
      setPublications(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      toast.error('Erreur lors de la suppression de la publication');
    }
  };

  const handlePublicationInputChange = (e) => {
    const { name, value } = e.target;
    setPublicationFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublicationFileChange = (e) => {
    setPublicationFormData(prev => ({ ...prev, fichier: e.target.files[0] }));
  };

  const handleSubmitPublication = async (e) => {
    e.preventDefault();

    if (publicationFormData.typePublication === 'ARTICLE_RECHERCHE' && !publicationFormData.coAuthorId) {
      toast.error('Un co-auteur est requis pour un article scientifique');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('titre', publicationFormData.titre);
      data.append('resume', publicationFormData.resume);
      data.append('contenu', publicationFormData.contenu);
      data.append('typePublication', publicationFormData.typePublication);
      if (publicationFormData.coAuthorId) data.append('coAuthorId', publicationFormData.coAuthorId);
      if (publicationFormData.fichier) data.append('fichierJoint', publicationFormData.fichier);

      await etudiantPublicationService.creerPublication(data);
      toast.success('Publication créée ! En attente de validation.');
      setShowPublicationForm(false);
      setPublicationFormData({ titre: '', resume: '', contenu: '', typePublication: 'PROJET', coAuthorId: '', fichier: null });
      fetchSocialFeed();
      fetchMyStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: 'Mes Publications', value: publications.length, icon: 'article', color: '#0A66C2' },
    { label: 'Réseau', value: recommendedStudents.length + '+', icon: 'group', color: '#057642' },
    { label: 'Réactions', value: publications.reduce((acc, p) => acc + (p.nombreReactions || 0), 0), icon: 'favorite', color: '#C9222A' },
  ];

  if (!user) return <div className="p-10 text-center font-bold text-slate-400">Chargement de votre espace...</div>;

  return (
    <div className="w-full pb-12 animate-in fade-in duration-500">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A66C2] via-[#004182] to-[#002244] p-10 md:p-16 rounded-[2.5rem] mb-10 text-white shadow-2xl shadow-blue-900/20 group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000 delay-150"></div>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Bonjour, {user?.nomComplet?.split(' ')[0] || 'Étudiant'} !
          </h1>
          <p className="text-xl md:text-2xl opacity-90 font-medium leading-relaxed">
            Votre espace de recherche et de collaboration académique. Suivez les dernières publications de votre réseau.
          </p>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-300" style={{ backgroundColor: stat.color + '15' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* LinkedIn-style Post Box */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <div className="flex gap-5 items-center mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg ring-4 ring-blue-500/5">
                {user?.photo ? (
                  <img
                    src={user.photo.startsWith('http') ? user.photo : `${BASE_URL}${user.photo}`}
                    className="w-full h-full object-cover"
                    alt="Me"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nomComplet); }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">account_circle</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPublicationForm(true)}
                className="flex-1 text-left px-8 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 font-bold text-sm transition-all shadow-inner"
              >
                Commencer une publication...
              </button>
            </div>
            <div className="flex justify-around pt-4 border-t border-slate-50">
              <button onClick={() => setShowPublicationForm(true)} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-wider transition-all">
                <span className="material-symbols-outlined text-blue-500">image</span> Média
              </button>
              <button onClick={() => setShowPublicationForm(true)} className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-wider transition-all">
                <span className="material-symbols-outlined text-amber-500">article</span> Article
              </button>
              <button onClick={fetchSocialFeed} className="flex items-center gap-3 px-5 py-3 hover:bg-green-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-wider transition-all">
                <span className="material-symbols-outlined text-green-500">autorenew</span> Actualiser
              </button>
            </div>
          </div>

          {/* Social Feed List */}
          <div className="space-y-8">
            {socialFeed.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-200">feed</span>
                </div>
                <h3 className="text-xl font-black text-slate-400">Aucune actualité récente</h3>
                <p className="text-slate-400 mt-2">Suivez des utilisateurs pour voir leurs publications.</p>
              </div>
            ) : (
              socialFeed.map((pub) => (
                <div key={pub.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 border border-slate-100 shadow-sm ring-4 ring-slate-50/50 flex items-center justify-center">
                        {pub.auteurPhoto ? (
                          <img
                            src={pub.auteurPhoto.startsWith('http') ? pub.auteurPhoto : `${BASE_URL}${pub.auteurPhoto}`}
                            className="w-full h-full object-cover"
                            alt={pub.auteurNom}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(pub.auteurNom); }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-3xl">person</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 tracking-tight group-hover:text-[#0A66C2] transition-colors">{pub.auteurNom}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full ring-1 ring-blue-100">
                            {pub.auteurRole === 'ETUDIANT' ? 'Étudiant' : 'Chercheur'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(pub.datePublication).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {pub.auteurId === user.id ? (
                      <button 
                        onClick={() => handleDeletePublication(pub.id)} 
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
                        title="Supprimer ma publication"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400">more_horiz</span>
                      </button>
                    )}
                  </div>

                  <div className="mb-8 px-2">
                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{pub.titre}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{pub.contenu || pub.resume}</p>
                  </div>

                  {pub.fichierUrl && (
                    <div className="mb-8 px-2 overflow-hidden rounded-3xl">
                      {(pub.fichierType === 'PNG' || pub.fichierType === 'JPEG' || pub.fichierType === 'JPG' || pub.fichierType === 'GIF') ? (
                        <div className="relative group/img cursor-pointer">
                          <img 
                            src={`${BASE_URL}${pub.fichierUrl}`} 
                            alt="Publication" 
                            className="w-full h-auto max-h-[500px] object-cover rounded-3xl border border-slate-100 shadow-sm transition-transform duration-500 group-hover/img:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors duration-300 rounded-3xl"></div>
                        </div>
                      ) : (
                        <a href={`${BASE_URL}${pub.fichierUrl}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-5 p-6 bg-slate-50 hover:bg-blue-50 rounded-3xl border border-slate-100 transition-all group/file ring-1 ring-slate-100">
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover/file:bg-[#0A66C2] group-hover/file:text-white transition-all scale-100 group-hover/file:scale-105 duration-300">
                            <span className="material-symbols-outlined text-2xl font-bold">description</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Document Académique</p>
                            <p className="text-sm font-black text-slate-800 uppercase">Voir la ressource complète</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 group-hover/file:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between py-6 border-t border-slate-50">
                    <div className="flex items-center gap-8">
                      <button onClick={() => handleReact(pub.id)} className="flex items-center gap-3 group/btn">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover/btn:bg-blue-50 transition-all duration-300 scale-100 active:scale-90">
                          <span className={`material-symbols-outlined text-2xl ${pub.liked ? 'text-blue-600 fill-1' : 'text-slate-400'}`}>thumb_up</span>
                        </div>
                        <span className="text-sm font-black text-slate-700 tracking-tight">{pub.nombreReactions}</span>
                      </button>
                      <button className="flex items-center gap-3 group/btn" onClick={() => toggleComments(pub.id)}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover/btn:bg-slate-50 transition-all duration-300">
                          <span className={`material-symbols-outlined text-2xl ${showComments[pub.id] ? 'text-blue-600' : 'text-slate-400'}`}>chat_bubble_outline</span>
                        </div>
                        <span className="text-sm font-black text-slate-700 tracking-tight">{pub.nombreCommentaires}</span>
                      </button>
                    </div>
                    <button onClick={() => handleReport(pub.id)} className="flex items-center gap-2 group/btn" title="Signaler la publication">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/btn:bg-red-50 transition-all">
                        <span className="material-symbols-outlined text-xl text-slate-300 group-hover/btn:text-red-500 transition-colors">report</span>
                      </div>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[pub.id] && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {commentsByPub[pub.id]?.length === 0 ? (
                          <p className="text-center text-slate-400 text-xs py-4">Aucun commentaire pour le moment.</p>
                        ) : (
                          commentsByPub[pub.id]?.map((comment) => (
                            <div key={comment.id} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                {comment.utilisateur?.photo ? (
                                  <img src={`${BASE_URL}${comment.utilisateur.photo}`} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-black text-slate-900">{comment.utilisateur?.nomComplet}</span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold">{new Date(comment.dateCommentaire).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{comment.contenu}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comments Input */}
                  <div className="flex gap-4 mt-6 px-2 items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                    <input
                      id={`comment-${pub.id}`}
                      type="text"
                      placeholder="Ajoutez un commentaire académique..."
                      className="flex-1 bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none"
                      value={commentDraft[pub.id] || ''}
                      onChange={(e) => setCommentDraft({ ...commentDraft, [pub.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(pub.id)}
                    />
                    <button
                      onClick={() => handleComment(pub.id)}
                      disabled={!commentDraft[pub.id]?.trim()}
                      className="w-10 h-10 flex items-center justify-center bg-[#0A66C2] hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full transition-all shadow-lg shadow-blue-500/20"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-10">
          {/* Network Suggestions */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 ring-1 ring-slate-50">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-8">Réseau suggéré</h3>
            <div className="space-y-6">
              {recommendedStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/etudiant/reseau')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:rotate-3">
                      <span className="material-symbols-outlined text-slate-300">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-[#0A66C2] transition-colors">{student.nomComplet}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{student.filiere || 'Étudiant'}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-200 group-hover:text-blue-500 transition-colors">arrow_forward</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/etudiant/reseau')}
              className="w-full mt-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#0A66C2] bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
            >
              Découvrir plus
            </button>
          </div>


        </div>
      </div>

      {/* Modern Creation Modal */}
      {showPublicationForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nouvelle Publication</h2>
              <button onClick={() => setShowPublicationForm(false)} className="w-12 h-12 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPublication} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type de contenu</label>
                  <select
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:border-[#0A66C2] transition-all shadow-inner"
                    name="typePublication"
                    value={publicationFormData.typePublication}
                    onChange={handlePublicationInputChange}
                  >
                    <option value="PROJET">Projet Académique</option>
                    <option value="ARTICLE_RECHERCHE">Article Scientifique</option>
                    {user?.role === 'ENSEIGNANT' && <option value="COURS">Ressource de Cours</option>}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Titre accrocheur</label>
                  <input
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black outline-none focus:border-[#0A66C2] transition-all shadow-inner"
                    placeholder="Ex: Analyse de données..."
                    name="titre"
                    required
                    value={publicationFormData.titre}
                    onChange={handlePublicationInputChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description détaillée</label>
                <textarea
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold h-48 outline-none focus:border-[#0A66C2] transition-all shadow-inner resize-none"
                  placeholder="Partagez vos découvertes ou votre travail avec la communauté..."
                  name="contenu"
                  required
                  value={publicationFormData.contenu}
                  onChange={handlePublicationInputChange}
                />
              </div>

              {publicationFormData.typePublication === 'ARTICLE_RECHERCHE' && user?.role === 'ETUDIANT' && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase text-amber-600 tracking-widest ml-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span> Co-auteur requis
                  </label>
                  <select
                    className="w-full p-5 bg-amber-50/50 border-2 border-amber-100 rounded-[1.5rem] font-black text-amber-900 outline-none focus:border-amber-500 transition-all shadow-inner"
                    name="coAuthorId"
                    required
                    value={publicationFormData.coAuthorId}
                    onChange={handlePublicationInputChange}
                  >
                    <option value="">Sélectionnez un chercheur</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nomComplet}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Fichier (PDF/Image)</label>
                <div className="relative group/file">
                  <input
                    type="file"
                    className="w-full p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-xs font-black uppercase tracking-widest cursor-pointer hover:border-[#0A66C2] hover:bg-blue-50 transition-all"
                    onChange={handlePublicationFileChange}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-300 group-hover/file:text-blue-500 transition-colors">cloud_upload</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPublicationForm(false)}
                  className="px-8 py-5 font-black text-slate-400 hover:text-red-500 transition-colors text-[10px] uppercase tracking-[0.2em]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0A66C2] hover:bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:bg-slate-200"
                >
                  {submitting ? 'Publication...' : 'Publier maintenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;