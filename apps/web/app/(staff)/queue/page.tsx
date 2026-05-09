'use client';

import { useState } from 'react';

interface QueuePatient {
  id: string;
  position: number;
  name: string;
  reason: string;
  priority: 'urgent' | 'moderate' | 'low';
  waitingSince: string;
}

const initialQueue: QueuePatient[] = [
  { id: '1', position: 1, name: 'Patient #1042', reason: 'Chest tightness, shortness of breath', priority: 'urgent', waitingSince: '2 min ago' },
  { id: '2', position: 2, name: 'Patient #1043', reason: 'Persistent lower back pain', priority: 'moderate', waitingSince: '8 min ago' },
  { id: '3', position: 3, name: 'Patient #1044', reason: 'Prescription renewal - diabetes', priority: 'low', waitingSince: '14 min ago' },
  { id: '4', position: 4, name: 'Patient #1045', reason: 'Rash on forearm — 3 days', priority: 'low', waitingSince: '19 min ago' },
  { id: '5', position: 5, name: 'Patient #1046', reason: 'Follow-up: post-surgical knee', priority: 'low', waitingSince: '22 min ago' },
];

const priorityStyles = {
  urgent: 'bg-danger-light text-danger',
  moderate: 'bg-yellow-50 text-yellow-700',
  low: 'bg-accent-light text-accent',
};

export default function StaffQueuePage() {
  const [queue, setQueue] = useState(initialQueue);

  function markSeen(id: string) {
    setQueue(queue.filter((p) => p.id !== id));
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">👥 Patient Queue</h1>
            <p className="text-xs opacity-80 mt-1">{queue.length} patients waiting</p>
          </div>
          <span className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-bold">
            Live
          </span>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {queue.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 font-semibold">Queue is empty</p>
            <p className="text-gray-400 text-sm">All patients have been seen</p>
          </div>
        ) : (
          queue.map((patient) => (
            <div key={patient.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {patient.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{patient.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityStyles[patient.priority]}`}>
                      {patient.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{patient.reason}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">{patient.waitingSince}</span>
                    <button
                      onClick={() => markSeen(patient.id)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark"
                    >
                      Mark Seen ✓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
