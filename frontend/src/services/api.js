import axios from 'axios';
import { API_BASE_URL } from '../config.js';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    const xsrfToken = getCookie('XSRF-TOKEN');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    console.log(`[API Request Headers]`, config.headers);
    if (config.data) {
      console.log(`[API Request Body]`, config.data instanceof FormData ? 'FormData Object' : config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const statusText = error.response?.statusText;
    const headers = error.response?.headers;

    console.error(`[API Error] Status: ${status} (${statusText})`);
    console.error(`[API Error] Data:`, data);
    console.error(`[API Error] Headers:`, headers);

    const backendMessage = data?.message || data?.error || "Aucun message d'erreur détaillé fourni par le backend.";

    if (status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        alert(`Session expirée (401). Message: ${backendMessage}`);
        window.location.href = '/login';
      }
    } else if (status === 403) {
      const errorMsg = `Accès refusé (403). \n\nMessage backend: ${backendMessage}\n\nVotre compte est peut-être en attente d'activation par un administrateur.`;
      alert(errorMsg);
      return Promise.reject({ ...error, customMessage: errorMsg });
    }
    return Promise.reject(error);
  }
);

// ========== AUTHENTIFICATION ==========
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (formData) => api.post('/auth/inscription', formData),
  forgotPassword: (email) => api.post('/auth/mot-de-passe/oublie', { email }),
  resetPassword: (token, nouveauMotDePasse) =>
    api.post('/auth/mot-de-passe/reinitialiser', { token, nouveauMotDePasse }),
  getComptesEnAttente: () => api.get('/auth/admin/comptes/en-attente'),
  getAllUsers: () => api.get('/auth/admin/utilisateurs'),
  activerCompte: (userId) => api.put(`/auth/admin/activer/${userId}`),
  desactiverCompte: (userId) => api.put(`/auth/admin/desactiver/${userId}`),
  changerRole: (userId, nouveauRole) => api.put('/admin/role', { userId, nouveauRole }),
};

// ========== DIPLÔMES (ADMIN & ENSEIGNANT) ==========
export const diplomeService = {
  soumettreDiplome: (formData) => api.post('/enseignant/diplome/soumettre', formData),
  resoumettreDiplome: (id, formData) => api.post(`/enseignant/diplome/${id}/resoumettre`, formData),
  getMesDiplomes: (enseignantId) => api.get(`/enseignant/${enseignantId}/diplomes`),
  archiverDiplome: (id, enseignantId) => api.delete(`/enseignant/diplome/${id}`, { params: { enseignantId } }),
  reactiverDiplome: (id, enseignantId) => api.patch(`/enseignant/diplome/${id}/reactiver`, null, { params: { enseignantId } }),
  getDocumentsEnAttente: () => api.get('/admin/diplomes/en-attente'),
  approuverDiplome: (data) => api.put('/admin/diplome/approuver', data),
  rejeterDiplome: (data) => api.put('/admin/diplome/rejeter', data),
  getStatistiques: () => api.get('/admin/diplomes/statistiques'),
};

// ========== SIGNALEMENTS ==========
export const signalementService = {
  getAll: async () => {
    const response = await api.get('/admin/signalements/en-attente');
    return response.data.signalements || [];
  },
  getDetails: (id) => api.get(`/admin/signalement/${id}`),
  traiter: (data) => api.post('/admin/signalement/traiter', data),
};

// ========== PUBLICATIONS (ADMIN) ==========
export const publicationAdminService = {
  supprimer: (publicationId, raison) =>
    api.delete(`/admin/publication/${publicationId}`, { params: { raison } }),
  getPublicationsEnAttente: () => api.get('/admin/publications/en-attente'),
  validerPublication: (id) => api.put(`/admin/publication/${id}/valider`),
  refuserPublication: (id, raison) =>
    api.put(`/admin/publication/${id}/refuser`, raison ? { raison } : {}),
};

// Alias pour compatibilité
export const publicationService = publicationAdminService;

