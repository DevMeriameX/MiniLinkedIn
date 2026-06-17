// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext';
// import { Toaster } from 'react-hot-toast';
// import ProtectedRoute from './components/Auth/ProtectedRoute';
// import AdminLogin from './pages/AdminLogin';
// import UserLogin from './pages/UserLogin';
// import Register from './pages/Register';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import Dashboard from './pages/Dashboard';
// import UserDashboard from './pages/UserDashboard';
// import VerificationAttestations from './pages/VerificationAttestations';
// import GestionComptes from './pages/GestionComptes';
// import Moderation from './pages/Moderation';
// import Signalements from './pages/Signalements';
// import Statistiques from './pages/Statistiques';
// import EnseignantDashboard from './pages/EnseignantDashboard';
// import EnseignantPublications from './pages/EnseignantPublications';
// import EnseignantDiplomes from './pages/EnseignantDiplomes';
// import EnseignantReseau from './pages/EnseignantReseau';
// import Messagerie from './pages/Messagerie';
// import EnseignantProfil from './pages/EnseignantProfil';
// import EtudiantProfil from './pages/EtudiantProfil';
// import EtudiantPublicProfil from './pages/EtudiantPublicProfil';
// import EtudiantReseau from './pages/EtudiantReseau';
// import GestionOffres from './pages/GestionOffres';
// import EnseignantLayout from './components/EnseignantLayout';
// import StudentLayout from './components/StudentLayout';
// import EtudiantPublications from './pages/EtudiantPublications'; // <-- NOUVEAU
// import EtudiantDiplomes from './pages/EtudiantDiplomes'; // <-- NOUVEAU
// import EtudiantOffres from './pages/EtudiantOffres'; // <-- NOUVEAU
// import Publications from './pages/Publications'; // <-- NOUVEAU
// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <NotificationProvider>
//           <Toaster />
//           <Routes>

            

//             {/* Pages publiques */}
//             <Route path="/admin" element={<AdminLogin />} />
//             <Route path="/login" element={<UserLogin />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password" element={<ResetPassword />} />

//             {/* Espace Enseignant avec Layout commun */}
//             <Route path="/enseignant" element={<ProtectedRoute><EnseignantLayout /></ProtectedRoute>}>
//               <Route index element={<Navigate to="dashboard" replace />} />
//               <Route path="dashboard" element={<EnseignantDashboard />} />
//               <Route path="mes-publications" element={<EnseignantPublications />} />
//               <Route path="mes-diplomes" element={<EnseignantDiplomes />} />
//               <Route path="reseau" element={<EnseignantReseau />} />
//               <Route path="messages" element={<Messagerie />} />
//               <Route path="profil" element={<EnseignantProfil />} />
//               <Route path="offres" element={<GestionOffres />} />
//               <Route path="etudiants/:etudiantId" element={<EtudiantPublicProfil />} />
//             </Route>

//             {/* Dashboard Admin */}
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />

//             <Route path="/etudiant" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
//               <Route index element={<Navigate to="dashboard" replace />} />
//               <Route path="dashboard" element={<UserDashboard />} />
//               <Route path="reseau" element={<EtudiantReseau />} />
//               <Route path="messages" element={<Messagerie />} />
//               <Route path="profil" element={<EtudiantProfil />} />
//               <Route path="publications" element={<EtudiantPublications />} />
//               <Route path="diplomes" element={<EtudiantDiplomes />} />
//               <Route path="offres" element={<EtudiantOffres />} />
//             </Route>

//             {/* Compatibilité ancienne route */}
//             <Route path="/user/dashboard" element={<Navigate to="/etudiant/dashboard" replace />} />
//             <Route path="/user/messages" element={<Navigate to="/etudiant/messages" replace />} />

//             {/* Dashboard Admin */}

