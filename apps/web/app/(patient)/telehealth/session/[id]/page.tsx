'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VideoRoom } from '@/components/telehealth/video-room';

interface JoinData {
  roomUrl: string;
  token: string;
}

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [joinData, setJoinData] = useState<JoinData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'in-call' | 'ended' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('staff_token') || localStorage.getItem('patient_token');

    // Call the join endpoint to get Daily.co room URL and meeting token
    fetch(`/api/appointments/${params.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to join this appointment');
        return res.json();
      })
      .then((data: JoinData) => {
        setJoinData(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [params.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">📹</span>
          </div>
          <p className="text-white font-semibold">Preparing video room...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Cannot Join</h1>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <Link href="/appointments" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold">
          View Appointments
        </Link>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-6">
          <span className="text-4xl text-accent">&#10003;</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Call Ended</h1>
        <p className="text-sm text-gray-500 mb-8">Your consultation summary will be available shortly.</p>
        <Link href="/appointments" className="w-full max-w-xs py-3.5 bg-primary text-white rounded-xl font-semibold text-center block">
          View Appointments
        </Link>
        <Link href="/" className="mt-3 text-gray-400 text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  if (status === 'ready' && joinData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <span className="text-5xl">📹</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Ready to Join</h1>
        <p className="text-gray-400 text-sm mb-8">
          Make sure you&apos;re in a quiet, well-lit space with stable internet.
        </p>
        <button
          onClick={() => setStatus('in-call')}
          className="w-full max-w-xs py-3.5 bg-accent text-white rounded-xl font-semibold text-lg"
        >
          Join Video Call
        </button>
        <button
          onClick={() => router.push('/appointments')}
          className="mt-3 text-gray-400 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === 'in-call' && joinData) {
    return (
      <VideoRoom
        roomUrl={joinData.roomUrl}
        token={joinData.token}
        userName="Patient"
        onLeave={() => setStatus('ended')}
      />
    );
  }

  return null;
}
