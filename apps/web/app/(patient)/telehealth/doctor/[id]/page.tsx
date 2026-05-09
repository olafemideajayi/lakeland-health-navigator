'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  rating: number;
  ratingCount: number;
  telehealth: boolean;
  onDuty: boolean;
}

export default function DoctorProfilePage() {
  const params = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/doctors`)
      .then((res) => res.json())
      .then((data: Doctor[]) => {
        const doc = data.find((d) => d.id === params.id);
        setDoctor(doc || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="pt-20 text-center text-gray-400">Loading...</div>;
  if (!doctor) return <div className="pt-20 text-center text-gray-400">Doctor not found</div>;

  const initials = doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-8">
        <Link href="/telehealth" className="text-xs opacity-80 hover:opacity-100 mb-3 inline-block">← Back</Link>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">{doctor.name}</h1>
            <p className="text-sm opacity-90">{doctor.specialty}</p>
            <p className="text-xs opacity-70 mt-1">⭐ {doctor.rating} • {doctor.ratingCount} consultations</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status badges */}
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${doctor.telehealth ? 'bg-accent-light text-accent' : 'bg-gray-100 text-gray-500'}`}>
            {doctor.telehealth ? '✓ Telehealth Available' : '✗ Not Available'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${doctor.onDuty ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
            {doctor.onDuty ? '✓ On Duty' : 'Off Duty'}
          </span>
        </div>

        {/* About */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-2">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {doctor.bio || 'No biography available.'}
          </p>
        </div>

        {/* Consultation Info */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Consultation Details</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Duration</span>
              <span className="font-semibold text-gray-800">30 minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Type</span>
              <span className="font-semibold text-gray-800">Secure Video Call</span>
            </div>
            <div className="flex justify-between">
              <span>Platform</span>
              <span className="font-semibold text-gray-800">In-app video (no download needed)</span>
            </div>
            <div className="flex justify-between">
              <span>Cost</span>
              <span className="font-semibold text-accent">Covered by Alberta Health</span>
            </div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Patient Reviews</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-extrabold text-gray-800">{doctor.rating}</span>
            <div>
              <div className="text-yellow-500 text-sm">{'★'.repeat(Math.round(doctor.rating))}{'☆'.repeat(5 - Math.round(doctor.rating))}</div>
              <p className="text-xs text-gray-500">{doctor.ratingCount} reviews</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">&quot;Very thorough and caring. Saved me a trip to Edmonton.&quot;</p>
        </div>

        {/* Book button */}
        <Link
          href={`/telehealth/book/${doctor.id}`}
          className="block w-full py-3.5 bg-primary text-white text-center rounded-xl font-semibold"
        >
          📹 Book Video Consultation
        </Link>
      </div>
    </div>
  );
}
