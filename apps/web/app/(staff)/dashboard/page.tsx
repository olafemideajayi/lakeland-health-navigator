'use client';

import { useEffect, useState } from 'react';
import { useStaffAuth, staffFetch } from '../../../lib/use-staff-auth';

interface Stats {
  patientsSeenToday: number;
  telehealthRedirects: number;
  erDiversions: number;
}

interface DailySummary {
  avgWaitTime: number;
  peakHour: string;
  peakWait: number;
  queueLength: number;
}

export default function StaffDashboardPage() {
  const { user, token } = useStaffAuth();
  const [stats, setStats] = useState<Stats>({ patientsSeenToday: 0, telehealthRedirects: 0, erDiversions: 0 });
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user?.clinicId) return;

    Promise.all([
      staffFetch(`/api/staff/queue/stats?clinicId=${user.clinicId}`, token),
      staffFetch(`/api/staff/queue?clinicId=${user.clinicId}`, token),
    ])
      .then(([statsData, queueData]) => {
        setStats(statsData);
        setQueueCount(Array.isArray(queueData) ? queueData.length : 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    staffFetch(`/api/staff/daily-summary?clinicId=${user.clinicId}`, token)
      .then(setSummary)
      .catch(() => {});
  }, [token, user?.clinicId]);

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">📊 Staff Dashboard</h1>
        <p className="text-xs opacity-80 mt-1">
          {user?.name || 'Staff'} — Today
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-primary rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-white">
            {loading ? '—' : stats.patientsSeenToday}
          </p>
          <p className="text-[11px] font-semibold text-white/80 mt-1">Seen Today</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-accent">
            {loading ? '—' : stats.telehealthRedirects}
          </p>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">Telehealth Redirects</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-warning">
            {loading ? '—' : stats.erDiversions}
          </p>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">ER Diversions</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <a href="/controls" className="block w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="text-sm font-bold text-gray-800">Update Clinic Status</p>
                <p className="text-xs text-gray-500">Wait time, doctors on duty, availability</p>
              </div>
            </div>
          </a>
          <a href="/queue" className="block w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-sm font-bold text-gray-800">Manage Patient Queue</p>
                <p className="text-xs text-gray-500">
                  {loading ? '...' : `${queueCount} patient${queueCount !== 1 ? 's' : ''} currently waiting`}
                </p>
              </div>
            </div>
          </a>
          <a href="/" className="block w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👁️</span>
              <div>
                <p className="text-sm font-bold text-gray-800">View Patient App</p>
                <p className="text-xs text-gray-500">See what patients see</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="px-4 mt-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Today&apos;s Summary</h2>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Avg wait time</span>
            <span className="font-bold text-gray-800">
              {summary ? `${summary.avgWaitTime} min` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Peak hour</span>
            <span className="font-bold text-gray-800">
              {summary ? `${summary.peakHour} (${summary.peakWait} min wait)` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Telehealth saves</span>
            <span className="font-bold text-accent">
              ~${stats.telehealthRedirects * 300} system savings
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <button className="w-full py-3.5 bg-accent text-white rounded-xl font-semibold">
          📄 Generate Daily Report
        </button>
      </div>
    </div>
  );
}
