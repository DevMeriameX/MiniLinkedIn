import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
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
      if (result.data?.role === 'ADMIN') {
        navigate('/dashboard');
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
    bgCircle1: {
      position: 'absolute',
      top: '-10%',
      right: '-5%',
      width: '40vw',
      height: '40vw',
      borderRadius: '50%',
      backgroundColor: '#bfd5ff',
      opacity: 0.2,
      filter: 'blur(100px)',
    },
    bgCircle2: {
      position: 'absolute',
      bottom: '-10%',
      left: '-5%',
      width: '30vw',
      height: '30vw',
      borderRadius: '50%',
      backgroundColor: '#0a66c2',
      opacity: 0.1,
      filter: 'blur(80px)',
    },
    wrapper: {
      width: '100%',
      maxWidth: '1280px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center',
      position: 'relative',
      zIndex: 10,
    },
    leftSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    badgeContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    badgeLogo: {
      fontSize: '1.875rem',
      fontWeight: 900,
      letterSpacing: '-0.025em',
      color: '#0a66c2',
    },
    badge: {
      padding: '0.25rem 0.75rem',
      backgroundColor: '#e9e8e5',
      color: '#414752',
      fontSize: '0.65rem',
      fontWeight: 'bold',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      borderRadius: '9999px',
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#1b1c1a',
      lineHeight: 1.1,
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#414752',
      maxWidth: '32rem',
      lineHeight: 1.5,
    },
    avatarGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginTop: '1rem',
    },
    avatars: {
      display: 'flex',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#e9e8e5',
      border: '2px solid #faf9f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      color: '#414752',
    },
    sessionText: {
      fontSize: '0.875rem',
      fontStyle: 'italic',
      color: '#414752',
    },
    rightSection: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)',
      padding: '2.5rem',
      border: '1px solid rgba(229, 228, 231, 0.1)',
      width: '100%',
      boxSizing: 'border-box',
    },
    securityHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    securityIcon: {
      width: '64px',
      height: '64px',
      backgroundColor: '#f4f3f0',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
    },
    securityTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      letterSpacing: '-0.025em',
      color: '#1b1c1a',
    },
    securityText: {
      fontSize: '0.875rem',
      color: '#414752',
      marginTop: '0.5rem',
    },
    errorMsg: {
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
      width: '100%',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%',
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#414752',
      marginLeft: '0.25rem',
    },
    inputWrapper: {
      position: 'relative',
      width: '100%',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#727783',
      fontSize: '1.25rem',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      backgroundColor: '#e9e8e5',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#1b1c1a',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    inputFocus: {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 1px #004e99',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      paddingLeft: '0.25rem',
    },
    checkbox: {
      width: '1rem',
      height: '1rem',
      borderRadius: '0.25rem',
      accentColor: '#004e99',
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#414752',
    },
    button: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #004e99 0%, #0a66c2 100%)',
      color: '#ffffff',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxSizing: 'border-box',
    },
    footerWarning: {
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid rgba(229, 228, 231, 0.1)',
      textAlign: 'center',
    },
    warningText: {
      fontSize: '0.75rem',
      color: '#414752',
      lineHeight: 1.5,
    },
    pageFooter: {
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f4f3f0',
    },
    footerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    footerText: {
      fontSize: '0.75rem',
      color: '#414752',
    },
    footerLinks: {
      display: 'flex',
      gap: '1.5rem',
    },
    footerLink: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#414752',
      textDecoration: 'none',
    },
  };

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        
        <div style={styles.wrapper}>
          {/* Left Section */}
          <div style={styles.leftSection}>
            <div style={styles.badgeContainer}>
              <span style={styles.badgeLogo}>Mini LinkedIn</span>
              <span style={styles.badge}>Admin Portal</span>
            </div>
            <div>
              <h1 style={styles.title}>Connexion Administrateur</h1>
              <p style={styles.subtitle}>
                Accédez à l'interface de gestion de l'Atelier Académique pour superviser les mentorats et les publications de recherche.
              </p>
            </div>
            <div style={styles.avatarGroup}>
              <div style={styles.avatars}>
                <div style={styles.avatar}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div style={{ ...styles.avatar, marginLeft: '-0.75rem' }}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div style={{ ...styles.avatar, marginLeft: '-0.75rem' }}>
                  +4
                </div>
              </div>
              <span style={styles.sessionText}>Session sécurisée pour l'équipe de modération</span>
            </div>
          </div>

          {/* Right Section - Form */}
          <div style={styles.rightSection}>
            <div style={styles.securityHeader}>
              <div style={styles.securityIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.875rem', color: '#0a66c2' }}>admin_panel_settings</span>
              </div>
              <h2 style={styles.securityTitle}>Sécurité Renforcée</h2>
              <p style={styles.securityText}>Veuillez entrer vos identifiants d'accréditation</p>
            </div>

            {error && <div style={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <span className="material-symbols-outlined" style={styles.inputIcon}>mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      ...styles.input,
                      ...(isEmailFocused && styles.inputFocus),
                    }}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    placeholder="admin@atlashorizon.ma"
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={styles.label}>Mot de passe</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#004e99', textDecoration: 'none' }}>
                    Oublié ?
                  </Link>
                </div>
                <div style={styles.inputWrapper}>
                  <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      ...styles.input,
                      ...(isPasswordFocused && styles.inputFocus),
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div style={styles.checkboxGroup}>
                <input type="checkbox" id="remember" style={styles.checkbox} />
                <label style={styles.checkboxLabel} htmlFor="remember">Maintenir la session active</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading && { opacity: 0.5, cursor: 'not-allowed' }),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>{loading ? 'Connexion...' : 'Se connecter en tant qu\'administrateur'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </button>
            </form>

            <div style={styles.footerWarning}>
              <p style={styles.warningText}>
                Cette zone est strictement réservée au personnel autorisé. <br />
                Toute tentative de connexion non autorisée est enregistrée.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.pageFooter}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>© 2024 Mini LinkedIn. Édition Professionnelle. Tous droits réservés.</p>
          <div style={styles.footerLinks}>
            <Link to="/confidentialite" style={styles.footerLink}>Confidentialité</Link>
            <Link to="/conditions" style={styles.footerLink}>Conditions d'utilisation</Link>
            <Link to="/support" style={styles.footerLink}>Support Technique</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;