import React, { useState } from 'react';
import { Mail, Lock, LogIn, HardHat } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSent(false);

    // Hard boundary: Reject any email that isn't the dedicated admin
    if (email.toLowerCase().trim() !== 'istarlaakhil@gmail.com') {
      setError('Access Denied: This email address is not authorized for Admin Panel access.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Automatically provision the developer admin baseline if it's missing!
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr: any) {
          setError('Failed to create developer profile. Is Email/Password provider enabled? ' + createErr.message);
        }
      } else {
        setError(err.message || 'Failed to securely authenticate.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your Admin Email below to receive a reset link.');
      return;
    }
    setLoading(true);
    setError('');
    setResetSent(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Automatically build the identity so the Firebase Reset API hook works flawlessly
        try {
          await createUserWithEmailAndPassword(auth, email, 'zydoadmin123');
          await sendPasswordResetEmail(auth, email);
          setResetSent(true);
        } catch (createErr: any) {
          setError('Failed to auto-provision identity for reset: ' + createErr.message);
        }
      } else {
        setError(err.message || 'Failed to send reset email. Verify Firebase project settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', padding: '2rem' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center', margin: 0 }}>
        
        <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(228, 136, 71, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <HardHat size={40} color="var(--primary)" />
        </div>
        
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>ZyDO Operations</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Authenticate to access the backend infrastructure.</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {resetSent && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Password reset email sent! Please check your inbox.
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Security Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              onClick={handleResetPassword} 
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Secure Login</>}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#555' }}>
          By logging in, you accept the responsibilities of data manipulation.
        </p>
      </div>
    </div>
  );
}