// ========== ADMIN SERVICE ==========
export const adminService = {
  getPublicationsEnAttente: publicationAdminService.getPublicationsEnAttente,
  validerPublication: publicationAdminService.validerPublication,
  refuserPublication: publicationAdminService.refuserPublication,
  supprimerPublication: publicationAdminService.supprimer,
  getStatistiques: () => api.get('/admin/statistiques'),
  getNotifications: () => api.get('/admin/notifications'),
  marquerNotificationLue: (id) => api.put(`/admin/notifications/${id}/lire`),
  activerCompte: (userId) => api.put(`/admin/activer/${userId}`),
  desactiverCompte: (userId) => api.put(`/admin/desactiver/${userId}`),
  changerRole: (userId, nouveauRole) => api.put('/admin/role', { userId, nouveauRole }),
  getComptesEnAttente: () => api.get('/auth/admin/comptes/en-attente'),
  getAllUsers: () => api.get('/auth/admin/utilisateurs'),
};

// ========== STATISTIQUES ==========
export const statsService = {
  getGlobal: async () => {
    const response = await api.get('/admin/statistiques');
    return response.data;
  },
};

// ========== NOTIFICATIONS ==========
export const notificationService = {
  getAll: () => api.get('/admin/notifications'),
  marquerCommeLue: (id) => api.put(`/admin/notifications/${id}/lire`),
};

// ========== NOTIFICATIONS UTILISATEUR ==========
export const userNotificationService = {
  getAll: () => api.get('/notifications/me'),
  marquerCommeLue: (id) => api.put(`/notifications/${id}/lire`),
  marquerToutCommeLu: () => api.put('/notifications/lire-tout'),
};

// ========== PUBLICATIONS (ENSEIGNANT) ==========
export const publicationEnseignantService = {
  getMesPublications: (enseignantId) =>
    api.get(`/enseignant/${enseignantId}/publications`),
  creerPublication: (enseignantId, formData) =>
    api.post(`/enseignant/${enseignantId}/publications`, formData),
  modifierPublication: (enseignantId, publicationId, data) =>
    api.put(`/enseignant/${enseignantId}/publications/${publicationId}`, data),
  supprimerPublication: (enseignantId, publicationId) =>
    api.delete(`/enseignant/${enseignantId}/publications/${publicationId}`),
  getPublicationDetails: (enseignantId, publicationId) =>
    api.get(`/enseignant/${enseignantId}/publications/${publicationId}`),
};

// ========== CONNEXIONS / RÉSEAU ==========
export const connexionService = {
  envoyerDemande: (destinataireId) => api.post(`/connexions/envoyer/${destinataireId}`),
  accepterDemande: (demandeId) => api.post(`/connexions/accepter/${demandeId}`),
  refuserDemande: (demandeId) => api.post(`/connexions/refuser/${demandeId}`),
  supprimerConnexion: (connexionId) => api.delete(`/connexions/${connexionId}`),
  getDemandesRecues: () => api.get('/connexions/recues'),
  getDemandesEnvoyees: () => api.get('/connexions/envoyees'),
  getConnexionsAcceptees: () => api.get('/connexions/acceptees'),
  countConnexions: () => api.get('/connexions/count'),
  rechercherUtilisateurs: (query, filters = {}) =>
    api.get('/connexions/rechercher', { params: { query, ...filters } }),
  getSuggestions: (limit = 8) => api.get('/connexions/suggestions', { params: { limit } }),
};

export const enseignantEtudiantService = {
  getProfilEtudiant: (etudiantId) => api.get(`/enseignant/etudiants/${etudiantId}/profil`),
  recommanderEtudiant: (etudiantId) => api.post(`/enseignant/etudiants/${etudiantId}/recommander`),
};

