'use client';

import { useEffect, useState } from 'react';
import { useStaffAuth, staffFetch } from '../../../lib/use-staff-auth';

interface QueuePatient {
  id: string;
  triageLevel: string;
  reason: string;
  checkedInAt: string;
  patient: { id: string; name: string };
}

const priorityMap: Record<string, string> = {
  EMERGENCY: 'urgent',
  URGENT: 'urgent',
  WALK_IN: 'moderate',
  TELEHEALTH: 'low',
  SELF_CARE: 'low',
};

const priorityStyles: Record<string, string> = {
  urgent: 'bg-danger-light text-danger',
  moderate: 'bg-yellow-50 text-yellow-700',
  low: 'bg-accent-light text-accent',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

export default function StaffQueuePage() {
  const { user, token } = useStaffAuth();
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user?.clinicId) return;

    staffFetch(`/api/staff/queue?clinicId=${user.clinicId}`, token)
      .then((data) => {
        setQueue(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      staffFetch(`/api/staff/queue?clinicId=${user.clinicId}`, token)
        .then((data) => {
          if (Array.isArray(data)) setQueue(data);
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [token, user?.clinicId]);

  async function markSeen(id: string) {
    if (!token) return;
    setQueue(queue.filter((p) => p.id !== id));
    try {
      await staffFetch(`/api/staff/queue/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'seen' }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">👥 Patient Queue</h1>
            <p className="text-xs opacity-80 mt-1">
              {loading ? '...' : `${queue.length} patient${queue.length !== 1 ? 's' : ''} waiting`}
            </p>
          </div>
          <span className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-bold">
            Live
          </span>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {loading ? (
          <p className="text-center py-16 text-gray-400">Loading queue...</p>
        ) : queue.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 font-semibold">Queue is empty</p>
            <p className="text-gray-400 text-sm">All patients have been seen</p>
          </div>
        ) : (
          queue.map((entry, idx) => {
            const priority = priorityMap[entry.triageLevel] || 'low';
            return (
              <div key={entry.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-800">
                        {entry.patient?.name || `Patient`}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityStyles[priority]}`}>
                        {priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.reason}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-gray-400">{timeAgo(entry.checkedInAt)}</span>
                      <button
                        onClick={() => markSeen(entry.id)}
                        className="text-xs font-semibold text-primary hover:text-primary-dark"
                      >
                        Mark Seen ✓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
