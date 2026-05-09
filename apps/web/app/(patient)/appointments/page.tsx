'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Amara Khalil',
    specialty: 'Cardiology',
    time: '4:30 PM',
    date: 'Today',
    status: 'upcoming',
    type: 'telehealth',
  },
  {
    id: '2',
    doctorName: 'Dr. Lisa Wong',
    specialty: 'Psychiatry',
    time: '2:00 PM',
    date: 'Mon, May 11',
    status: 'upcoming',
    type: 'telehealth',
  },
  {
    id: '3',
    doctorName: 'Dr. Sarah Patel',
    specialty: 'Orthopedics',
    time: '10:00 AM',
    date: 'May 5',
    status: 'completed',
    type: 'telehealth',
  },
];

const statusStyles = {
  upcoming: 'bg-primary-light text-primary',
  completed: 'bg-accent-light text-accent',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function AppointmentsPage() {
  const [appointments] = useState(mockAppointments);
  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const past = appointments.filter((a) => a.status !== 'upcoming');

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">📋 My Appointments</h1>
        <p className="text-xs opacity-80 mt-1">{upcoming.length} upcoming</p>
      </header>

      <div className="p-4 space-y-4">
        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Upcoming</h2>
            <div className="space-y-2">
              {upcoming.map((appt) => (
                <div key={appt.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">{appt.doctorName}</h3>
                      <p className="text-xs text-primary font-semibold">{appt.specialty}</p>
                      <p className="text-xs text-gray-500 mt-1">📅 {appt.date} at {appt.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  {appt.status === 'upcoming' && (
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/telehealth/session/${appt.id}`}
                        className="flex-1 py-2.5 bg-primary text-white text-center rounded-lg text-xs font-semibold"
                      >
                        📹 Join Call
                      </Link>
                      <button className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold">
                        Cancel
                      </button>
                    </div>
                  )}
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
                      <h3 className="text-sm font-bold text-gray-800">{appt.doctorName}</h3>
                      <p className="text-xs text-gray-500">{appt.specialty}</p>
                      <p className="text-xs text-gray-400 mt-1">📅 {appt.date} at {appt.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {appointments.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-gray-500 font-semibold">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Book a telehealth consultation to get started</p>
            <Link href="/telehealth" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">
              Browse Specialists
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
