'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { DoctorProfile } from '@lhn/shared';
import { SPECIALTIES } from '@lhn/shared';

export default function TelehealthPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter ? `/api/doctors?specialty=${filter}` : '/api/doctors';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      });
  }, [filter]);

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">📹 Telehealth</h1>
        <p className="text-xs opacity-80 mt-1">Skip the 3-hour drive — connect with Edmonton specialists</p>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold border whitespace-nowrap transition-colors ${
            !filter ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          All
        </button>
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border whitespace-nowrap transition-colors ${
              filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Doctor list */}
      <div className="px-4 space-y-3">
        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading specialists...</p>
        ) : doctors.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No specialists found</p>
        ) : (
          doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold text-gray-800">{doc.name}</h3>
                  <p className="text-xs text-primary font-semibold">{doc.specialty}</p>
                  <p className="text-xs text-gray-500 mt-0.5">⭐ {doc.rating} • {doc.ratingCount} consultations</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link href={`/telehealth/book/${doc.id}`} className="flex-1 py-2.5 bg-primary text-white text-center rounded-lg text-sm font-semibold">
                  📹 Book Video Call
                </Link>
                <Link href={`/telehealth/doctor/${doc.id}`} className="py-2.5 px-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold">
                  Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
