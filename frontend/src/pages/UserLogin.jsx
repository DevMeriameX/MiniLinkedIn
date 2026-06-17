import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      const role = result.data?.role;
      if (role === 'ADMIN') {
        navigate('/dashboard');
      } else if (role === 'ENSEIGNANT') {
        navigate('/enseignant/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#faf9f6',
      display: 'flex',
      flexDirection: 'column',
    },
    main: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
    },
    backgroundCircle1: {
      position: 'absolute',
      top: '-10%',
      right: '-5%',
      width: '40vw',
      height: '40vw',
      borderRadius: '50%',
      backgroundColor: '#bfd5ff',
      opacity: 0.2,
      filter: 'blur(100px)',
      pointerEvents: 'none',
    },
    backgroundCircle2: {
      position: 'absolute',
      bottom: '-10%',
      left: '-5%',
      width: '30vw',
      height: '30vw',
      borderRadius: '50%',
      backgroundColor: '#0a66c2',
      opacity: 0.1,
      filter: 'blur(80px)',
      pointerEvents: 'none',
    },
    cardContainer: {
      width: '100%',
      maxWidth: '440px',
      zIndex: 10,
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2.5rem',
    },
    logoText: {
      fontSize: '1.875rem',
      fontWeight: 900,
      letterSpacing: '-0.025em',
      color: '#004e99',
    },
    loginCard: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)',
      padding: '2.5rem',
    },
    cardHeader: {
      marginBottom: '2rem',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: '#1b1c1a',
      marginBottom: '0.5rem',
    },
    cardSubtitle: {
      color: '#414752',
      lineHeight: '1.5',
    },
    errorMessage: {
      backgroundColor: '#ffdad6',
      color: '#ba1a1a',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      textAlign: 'center',
      marginBottom: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#414752',
    },
    input: {
      width: '100%',
      height: '48px',
      padding: '0 1rem',
      backgroundColor: '#e9e8e5',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#1b1c1a',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    inputFocus: {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 1px #004e99',
    },
    passwordRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    forgotLink: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#004e99',
      textDecoration: 'none',
    },
    button: {
      width: '100%',
      height: '48px',
      background: 'linear-gradient(135deg, #004e99 0%, #0a66c2 100%)',
      color: '#ffffff',
      fontWeight: 600,
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '0.5rem',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    footerSection: {
      marginTop: '2.5rem',
      paddingTop: '2rem',
      borderTop: '1px solid transparent',
      textAlign: 'center',
    },
    registerText: {
      fontSize: '0.875rem',
      color: '#414752',
    },
    registerLink: {
      color: '#004e99',
      fontWeight: 'bold',
      textDecoration: 'none',
      marginLeft: '0.25rem',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '3rem',
    },
    infoCard: {
      backgroundColor: '#f4f3f0',
      padding: '1rem',
      borderRadius: '0.5rem',
    },
    infoIcon: {
      fontSize: '1.5rem',
      marginBottom: '0.5rem',
      display: 'block',
    },
    infoTitle: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#1b1c1a',
      marginBottom: '0.25rem',
    },
    infoText: {
      fontSize: '0.7rem',
      color: '#414752',
      lineHeight: '1.3',
    },
    footer: {
      textAlign: 'center',
      marginTop: '3rem',
    },
    footerLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginBottom: '1rem',
    },
    footerLink: {
      fontSize: '0.7rem',
      fontWeight: 500,
      color: '#414752',
      textDecoration: 'none',
    },
    copyright: {
      fontSize: '0.65rem',
      color: '#414752',
      opacity: 0.6,
    },
  };

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.backgroundCircle1}></div>
        <div style={styles.backgroundCircle2}></div>
        
        <div style={styles.cardContainer}>
          <div style={styles.logo}>
            <span style={styles.logoText}>Mini LinkedIn</span>
          </div>
          
          <div style={styles.loginCard}>
            <div style={styles.cardHeader}>
              <h1 style={styles.cardTitle}>Connectez-vous</h1>
              <p style={styles.cardSubtitle}>
                Accédez à votre atelier de mentorat professionnel et collaborez avec vos pairs.
              </p>
            </div>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(isEmailFocused ? styles.inputFocus : {}),
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="nom@institution.fr"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordRow}>
                  <label style={styles.label}>Mot de passe</label>
                  <Link to="/forgot-password" style={styles.forgotLink}>
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(isPasswordFocused ? styles.inputFocus : {}),
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 78, 153, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div style={styles.footerSection}>
              <p style={styles.registerText}>
                Nouveau sur l'Atelier ?
                <Link to="/register" style={styles.registerLink}>
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span className="material-symbols-outlined" style={styles.infoIcon}>school</span>
              <h3 style={styles.infoTitle}>Réseau Académique</h3>
              <p style={styles.infoText}>Accédez à des ressources de recherche exclusives.</p>
            </div>
            <div style={styles.infoCard}>
              <span className="material-symbols-outlined" style={{ ...styles.infoIcon, color: '#833900' }}>verified</span>
              <h3 style={styles.infoTitle}>Mentorat Certifié</h3>
              <p style={styles.infoText}>Connectez-vous avec des experts de votre domaine.</p>
            </div>
          </div>

          <footer style={styles.footer}>
            <div style={styles.footerLinks}>
              <Link to="/conditions" style={styles.footerLink}>Conditions</Link>
              <Link to="/confidentialite" style={styles.footerLink}>Confidentialité</Link>
              <Link to="/aide" style={styles.footerLink}>Aide</Link>
            </div>
            <p style={styles.copyright}>© 2024 Mon Atelier. Tous droits réservés.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default UserLogin;