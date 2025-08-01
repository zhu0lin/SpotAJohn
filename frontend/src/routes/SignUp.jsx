/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* Style imports */
import '../styles/SignUp.css';

/* Asset imports */
import SpotaJohnIcon from "../assets/icon.png";

/* Component imports */
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import Footer from "../components/Footer";

/* Firebase imports */
import { auth, provider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, getAuth, validatePassword } from 'firebase/auth';


export default function SignUp() {

  useEffect(() => {
    document.title = 'Spot a John - Sign Up';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateForm = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (password.length < 6) {
      setError('Please make your password longer than 6 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    try {
      const status = await validatePassword(getAuth(), password);
      if (!status.isValid) {
        // Password could not be validated. Use the status to show what
        // requirements are met and which are missing.

        // If a criterion is undefined, it is not required by policy. If the
        // criterion is defined but false, it is required but not fulfilled by
        // the given password. For example:
        const missingRequirements = [];

        if (status.containsLowercaseLetter === false) {
          missingRequirements.push('lowercase letter');
        }
        if (status.containsUppercaseLetter === false) {
          missingRequirements.push('uppercase letter');
        }
        if (status.containsNumber === false) {
          missingRequirements.push('number');
        }
        if (status.containsNonAlphanumericCharacter === false) {
          missingRequirements.push('special character');
        }
        if (status.minimumLength === false) {
          missingRequirements.push('minimum length requirement');
        }

        if (missingRequirements.length > 0) {
          setError(`Password must contain: ${missingRequirements.join(', ')}`);
        } else {
          setError('Password does not meet security requirements');
        }
        return false;
      }
    } catch (error) {
      setError('Unable to validate password. Please try again.');
      return false;
    }
    return true;
  }

  const handleEmailAndPassSignUp = async (e) => {
    e.preventDefault();

    const validForm = await validateForm();
    if (!validForm) return;

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please try logging in instead.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        default:
          setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      navigate('/home');
    } catch (error) {
      console.error('Google sign-in error:', error);

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in was cancelled. Please try again.')
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method.');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up was blocked. Please allow pop-ups for this site and try again.');
          break;
        default:
          setError('An error occurred during Google sign-in. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <header className="signup-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <h3>
            <img src={SpotaJohnIcon} alt="Spot a John icon" />
            Spot a John
          </h3>
        </div>
      </header>
      <form className="signup-form" onSubmit={handleEmailAndPassSignUp}>
        <h1 className="signup-title">Sign Up</h1>
        <div className="signup-subtitle">Get started with Spot a John</div>

        <ErrorMessage
          message={error}
          type="error"
          onClose={() => setError('')}
        />

        <div className="signup-field-group">
          <label htmlFor="email" className="signup-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="signup-input"
            disabled={loading}
          />
        </div>
        <div className="signup-field-group">
          <label htmlFor="password" className="signup-label">Password</label>
          <div className="signup-password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="signup-input"
              disabled={loading}
            />
            <span
              onClick={() => setShowPassword(s => !s)}
              className="signup-password-toggle"
              tabIndex={0}
              role="button"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" /><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" /></svg>
              )}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="signup-btn"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', position: 'relative' }}
        >
          {loading ? (
            <>
              <span style={{ opacity: 0 }}>Sign Up</span>
              <LoadingSpinner
                size="small"
                color="white"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </>
          ) : (
            'Sign Up'
          )}
        </button>
        <div className="signup-login-link">
          Already have an account? <a href="/login" className="signup-login-anchor">Log In</a>
        </div>
        <div className="signup-divider">
          <div className="signup-divider-line"></div>
          <span className="signup-divider-text">or</span>
          <div className="signup-divider-line"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="signup-google-btn"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', position: 'relative' }}
        >
          {loading ? (
            <>
              <span style={{ opacity: 0 }}>Sign up with Google</span>
              <LoadingSpinner
                size="small"
                color="gray"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" /><path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2 15.6 2 8.1 7.6 6.3 14.7z" /><path fill="#FBBC05" d="M24 44c5.6 0 10.3-1.8 13.7-4.9l-6.3-5.2C29.8 37 24 37 24 37c-5.8 0-10.7-3.1-13.2-7.6l-7 5.4C8.1 40.4 15.6 44 24 44z" /><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.1 7.5-11.7 7.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2c-11 0-20 8.9-20 20s9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" /></g></svg>
              Sign up with Google
            </>
          )}
        </button>
        <div className="signup-terms">
          By signing up to create an account I accept Company's <a href="#" className="signup-terms-link">Terms of Use</a> and <a href="#" className="signup-terms-link">Privacy Policy</a>.
        </div>
      </form>
      <Footer />
    </div>
  );
} 