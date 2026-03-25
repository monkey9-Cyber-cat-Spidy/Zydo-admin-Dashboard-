import { useEffect, useState } from 'react';
import { Users, Car, TrendingUp, IndianRupee } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function Overview() {
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [registeredRiders, setRegisteredRiders] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      let customers = 0; let drivers = 0;
      snapshot.forEach(doc => {
        if (doc.data().currentRole === 'customer') customers++;
        if (doc.data().currentRole === 'rider') drivers++;
      });
      setActiveCustomers(customers);
      setRegisteredRiders(drivers);
    });

    const unsubRides = onSnapshot(collection(db, 'rides'), (snapshot) => {
      setTotalRides(snapshot.size);
      let rev = 0;
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status === 'completed' && d.fareInfo) rev += parseFloat(d.fareInfo) || 0;
      });
      setTotalRevenue(rev);
    });

    const unsubPayouts = onSnapshot(query(collection(db, 'withdrawals'), where('status', '==', 'Pending')), (snapshot) => {
      let total = 0;
      snapshot.forEach(doc => { total += parseFloat(doc.data().amount) || 0; });
      setPendingPayouts(total);
    });

    return () => { unsubUsers(); unsubRides(); unsubPayouts(); };
  }, []);

  const stats = [
    { title: "Active Customers", value: activeCustomers.toString(), icon: <Users size={24} color="var(--primary)" /> },
    { title: "Registered Riders", value: registeredRiders.toString(), icon: <Car size={24} color="var(--success)" /> },
    { title: "Total Platform Rides", value: totalRides.toString(), icon: <TrendingUp size={24} color="#3b82f6" /> },
    { title: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: <IndianRupee size={24} color="#10b981" /> },
    { title: "Pending Payouts", value: `₹${pendingPayouts.toFixed(2)}`, icon: <IndianRupee size={24} color="#f59e0b" /> },
  ];

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{stat.title}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Razorpay Quick Access */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>💳 Razorpay Payments</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="https://dashboard.razorpay.com/app/payments"
            target="_blank"
            rel="noreferrer"
            className="btn btn-success"
            style={{ textDecoration: 'none' }}
          >
            View All Payments
          </a>
          <a
            href="https://dashboard.razorpay.com/app/payouts/payout-links"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', textDecoration: 'none' }}
          >
            Create Payout Links
          </a>
          <a
            href="https://dashboard.razorpay.com/app/analytics"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ background: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}
          >
            Analytics & Reports
          </a>
        </div>
      </div>
    </div>
  );
}
