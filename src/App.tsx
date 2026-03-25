import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileCheck2, WalletCards, LogOut, Settings, BarChart3, KeyRound } from 'lucide-react';
import './index.css';

import Overview from './pages/Overview';
import Verifications from './pages/Verifications';
import Withdrawals from './pages/Withdrawals';
import PricingSettings from './pages/PricingSettings';
import Commissions from './pages/Commissions';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // Explicitly reject any Firebase token that isn't the root admin email
      if (u && u.email?.toLowerCase() === 'istarlaakhil@gmail.com') {
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#fff' }}>Authorizing...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <LayoutDashboard size={28} color="var(--primary)" />
            ZyDO Admin
          </div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} />
              Overview
            </NavLink>
            <NavLink to="/commissions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              Earnings & Stats
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              Pricing & Fares
            </NavLink>
            <NavLink to="/verifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileCheck2 size={20} />
              Driver Verifications
            </NavLink>
            <NavLink to="/withdrawals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <WalletCards size={20} />
              Withdrawal Approvals
            </NavLink>
            <NavLink to="/security" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <KeyRound size={20} />
              Account Security
            </NavLink>
          </nav>
          
          <button 
            onClick={() => signOut(auth)}
            className="nav-item" 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 'auto', color: 'var(--text-muted)' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/pricing" element={<PricingSettings />} />
            <Route path="/verifications" element={<Verifications />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
            <Route path="/security" element={<ChangePassword />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
