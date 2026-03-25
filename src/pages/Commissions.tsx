import React, { useState, useEffect } from 'react';
import { IndianRupee, HandCoins, ArrowDownToLine, ReceiptText } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';

interface RideCommission {
  id: string;
  date: string;
  grossFare: number;
  zydoCut: number;
}

export default function Commissions() {
  const [rides, setRides] = useState<RideCommission[]>([]);
  const [totalGross, setTotalGross] = useState(0);
  const [totalZydo, setTotalZydo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeRides: () => void;

    const fetchConfigAndRides = async () => {
      let pct = 10;
      try {
        const snap = await getDoc(doc(db, 'settings', 'pricing'));
        if (snap.exists() && snap.data().commissionPct !== undefined) {
          pct = snap.data().commissionPct;
        }
      } catch (e) {
        console.warn("Failed to retrieve live Commission Rate", e);
      }

      const q = query(collection(db, 'rides'), where('status', '==', 'completed'));
      unsubscribeRides = onSnapshot(q, (snapshot) => {
        let gross = 0;
        let zydoSum = 0;
        const mapped: RideCommission[] = [];

        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const rawFare = d.fareInfo ? parseFloat(d.fareInfo.replace('₹', '')) : 0;
          
          if (!isNaN(rawFare) && rawFare > 0) {
            const cut = rawFare * (pct / 100);
            gross += rawFare;
            zydoSum += cut;

            // Optional chaining for robust timestamps if they exist
            let dateStr = 'Unknown Date';
            if (d.updatedAt) {
              // Usually ISO string from frontend
              dateStr = new Date(d.updatedAt).toLocaleDateString() + ' ' + new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            mapped.push({
              id: docSnap.id,
              date: dateStr,
              grossFare: rawFare,
              zydoCut: cut
            });
          }
        });

        setTotalGross(gross);
        setTotalZydo(zydoSum);
        setRides(mapped.reverse()); // latest first
        setLoading(false);
      });
    };

    fetchConfigAndRides();

    return () => {
      if (unsubscribeRides) unsubscribeRides();
    };
  }, []);

  const stats = [
    { title: "Total Network Volume", value: `₹${totalGross.toFixed(2)}`, icon: <ArrowDownToLine size={24} color="#3b82f6" /> },
    { title: "ZyDO Net Margin", value: `₹${totalZydo.toFixed(2)}`, icon: <IndianRupee size={24} color="#10b981" /> },
    { title: "Driver Payouts Owed", value: `₹${(totalGross - totalZydo).toFixed(2)}`, icon: <HandCoins size={24} color="#f59e0b" /> }
  ];

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Earnings & Commissions</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{stat.title}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{loading ? "..." : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ReceiptText size={24} color="var(--primary)" />
          Ledger
        </h2>
        
        {loading ? (
          <p>Compiling ledgers...</p>
        ) : rides.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No completed rides detected in the database.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Ride ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Date</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Gross Fare</th>
                  <th style={{ padding: '12px 16px', color: '#10b981', fontWeight: 'normal' }}>ZyDO Margin</th>
                </tr>
              </thead>
              <tbody>
                {rides.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#aaa', fontSize: '0.9rem' }}>{r.id.slice(0, 10)}...</td>
                    <td style={{ padding: '16px' }}>{r.date}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>₹{r.grossFare.toFixed(2)}</td>
                    <td style={{ padding: '16px', color: '#10b981', fontWeight: 'bold' }}>+ ₹{r.zydoCut.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
