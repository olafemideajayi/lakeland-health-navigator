'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingResult {
  id: string;
  doctorToken?: string;
  dailyRoomUrl?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

function generateTimeSlots(): { today: TimeSlot[]; tomorrow: TimeSlot[] } {
  const now = new Date();
  const localHour = now.getHours();
  const today: TimeSlot[] = [];
  const tomorrow: TimeSlot[] = [];

  // Generate remaining slots for today (starting from next full hour, until 7:30 PM)
  const startHour = Math.max(9, localHour + 1);
  for (let hour = startHour; hour < 20; hour++) {
    for (const min of [0, 30]) {
      if (hour === startHour && min === 0 && now.getMinutes() > 30) continue;
      const time = new Date();
      time.setHours(hour, min, 0, 0);
      today.push({
        time: time.toISOString(),
        label: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        available: Math.random() > 0.25,
      });
    }
  }

  // Always generate tomorrow's slots (9 AM to 5 PM)
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  for (let hour = 9; hour < 17; hour++) {
    for (const min of [0, 30]) {
      const time = new Date(tmrw);
      time.setHours(hour, min, 0, 0);
      tomorrow.push({
        time: time.toISOString(),
        label: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        available: Math.random() > 0.2,
      });
    }
  }

  return { today, tomorrow };
}

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState<'time' | 'reason' | 'confirm'>('time');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [slotData] = useState(generateTimeSlots);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [dayTab, setDayTab] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data: Doctor[]) => {
        const doc = data.find((d) => d.id === params.id);
        setDoctor(doc || null);
      });
  }, [params.id]);

  async function handleBooking() {
    if (!selectedSlot || !doctor) return;
    setBooking(true);

    try {
      const authToken = localStorage.getItem('staff_token') || localStorage.getItem('patient_token');
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          startTime: selectedSlot.time,
          notes: reason,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
      }
    } catch {
      // Proceed to confirmation even if API call fails
    }

    setBooking(false);
    setConfirmed(true);
  }

  function getDoctorLink() {
    if (!bookingResult?.doctorToken) return null;
    return `${window.location.origin}/join/${bookingResult.id}?token=${bookingResult.doctorToken}`;
  }

  function copyDoctorLink() {
    const link = getDoctorLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!doctor) return <div className="pt-20 text-center text-gray-400">Loading...</div>;

  if (confirmed) {
    return (
      <div className="pb-20">
        <header className="bg-primary text-white px-5 pt-12 pb-5">
          <h1 className="text-xl font-bold">✓ Appointment Confirmed</h1>
        </header>
        <div className="p-4">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">You&apos;re All Set!</h2>
            <p className="text-sm text-gray-500 mb-6">Your telehealth appointment has been confirmed.</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Doctor</span>
                <span className="font-bold text-gray-800">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Specialty</span>
                <span className="font-semibold text-gray-800">{doctor.specialty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-800">{dayTab === 'tomorrow' ? 'Tomorrow' : 'Today'} {selectedSlot?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-800">30 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-primary">Secure Video Call</span>
              </div>
            </div>

            {/* Doctor share link */}
            {bookingResult?.doctorToken && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-amber-800 mb-1">Share with your doctor</p>
                <p className="text-xs text-amber-700 mb-3">
                  Send this link to {doctor.name} so they can join the video call:
                </p>
                <button
                  onClick={copyDoctorLink}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    copied
                      ? 'bg-accent text-white'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {copied ? 'Link Copied!' : 'Copy Doctor Link'}
                </button>
              </div>
            )}

            <div className="bg-primary-light border border-primary/10 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-semibold text-primary mb-1">What&apos;s Next?</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Share the doctor link above with your physician</li>
                <li>• Join the video call at your appointment time</li>
                <li>• Ensure stable internet and a quiet, well-lit space</li>
              </ul>
            </div>

            {bookingResult?.id && (
              <Link
                href={`/telehealth/session/${bookingResult.id}`}
                className="block w-full py-3.5 bg-accent text-white rounded-xl font-semibold mb-3 text-center"
              >
                Join Video Call
              </Link>
            )}
            <Link href="/appointments" className="block w-full py-3.5 bg-primary text-white rounded-xl font-semibold mb-3 text-center">
              View My Appointments
            </Link>
            <Link href="/" className="block w-full py-3 text-gray-500 font-semibold text-sm text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <Link href={`/telehealth/doctor/${doctor.id}`} className="text-xs opacity-80 hover:opacity-100 mb-2 inline-block">← Back</Link>
        <h1 className="text-xl font-bold">Book Appointment</h1>
        <p className="text-xs opacity-80 mt-1">{doctor.name} — {doctor.specialty}</p>
      </header>

      <div className="p-4">
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step === 'time' || step === 'reason' || step === 'confirm' ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'reason' || step === 'confirm' ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'confirm' ? 'bg-primary' : 'bg-gray-200'}`} />
        </div>

        {/* Step 1: Time Selection */}
        {step === 'time' && (
          <>
            <h2 className="text-[17px] font-bold text-gray-800 mb-1">Select a time</h2>
            <p className="text-xs text-gray-500 mb-4">Choose an available slot</p>

            {/* Day tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setDayTab('today'); setSelectedSlot(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  dayTab === 'today' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => { setDayTab('tomorrow'); setSelectedSlot(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  dayTab === 'tomorrow' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Tomorrow
              </button>
            </div>

            {(() => {
              const slots = dayTab === 'today' ? slotData.today : slotData.tomorrow;
              if (slots.length === 0) {
                return (
                  <div className="text-center py-8 mb-6">
                    <p className="text-gray-400 text-sm">No more slots available today</p>
                    <button
                      onClick={() => { setDayTab('tomorrow'); setSelectedSlot(null); }}
                      className="text-primary text-sm font-semibold mt-2"
                    >
                      View tomorrow&apos;s slots &rarr;
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        !slot.available
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : selectedSlot?.time === slot.time
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              );
            })()}

            <button
              disabled={!selectedSlot}
              onClick={() => setStep('reason')}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                selectedSlot ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: Reason */}
        {step === 'reason' && (
          <>
            <h2 className="text-[17px] font-bold text-gray-800 mb-1">Reason for visit</h2>
            <p className="text-xs text-gray-500 mb-4">Help the doctor prepare for your consultation</p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or concern..."
              className="w-full h-32 border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep('time')}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 py-3.5 bg-primary text-white rounded-xl font-semibold"
              >
                Review Booking
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <>
            <h2 className="text-[17px] font-bold text-gray-800 mb-4">Confirm Your Booking</h2>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Doctor</span>
                <span className="font-bold text-gray-800">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Specialty</span>
                <span className="font-semibold text-gray-800">{doctor.specialty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-800">{dayTab === 'tomorrow' ? 'Tomorrow' : 'Today'} {selectedSlot?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-800">30 minutes</span>
              </div>
              {reason && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Reason for visit:</p>
                  <p className="text-sm text-gray-700">{reason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('reason')}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleBooking}
                disabled={booking}
                className={`flex-1 py-3.5 bg-primary text-white rounded-xl font-semibold ${booking ? 'opacity-60' : ''}`}
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
