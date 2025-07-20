import '../styles/SignUp.css';
import { useState } from 'react';
import SpotaJohnIcon from "../assets/icon.png";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    // TODO: Implement sign up logic
    alert(`Sign up with email: ${email}, password: ${password}`);
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth logic here
    alert('Google Sign-In Clicked!');
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
      <form className="signup-form" onSubmit={handleSignUp}>
        <h1 className="signup-title">Sign Up</h1>
        <div className="signup-subtitle">Get started with Spot a John</div>
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
        <button type="submit" className="signup-btn">Sign Up</button>
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
          onClick={handleGoogleSignIn}
          className="signup-google-btn"
        >
          <svg width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" /><path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2 15.6 2 8.1 7.6 6.3 14.7z" /><path fill="#FBBC05" d="M24 44c5.6 0 10.3-1.8 13.7-4.9l-6.3-5.2C29.8 37 24 37 24 37c-5.8 0-10.7-3.1-13.2-7.6l-7 5.4C8.1 40.4 15.6 44 24 44z" /><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.1 7.5-11.7 7.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 4.5 29.4 2 24 2c-11 0-20 8.9-20 20s9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" /></g></svg>
          Sign up with Google
        </button>
        <div className="signup-terms">
          By signing up to create an account I accept Company's <a href="#" className="signup-terms-link">Terms of Use</a> and <a href="#" className="signup-terms-link">Privacy Policy</a>.
        </div>
      </form>
      <Footer />
    </div>
  );
} 