import React, { useState, useEffect } from 'react';
import { Save, Percent, Bike, Car } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function PricingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [bikeBase, setBikeBase] = useState('20');
  const [bikePerKm, setBikePerKm] = useState('12');
  const [autoBase, setAutoBase] = useState('30');
  const [autoPerKm, setAutoPerKm] = useState('15');
  const [commissionPct, setCommissionPct] = useState('10');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.bikeBase !== undefined) setBikeBase(data.bikeBase.toString());
          if (data.bikePerKm !== undefined) setBikePerKm(data.bikePerKm.toString());
          if (data.autoBase !== undefined) setAutoBase(data.autoBase.toString());
          if (data.autoPerKm !== undefined) setAutoPerKm(data.autoPerKm.toString());
          if (data.commissionPct !== undefined) setCommissionPct(data.commissionPct.toString());
        }
      } catch (error) {
        console.error("Failed to load pricing configs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      await setDoc(doc(db, 'settings', 'pricing'), {
        bikeBase: parseFloat(bikeBase) || 0,
        bikePerKm: parseFloat(bikePerKm) || 0,
        autoBase: parseFloat(autoBase) || 0,
        autoPerKm: parseFloat(autoPerKm) || 0,
        commissionPct: parseFloat(commissionPct) || 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSuccess('Pricing updated successfully! Driver and Customer apps will use these new rates instantly.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error("Failed to update pricing:", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading settings...</div>;
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Pricing & Fares</h1>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* ZyDO Commission */}
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Percent size={24} color="var(--primary)" />
              Platform Commission
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ZyDO Cut Percentage (%)</label>
              <input 
                type="number" 
                value={commissionPct} 
                onChange={(e) => setCommissionPct(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                required
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Bike Pricing */}
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bike size={24} color="#3b82f6" />
              Bike Pricing
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Base Fare (₹)</label>
              <input 
                type="number" 
                value={bikeBase} 
                onChange={(e) => setBikeBase(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Per KM Rate (₹)</label>
              <input 
                type="number" 
                value={bikePerKm} 
                onChange={(e) => setBikePerKm(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                required
              />
            </div>
          </div>

          {/* Auto Pricing */}
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Car size={24} color="#10b981" />
              Auto Pricing
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Base Fare (₹)</label>
              <input 
                type="number" 
                value={autoBase} 
                onChange={(e) => setAutoBase(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Per KM Rate (₹)</label>
              <input 
                type="number" 
                value={autoPerKm} 
                onChange={(e) => setAutoPerKm(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem' }}
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1.1rem' }}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
