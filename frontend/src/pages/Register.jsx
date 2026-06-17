import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    motDePasse: '',
    role: 'ETUDIANT',
    document: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('email', formData.email);
    data.append('motDePasse', formData.motDePasse);
    data.append('nomComplet', formData.nomComplet);
    data.append('role', formData.role);
    if (formData.document) {
      data.append('document', formData.document);
    }

    try {
      const response = await authService.register(data);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#faf9f6',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      padding: '2rem 1.5rem',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 900,
      letterSpacing: '-0.025em',
      color: '#004e99',
    },
    main: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1rem 3rem 1rem',
    },
    card: {
      width: '100%',
      maxWidth: '576px',
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0px 4px 20px rgba(27, 28, 26, 0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    brandSide: {
      display: 'none',
      backgroundColor: '#0a66c2',
      padding: '2rem',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#ffffff',
    },
    formSide: {
      padding: '2rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#1b1c1a',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#414752',
      fontSize: '0.875rem',
      marginBottom: '2rem',
    },
    errorMsg: {
      backgroundColor: '#ffdad6',
      color: '#ba1a1a',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    successMsg: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
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
      padding: '0.75rem 1rem',
      backgroundColor: '#e9e8e5',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      color: '#1b1c1a',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    passwordWrapper: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#414752',
    },
    roleGroup: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '0.25rem',
    },
    roleButton: (isActive) => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      border: isActive ? 'none' : '1px solid rgba(193, 198, 212, 0.2)',
      backgroundColor: isActive ? '#bfd5ff' : '#f4f3f0',
      color: isActive ? '#001b3c' : '#414752',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    uploadArea: {
      border: '2px dashed rgba(193, 198, 212, 0.3)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      backgroundColor: '#f4f3f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    uploadIcon: {
      fontSize: '2rem',
      color: '#004e99',
    },
    uploadText: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#1b1c1a',
    },
    uploadHint: {
      fontSize: '0.7rem',
      color: '#414752',
    },
    uploadLink: {
      color: '#004e99',
      fontWeight: 'bold',
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
      marginTop: '1rem',
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '0.875rem',
      color: '#414752',
    },
    link: {
      color: '#004e99',
      fontWeight: 'bold',
      textDecoration: 'none',
      marginLeft: '0.25rem',
    },
    footer: {
      padding: '2rem 1.5rem',
      textAlign: 'center',
    },
    footerText: {
      fontSize: '0.75rem',
      color: '#727783',
    },
    footerLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '1rem',
    },
  };

  const [isNomFocused, setIsNomFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>Mini LinkedIn</div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.formSide}>
            <h1 style={styles.title}>Créer un compte</h1>
            <p style={styles.subtitle}>Développez votre réseau professionnel dès aujourd'hui.</p>

            {error && <div style={styles.errorMsg}>{error}</div>}
            {success && <div style={styles.successMsg}>{success}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nom complet</label>
                <input
                  type="text"
                  name="nomComplet"
                  value={formData.nomComplet}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(isNomFocused && { backgroundColor: '#ffffff', boxShadow: '0 0 0 1px #004e99' }),
                  }}
                  onFocus={() => setIsNomFocused(true)}
                  onBlur={() => setIsNomFocused(false)}
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(isEmailFocused && { backgroundColor: '#ffffff', boxShadow: '0 0 0 1px #004e99' }),
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="jean.dupont@exemple.fr"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Mot de passe</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(isPasswordFocused && { backgroundColor: '#ffffff', boxShadow: '0 0 0 1px #004e99' }),
                      paddingRight: '2.5rem',
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Vous êtes :</label>
                <div style={styles.roleGroup}>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ETUDIANT')}
                    style={styles.roleButton(formData.role === 'ETUDIANT')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person</span>
                    <span>Étudiant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ENSEIGNANT')}
                    style={styles.roleButton(formData.role === 'ENSEIGNANT')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>history_edu</span>
                    <span>Enseignant</span>
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Votre CV ou diplôme (PDF)</label>
                <label style={styles.uploadArea}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <span className="material-symbols-outlined" style={styles.uploadIcon}>upload_file</span>
                  <p style={styles.uploadText}>
                    {formData.document ? formData.document.name : 'Glissez-déposez votre fichier ici'}
                  </p>
                  <p style={styles.uploadHint}>
                    ou <span style={styles.uploadLink}>parcourez vos fichiers</span>
                  </p>
                </label>
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
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 78, 153, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>

              <div style={styles.loginLink}>
                Déjà un compte ?
                <Link to="/login" style={styles.link}>Se connecter</Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 Mini LinkedIn • Plateforme d'Excellence Académique</p>
        <div style={styles.footerLinks}>
          <Link to="/confidentialite" style={{ ...styles.footerText, textDecoration: 'none' }}>Confidentialité</Link>
          <Link to="/conditions" style={{ ...styles.footerText, textDecoration: 'none' }}>Conditions</Link>
          <Link to="/aide" style={{ ...styles.footerText, textDecoration: 'none' }}>Aide</Link>
        </div>
      </footer>
    </div>
  );
};

export default Register;