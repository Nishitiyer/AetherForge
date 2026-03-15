import React, { useState } from 'react'; // Initialized State
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Github, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!isLogin) {
        // Sign Up
        const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000' 
          : 'https://aether-forge-server.vercel.app';
          
        const response = await fetch(`${apiUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
          localStorage.setItem('userEmail', email);
          navigate('/onboarding');
        } else {
          const data = await response.json();
          setError(data.error || 'Signup failed');
        }
      } else {
        // Sign In (Mocked for now, but stores email)
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Could not connect to the authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <div className="auth-container glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon text-gradient">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Join AetherForge'}</h2>
          <p>{isLogin ? 'Enter your credentials to continue' : 'Start your AI-powered 3D journey today'}</p>
        </div>

        <div className="auth-social">
          <button className="social-btn"><Github size={20} /> GitHub</button>
          <button className="social-btn"><Globe size={20} /> Google</button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Alex Chen" required={!isLogin} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="alex@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {error && <p className="error-text" style={{textAlign: 'center', color: '#ff4444', fontSize: '0.8rem', marginBottom: '1rem'}}>{error}</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