// ========== MESSAGERIE ==========
export const messageService = {
  envoyerMessage: (destinataireId, contenu) => api.post('/messages/envoyer', { destinataireId, contenu }),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/conversation/${conversationId}`),
  getMessagesByUserId: (userId) => api.get(`/messages/conversation/user/${userId}`),
  marquerCommeLu: (conversationId) => api.put(`/messages/lire/${conversationId}`),
  getNonLusCount: () => api.get('/messages/non-lus/count'),
  supprimerConversation: (conversationId) => api.delete(`/messages/conversation/${conversationId}`),
};

// ========== SOCIAL (FIL / LIKES / COMMENTAIRES) ==========
export const socialService = {
  getPublications: (keyword) => api.get('/social/publications', { params: keyword ? { keyword } : {} }),
  reactToPublication: (publicationId, type = 'LIKE') =>
    api.post(`/social/publications/${publicationId}/reactions`, { type }),
  getCommentaires: (publicationId) => api.get(`/social/publications/${publicationId}/commentaires`),
  addCommentaire: (publicationId, contenu) =>
    api.post(`/social/publications/${publicationId}/commentaires`, { contenu }),
  signalerPublication: (publicationId, raison) =>
    api.post(`/social/publications/${publicationId}/signaler`, { raison }),
};

// ========== PROFIL ENSEIGNANT ==========
export const profilService = {
  getMonProfil: () => api.get('/enseignant/me'),
  updateProfil: (formData) => api.put('/enseignant/profil/update', formData),
  updatePassword: (data) => api.post('/enseignant/update-password', data),

  // Expériences
  getExperiences: () => api.get('/enseignant/experiences'),
  addExperience: (data) => api.post('/enseignant/experiences', data),
  updateExperience: (id, data) => api.put(`/enseignant/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/enseignant/experiences/${id}`),

  // Formations
  getFormations: () => api.get('/enseignant/formations'),
  addFormation: (data) => api.post('/enseignant/formations', data),
  updateFormation: (id, data) => api.put(`/enseignant/formations/${id}`, data),
  deleteFormation: (id) => api.delete(`/enseignant/formations/${id}`),

  // Compétences
  getCompetences: () => api.get('/enseignant/competences'),
  addCompetence: (data) => api.post('/enseignant/competences', data),
  updateCompetence: (id, data) => api.put(`/enseignant/competences/${id}`, data),
  deleteCompetence: (id) => api.delete(`/enseignant/competences/${id}`),
};

// ========== PROFIL ETUDIANT ==========
export const etudiantProfilService = {
  getMonProfil: () => api.get('/etudiant/profil/me'),
  updateProfil: (formData) => api.put('/etudiant/profil/update', formData),
  getExperiences: () => api.get('/etudiant/experiences'),
  addExperience: (data) => api.post('/etudiant/experiences', data),
  updateExperience: (id, data) => api.put(`/etudiant/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/etudiant/experiences/${id}`),
  getFormations: () => api.get('/etudiant/formations'),
  addFormation: (data) => api.post('/etudiant/formations', data),
  updateFormation: (id, data) => api.put(`/etudiant/formations/${id}`, data),
  deleteFormation: (id) => api.delete(`/etudiant/formations/${id}`),
  getCompetences: () => api.get('/etudiant/competences'),
  addCompetence: (data) => api.post('/etudiant/competences', data),
  deleteCompetence: (id) => api.delete(`/etudiant/competences/${id}`),
  updatePassword: (data) => api.post('/etudiant/update-password', data),
};

export const etudiantEnseignantService = {
  getProfilEnseignant: (enseignantId) => api.get(`/etudiant/enseignants/${enseignantId}/profil`),
  getProfilEtudiant: (etudiantId) => api.get(`/etudiant/etudiants/${etudiantId}/profil`),
};

// ========== PUBLICATIONS (ETUDIANT) ==========
export const etudiantPublicationService = {
  getMesPublications: () => api.get('/etudiant/publications'),
  creerPublication: (formData) => api.post('/etudiant/publications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  modifierPublication: (publicationId, data) => api.put(`/etudiant/publications/${publicationId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  supprimerPublication: (publicationId) => api.delete(`/etudiant/publications/${publicationId}`),
};

// ========== OFFRES D'EMPLOI (ENSEIGNANT) ==========
export const offreEnseignantService = {
  getMesOffres: (params) => api.get('/enseignant/offres', { params }),
  creerOffre: (data) => api.post('/enseignant/offres', data),
  modifierOffre: (id, data) => api.put(`/enseignant/offres/${id}`, data),
  supprimerOffre: (id) => api.delete(`/enseignant/offres/${id}`),
  archiverOffre: (id) => api.patch(`/enseignant/offres/${id}/archiver`),
  reactiverOffre: (id) => api.patch(`/enseignant/offres/${id}/reactiver`),
};

// ========== DIPLÔMES (ETUDIANT) ==========
export const etudiantDiplomeService = {
  soumettreDiplome: (formData) => api.post('/etudiant/diplome/soumettre', formData),
  getMesDiplomes: (etudiantId) => api.get(`/etudiant/${etudiantId}/diplomes`),
  resoumettreDiplome: (id, formData) => api.post(`/etudiant/diplome/${id}/resoumettre`, formData),
  supprimerDiplome: (id, etudiantId) => api.delete(`/etudiant/diplome/${id}`, { params: { etudiantId } }),
};

// ========== OFFRES D'EMPLOI (ETUDIANT) ==========
export const etudiantOffreService = {
  getAll: () => api.get('/etudiant/offres'),
};

export default api;