//             {/* Gestion des comptes (admin) */}
//             <Route
//               path="/comptes"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <GestionComptes />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Vérification des attestations (admin) */}
//             <Route
//               path="/attestations"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <VerificationAttestations />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Modération (admin) */}
//             <Route
//               path="/moderation"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <Moderation />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Signalements (admin) */}
//             <Route
//               path="/signalements"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <Signalements />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Statistiques (admin) */}
//             <Route
//               path="/statistiques"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <Statistiques />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Publications (admin) - NOUVEAU */}
//             <Route
//               path="/publications"
//               element={
//                 <ProtectedRoute adminOnly={true}>
//                   <Publications />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Redirection par défaut */}
//             <Route path="/" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </NotificationProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import VerificationAttestations from './pages/VerificationAttestations';
import GestionComptes from './pages/GestionComptes';
import Moderation from './pages/Moderation';
import Signalements from './pages/Signalements';
import Statistiques from './pages/Statistiques';
import EnseignantDashboard from './pages/EnseignantDashboard';
import EnseignantPublications from './pages/EnseignantPublications';
import EnseignantDiplomes from './pages/EnseignantDiplomes';
import EnseignantReseau from './pages/EnseignantReseau';
import Messagerie from './pages/Messagerie';
import EnseignantProfil from './pages/EnseignantProfil';
import EtudiantProfil from './pages/EtudiantProfil';
import EtudiantPublicProfil from './pages/EtudiantPublicProfil';
import EtudiantReseau from './pages/EtudiantReseau';
import GestionOffres from './pages/GestionOffres';
import EnseignantLayout from './components/EnseignantLayout';
import StudentLayout from './components/StudentLayout';
import EtudiantPublications from './pages/EtudiantPublications'; // <-- NOUVEAU
import EtudiantDiplomes from './pages/EtudiantDiplomes'; // <-- NOUVEAU
import EtudiantOffres from './pages/EtudiantOffres'; // <-- NOUVEAU
import Publications from './pages/Publications'; // <-- NOUVEAU
import EnseignantPublicProfil from './pages/EnseignantPublicProfil';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Routes>
            {/* Pages publiques */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Espace Enseignant avec Layout commun */}
            <Route path="/enseignant" element={<ProtectedRoute><EnseignantLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EnseignantDashboard />} />
              <Route path="mes-publications" element={<EnseignantPublications />} />
              <Route path="mes-diplomes" element={<EnseignantDiplomes />} />
              <Route path="reseau" element={<EnseignantReseau />} />
              <Route path="messages" element={<Messagerie />} />
              <Route path="profil" element={<EnseignantProfil />} />
              <Route path="offres" element={<GestionOffres />} />
              <Route path="etudiants/:id" element={<EtudiantPublicProfil />} />
              <Route path="enseignants/:id" element={<EnseignantPublicProfil />} />
            </Route>

            {/* Dashboard Admin */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Espace Étudiant avec Layout commun */}
            <Route path="/etudiant" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="reseau" element={<EtudiantReseau />} />
              <Route path="messages" element={<Messagerie />} />
              <Route path="profil" element={<EtudiantProfil />} /> {/* Son propre profil (édition) */}
              
              {/* ── NOUVELLES ROUTES DE VISUALISATION DE PROFIL ── */}
              <Route path="voir-etudiant/:id" element={<EtudiantPublicProfil />} />
              <Route path="voir-enseignant/:id" element={<EnseignantPublicProfil />} />
              {/* ────────────────────────────────────────────────── */}

              <Route path="publications" element={<EtudiantPublications />} />
              <Route path="diplomes" element={<EtudiantDiplomes />} />
              <Route path="offres" element={<EtudiantOffres />} />
            </Route>

            {/* Compatibilité ancienne route */}
            <Route path="/user/dashboard" element={<Navigate to="/etudiant/dashboard" replace />} />
            <Route path="/user/messages" element={<Navigate to="/etudiant/messages" replace />} />

            {/* Gestion des comptes (admin) */}
            <Route
              path="/comptes"
              element={
                <ProtectedRoute adminOnly={true}>
                  <GestionComptes />
                </ProtectedRoute>
              }
            />

            {/* Vérification des attestations (admin) */}
            <Route
              path="/attestations"
              element={
                <ProtectedRoute adminOnly={true}>
                  <VerificationAttestations />
                </ProtectedRoute>
              }
            />

            {/* Modération (admin) */}
            <Route
              path="/moderation"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Moderation />
                </ProtectedRoute>
              }
            />

            {/* Signalements (admin) */}
            <Route
              path="/signalements"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Signalements />
                </ProtectedRoute>
              }
            />

            {/* Statistiques (admin) */}
            <Route
              path="/statistiques"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Statistiques />
                </ProtectedRoute>
              }
            />

            {/* Publications (admin) */}
            <Route
              path="/publications"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Publications />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;