'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ClinicDetail {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: Record<string, { open: string; close: string }>;
  services: string[];
  walkInOpen: boolean;
  telehealthOpen: boolean;
  doctors: { id: string; name: string; specialty: string; onDuty: boolean }[];
}

const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClinicDetailPage() {
  const params = useParams();
  const [clinic, setClinic] = useState<ClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clinics/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setClinic(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="pt-20 text-center text-gray-400">Loading...</div>;
  if (!clinic) return <div className="pt-20 text-center text-gray-400">Clinic not found</div>;

  const today = dayNames[new Date().getDay()];
  const todayHours = clinic.hours[today];

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <Link href="/" className="text-xs opacity-80 hover:opacity-100 mb-2 inline-block">← Back to clinics</Link>
        <h1 className="text-xl font-bold">{clinic.name}</h1>
        <p className="text-xs opacity-80 mt-1">📍 {clinic.address}, {clinic.city}</p>
      </header>

      <div className="p-4 space-y-4">
        {/* Status badges */}
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${clinic.walkInOpen ? 'bg-accent-light text-accent' : 'bg-gray-100 text-gray-500'}`}>
            {clinic.walkInOpen ? '✓ Walk-ins Open' : '✗ Walk-ins Closed'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${clinic.telehealthOpen ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
            {clinic.telehealthOpen ? '✓ Telehealth Available' : '✗ Telehealth Unavailable'}
          </span>
        </div>

        {/* Map placeholder */}
        <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center">
          <a
            href={`https://maps.google.com/?q=${clinic.lat},${clinic.lng}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-primary font-semibold"
          >
            🗺️ Open in Google Maps
          </a>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Contact</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📞 <a href={`tel:${clinic.phone}`} className="text-primary font-semibold">{clinic.phone}</a></p>
            <p>📍 {clinic.address}, {clinic.city}, AB</p>
            <p>🕐 Today: {todayHours?.open === 'closed' ? 'Closed' : `${todayHours?.open} — ${todayHours?.close}`}</p>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Services</h2>
          <div className="flex flex-wrap gap-2">
            {clinic.services.map((s) => (
              <span key={s} className="px-3 py-1.5 bg-primary-light text-primary rounded-full text-xs font-semibold capitalize">
                {s.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Hours</h2>
          <div className="space-y-1.5">
            {dayNames.map((day, i) => {
              const h = clinic.hours[day];
              const isToday = day === today;
              return (
                <div key={day} className={`flex justify-between text-sm ${isToday ? 'font-bold text-primary' : 'text-gray-600'}`}>
                  <span>{dayLabels[i]}{isToday ? ' (Today)' : ''}</span>
                  <span>{h?.open === 'closed' ? 'Closed' : `${h?.open} — ${h?.close}`}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctors on duty */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Doctors</h2>
          {clinic.doctors.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors listed</p>
          ) : (
            <div className="space-y-2">
              {clinic.doctors.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold">
                    {doc.name.split(' ').pop()?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialty}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.onDuty ? 'bg-accent-light text-accent' : 'bg-gray-100 text-gray-400'}`}>
                    {doc.onDuty ? 'On Duty' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <a href={`tel:${clinic.phone}`} className="flex-1 py-3 bg-primary text-white text-center rounded-xl font-semibold text-sm">
            📞 Call Clinic
          </a>
          <a
            href={`https://maps.google.com/?q=${clinic.lat},${clinic.lng}`}
            target="_blank"
            rel="noopener"
            className="flex-1 py-3 border border-primary text-primary text-center rounded-xl font-semibold text-sm"
          >
            🗺️ Directions
          </a>
        </div>
      </div>
    </div>
  );
}
