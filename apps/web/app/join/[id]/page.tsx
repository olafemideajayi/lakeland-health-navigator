'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { VideoRoom } from '@/components/telehealth/video-room';

interface DoctorJoinData {
  roomUrl: string;
  token: string;
  appointment: {
    id: string;
    startTime: string;
    notes: string | null;
    doctorName: string;
  };
}

export default function DoctorJoinPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('token') || '';

  const [joinData, setJoinData] = useState<DoctorJoinData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'in-call' | 'ended' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/appointments/${params.id}/doctor-join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid or expired link');
        return res.json();
      })
      .then((data: DoctorJoinData) => {
        setJoinData(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [params.id, accessToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">📹</span>
          </div>
          <p className="text-white font-semibold">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <span className="text-4xl text-red-400">!</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 text-sm mb-2">{error}</p>
        <p className="text-gray-500 text-xs">
          Please use the link sent to you by the Lakeland Health Navigator system.
        </p>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-6">
          <span className="text-4xl text-accent">&#10003;</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Consultation Complete</h1>
        <p className="text-sm text-gray-500 mb-2">
          Thank you, {joinData?.appointment.doctorName}.
        </p>
        <p className="text-xs text-gray-600">You may close this tab.</p>
      </div>
    );
  }

  if (status === 'ready' && joinData) {
    const aptTime = new Date(joinData.appointment.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          <p className="text-primary text-xs font-semibold tracking-wider uppercase mb-2">
            Lakeland Health Navigator
          </p>
          <h1 className="text-xl font-bold text-white mb-1">
            Telehealth Consultation
          </h1>
          <p className="text-gray-400 text-sm">
            {joinData.appointment.doctorName} &mdash; {aptTime}
          </p>
        </div>

        {joinData.appointment.notes && (
          <div className="w-full max-w-sm bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 font-semibold mb-1">Patient&apos;s Reason for Visit</p>
            <p className="text-sm text-gray-300">{joinData.appointment.notes}</p>
          </div>
        )}

        <button
          onClick={() => setStatus('in-call')}
          className="w-full max-w-sm py-3.5 bg-accent text-white rounded-xl font-semibold text-lg"
        >
          Join Video Call
        </button>
        <p className="text-gray-600 text-xs mt-4">
          Ensure camera and microphone are enabled in your browser.
        </p>
      </div>
    );
  }

  if (status === 'in-call' && joinData) {
    return (
      <VideoRoom
        roomUrl={joinData.roomUrl}
        token={joinData.token}
        userName={joinData.appointment.doctorName}
        onLeave={() => setStatus('ended')}
      />
    );
  }

  return null;
}
