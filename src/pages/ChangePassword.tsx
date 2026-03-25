import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setSuccess('Password updated successfully! Next time you log in, use your new security key.');
        setNewPassword('');
      } else {
        setError('No active session found. Please re-authenticate.');
      }
    } catch (err: any) {
      // Firebase security protocol mandates a recent login to change sensitive credentials.
      if (err.code === 'auth/requires-recent-login') {
        setError('Security Error: You must log out and log back in immediately before attempting to change your password.');
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Account Security</h1>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KeyRound size={24} color="var(--primary)" />
          Change Password
        </h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleChange}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                placeholder="Enter at least 6 characters"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1.1rem' }}
          >
            <ShieldCheck size={20} />
            {loading ? 'Executing...' : 'Update Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
}
