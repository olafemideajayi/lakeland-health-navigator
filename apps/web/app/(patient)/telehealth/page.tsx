'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DoctorProfile } from '@lhn/shared';
import { SPECIALTIES } from '@lhn/shared';
import { DoctorCardSkeleton } from '@/components/ui/skeleton';

export default function TelehealthPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<(DoctorProfile & { onDuty?: boolean })[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const url = filter ? `/api/doctors?specialty=${filter}` : '/api/doctors';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      });
  }, [filter]);

  async function handleConnectNow(doctorId: string) {
    setConnecting(doctorId);
    const token = localStorage.getItem('staff_token') || localStorage.getItem('patient_token');

    try {
      const res = await fetch('/api/appointments/connect-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ doctorId, reason: reason || 'On-call consultation' }),
      });

      if (!res.ok) throw new Error('Failed to connect');
      const data = await res.json();

      // Navigate directly to the video session
      router.push(`/telehealth/session/${data.appointment.id}`);
    } catch {
      alert('Unable to connect. The doctor may no longer be available.');
      setConnecting(null);
    }
  }

  const onCallDoctors = doctors.filter((d) => d.onDuty);
  const otherDoctors = doctors.filter((d) => !d.onDuty);

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">Telehealth</h1>
        <p className="text-xs opacity-80 mt-1">Skip the 3-hour drive — connect with specialists</p>
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

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <DoctorCardSkeleton key={i} />)}
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No specialists found</p>
        ) : (
          <>
            {/* On-call doctors section */}
            {onCallDoctors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h2 className="text-sm font-bold text-gray-800">Available Now</h2>
                </div>
                <div className="space-y-3">
                  {onCallDoctors.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative">
                          {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-gray-800">{doc.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">ON CALL</span>
                          </div>
                          <p className="text-xs text-primary font-semibold">{doc.specialty}</p>
                          <p className="text-xs text-gray-500 mt-0.5">&#11088; {doc.rating} &bull; {doc.ratingCount} consultations</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setShowReasonModal(doc.id)}
                          disabled={connecting === doc.id}
                          className={`flex-1 py-2.5 bg-green-500 text-white text-center rounded-lg text-sm font-semibold transition-colors ${
                            connecting === doc.id ? 'opacity-60' : 'hover:bg-green-600'
                          }`}
                        >
                          {connecting === doc.id ? 'Connecting...' : 'Connect Now'}
                        </button>
                        <Link href={`/telehealth/doctor/${doc.id}`} className="py-2.5 px-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold">
                          Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other doctors */}
            {otherDoctors.length > 0 && (
              <div>
                {onCallDoctors.length > 0 && (
                  <h2 className="text-sm font-bold text-gray-800 mb-3 mt-4">Book an Appointment</h2>
                )}
                <div className="space-y-3">
                  {otherDoctors.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[15px] font-bold text-gray-800">{doc.name}</h3>
                          <p className="text-xs text-primary font-semibold">{doc.specialty}</p>
                          <p className="text-xs text-gray-500 mt-0.5">&#11088; {doc.rating} &bull; {doc.ratingCount} consultations</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/telehealth/book/${doc.id}`} className="flex-1 py-2.5 bg-primary text-white text-center rounded-lg text-sm font-semibold">
                          Book Video Call
                        </Link>
                        <Link href={`/telehealth/doctor/${doc.id}`} className="py-2.5 px-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold">
                          Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 safe-bottom">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Quick Connect</h3>
            <p className="text-sm text-gray-500 mb-4">
              Briefly describe why you need to see the doctor (optional).
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Chest pain for the past 2 hours, feeling dizzy..."
              className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary mb-4"
            />
            <button
              onClick={() => {
                const doctorId = showReasonModal;
                setShowReasonModal(null);
                handleConnectNow(doctorId);
              }}
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors"
            >
              Connect Now
            </button>
            <button
              onClick={() => { setShowReasonModal(null); setReason(''); }}
              className="w-full py-3 text-gray-500 font-semibold text-sm mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
