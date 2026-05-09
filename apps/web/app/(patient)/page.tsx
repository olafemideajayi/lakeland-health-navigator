'use client';

import { useEffect, useState } from 'react';
import { ClinicCard } from '@/components/wait-times/clinic-card';
import type { ClinicWithWaitTime } from '@lhn/shared';

export default function HomePage() {
  const [clinics, setClinics] = useState<ClinicWithWaitTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clinics')
      .then((res) => res.json())
      .then((data) => {
        setClinics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const evtSource = new EventSource('/api/sse/wait-times');
    evtSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setClinics((prev) =>
        prev.map((c) =>
          c.id === update.clinicId
            ? { ...c, currentWait: { minutes: update.minutes, patientsWaiting: update.patientsWaiting, capacity: update.capacity, updatedAt: update.updatedAt } }
            : c,
        ),
      );
    };
    return () => evtSource.close();
  }, []);

  const nearest = clinics.length
    ? clinics.reduce((min, c) => (c.currentWait && (!min.currentWait || c.currentWait.minutes < min.currentWait.minutes) ? c : min), clinics[0])
    : null;

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏥</span> Lakeland Health Navigator
        </h1>
        <p className="text-xs opacity-80 ml-8 mt-0.5">
          Cold Lake • Bonnyville • Lac La Biche • St. Paul
        </p>
      </header>

      {/* Nearest Available Banner */}
      {nearest?.currentWait && (
        <div className="mx-4 mt-4 p-3.5 bg-accent-light border border-accent/20 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-semibold text-accent">
              Nearest available: <strong>{nearest.name}</strong>
            </p>
            <p className="text-xs text-accent/70">
              {nearest.currentWait.minutes} min wait
            </p>
          </div>
        </div>
      )}

      {/* Clinic List */}
      <div className="px-4 pt-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Nearby Clinics</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading clinics...</div>
        ) : (
          <div className="space-y-3">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
