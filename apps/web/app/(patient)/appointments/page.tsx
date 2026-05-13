'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  dailyRoomUrl: string | null;
  doctorToken: string | null;
  notes: string | null;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
}

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-primary-light text-primary',
  IN_PROGRESS: 'bg-accent-light text-accent',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
  NO_SHOW: 'bg-red-50 text-red-400',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('staff_token') || localStorage.getItem('patient_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/appointments', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyDoctorLink(appt: Appointment) {
    if (!appt.doctorToken) return;
    const link = `${window.location.origin}/join/${appt.id}?token=${appt.doctorToken}`;
    navigator.clipboard.writeText(link);
    setCopied(appt.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const upcoming = appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS');
  const past = appointments.filter((a) => a.status !== 'SCHEDULED' && a.status !== 'IN_PROGRESS');

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">My Appointments</h1>
        <p className="text-xs opacity-80 mt-1">
          {loading ? '...' : `${upcoming.length} upcoming`}
        </p>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3">Upcoming</h2>
                <div className="space-y-2">
                  {upcoming.map((appt) => (
                    <div key={appt.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{appt.doctor.name}</h3>
                          <p className="text-xs text-primary font-semibold">{appt.doctor.specialty}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(appt.startTime)} at {formatTime(appt.startTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                          {appt.status === 'SCHEDULED' ? 'upcoming' : appt.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/telehealth/session/${appt.id}`}
                          className="flex-1 py-2.5 bg-accent text-white text-center rounded-lg text-xs font-semibold"
                        >
                          Join Call
                        </Link>
                        {appt.doctorToken && (
                          <button
                            onClick={() => copyDoctorLink(appt)}
                            className={`flex-1 py-2.5 border rounded-lg text-xs font-semibold transition-colors ${
                              copied === appt.id
                                ? 'border-accent text-accent bg-accent-light'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            {copied === appt.id ? 'Link Copied!' : 'Copy Doctor Link'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3">Past</h2>
                <div className="space-y-2">
                  {past.map((appt) => (
                    <div key={appt.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 opacity-70">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{appt.doctor.name}</h3>
                          <p className="text-xs text-gray-500">{appt.doctor.specialty}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(appt.startTime)} at {formatTime(appt.startTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                          {appt.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appointments.length === 0 && (
              <div className="text-center py-16">
                <span className="text-4xl mb-3 block">&#128203;</span>
                <p className="text-gray-500 font-semibold">No appointments yet</p>
                <p className="text-gray-400 text-sm mt-1">Book a telehealth consultation to get started</p>
                <Link href="/telehealth" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">
                  Browse Specialists
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
