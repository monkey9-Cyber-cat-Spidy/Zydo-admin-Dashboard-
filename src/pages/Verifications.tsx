import { useState, useEffect } from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Verifications() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'verifications'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setQueue(data);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'verifications', id), { status: 'Approved' });
      alert('Rider documents verified successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to approve. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Driver Verifications</h1>
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {queue.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pending verification requests.
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Rider Name</th>
                <th>Vehicle Data</th>
                <th>Class</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 500 }}>{req.name || req.firstName + ' ' + req.lastName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.vehicle || '—'}</td>
                  <td><span className="chip" style={{ background: 'rgba(255,255,255,0.1)' }}>{req.type || req.vehicleType || '—'}</span></td>
                  <td>
                    <span className={`chip ${req.status === 'Approved' ? 'approved' : req.status === 'Pending' ? 'pending' : ''}`}>
                      {req.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        <Eye size={16} /> Docs
                      </button>
                      {(req.status === 'Pending' || !req.status) && (
                        <button className="btn btn-success" onClick={() => handleApprove(req.id)}>
                          <CheckCircle2 size={16} /> Approve
                        </button>
                      )}
                    </div>
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
