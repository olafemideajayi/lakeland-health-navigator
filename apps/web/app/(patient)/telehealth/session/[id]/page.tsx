'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function VideoSessionPage() {
  const params = useParams();
  const [status, setStatus] = useState<'waiting' | 'connecting' | 'connected' | 'ended'>('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    // Simulate connection after 2 seconds
    const timer = setTimeout(() => setStatus('connecting'), 1000);
    const timer2 = setTimeout(() => setStatus('connected'), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function endCall() {
    setStatus('ended');
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Call Ended</h1>
        <p className="text-gray-400 mb-2">Duration: {formatTime(elapsed)}</p>
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Remote video placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          {status === 'waiting' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👨‍⚕️</span>
              </div>
              <p className="text-white font-semibold">Waiting for doctor to join...</p>
              <p className="text-gray-500 text-sm mt-1">Please keep this page open</p>
            </div>
          )}
          {status === 'connecting' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-4xl">📹</span>
              </div>
              <p className="text-white font-semibold">Connecting...</p>
            </div>
          )}
          {status === 'connected' && (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl">👨‍⚕️</span>
              </div>
              <p className="text-white font-semibold text-lg">Dr. Connected</p>
              <p className="text-accent text-sm font-semibold mt-1">{formatTime(elapsed)}</p>
            </div>
          )}
        </div>

        {/* Self view (small) */}
        <div className="absolute top-4 right-4 w-24 h-32 bg-gray-700 rounded-xl flex items-center justify-center border-2 border-gray-600">
          {camOn ? (
            <span className="text-2xl">🙂</span>
          ) : (
            <span className="text-gray-500 text-xs">Camera Off</span>
          )}
        </div>

        {/* Connection indicator */}
        {status === 'connected' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-white text-xs font-semibold">Live • {formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-5 safe-bottom">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
              micOn ? 'bg-gray-700 text-white' : 'bg-danger text-white'
            }`}
          >
            {micOn ? '🎙️' : '🔇'}
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
              camOn ? 'bg-gray-700 text-white' : 'bg-danger text-white'
            }`}
          >
            {camOn ? '📹' : '📷'}
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-danger flex items-center justify-center text-xl text-white"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
