import { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Withdrawals() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort: Pending first, then by date
      data.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return 0;
      });
      setRequests(data);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status: 'Processed' });
      alert('Withdrawal marked as Processed. Complete the actual bank transfer via Razorpay Payouts dashboard.');
    } catch (e) {
      console.error(e);
      alert('Failed to update withdrawal status.');
    }
  };

  const pendingTotal = requests
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return (
    <div>
      <h1 className="page-title">Friday Withdrawal Approvals</h1>

      {/* Razorpay Payout Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Pending Payouts</p>
          <h2 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>₹{pendingTotal.toFixed(2)}</h2>
        </div>
        <a
          href="https://dashboard.razorpay.com/app/payouts"
          target="_blank"
          rel="noreferrer"
          className="btn btn-success"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={16} /> Process Payouts via Razorpay
        </a>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {requests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No withdrawal requests yet.
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Driver ID</th>
                <th>Amount</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{req.id.slice(0, 10)}...</td>
                  <td style={{ fontWeight: 600 }}>{req.driverId?.slice(0, 10) || '—'}...</td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{parseFloat(req.amount || 0).toFixed(2)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {req.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ?? '—'}
                  </td>
                  <td>
                    <span className={`chip ${req.status === 'Processed' ? 'approved' : 'pending'}`}>
                      {req.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {req.status !== 'Processed' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-success" onClick={() => handleApprove(req.id)}>
                          <CheckCircle2 size={16} /> Mark Processed
                        </button>
                        <a
                          href={`https://dashboard.razorpay.com/app/payouts/create`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn"
                          style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={14} /> Pay via Razorpay
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Banknote size={16} /> Sent to Bank
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
