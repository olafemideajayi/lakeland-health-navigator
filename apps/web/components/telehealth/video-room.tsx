'use client';

import { useEffect, useCallback, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

interface VideoRoomProps {
  roomUrl: string;
  token: string;
  userName: string;
  onLeave?: () => void;
}

export function VideoRoom({ roomUrl, token, userName, onLeave }: VideoRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [status, setStatus] = useState<'joining' | 'joined' | 'error' | 'left'>('joining');
  const [participantCount, setParticipantCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState('');

  // Timer
  useEffect(() => {
    if (status !== 'joined') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Create and join call
  useEffect(() => {
    const call = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: true,
    });

    setCallObject(call);

    call.on('joined-meeting', () => setStatus('joined'));
    call.on('left-meeting', () => {
      setStatus('left');
      onLeave?.();
    });
    call.on('error', (e) => {
      setError(e?.errorMsg || 'Connection error');
      setStatus('error');
    });
    call.on('participant-joined', () => {
      setParticipantCount(Object.keys(call.participants()).length);
    });
    call.on('participant-left', () => {
      setParticipantCount(Object.keys(call.participants()).length);
    });
    call.on('participant-updated', () => {
      setParticipantCount(Object.keys(call.participants()).length);
    });

    call
      .join({ url: roomUrl, token, userName })
      .catch((err: Error) => {
        setError(err.message || 'Failed to join');
        setStatus('error');
      });

    return () => {
      call.leave().catch(() => {});
      call.destroy();
    };
  }, [roomUrl, token, userName]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMic = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalAudio(!micOn);
    setMicOn(!micOn);
  }, [callObject, micOn]);

  const toggleCam = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalVideo(!camOn);
    setCamOn(!camOn);
  }, [callObject, camOn]);

  const endCall = useCallback(() => {
    callObject?.leave();
  }, [callObject]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Connection Error</h1>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center" id="daily-video-container">
        {status === 'joining' && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl">Connecting</span>
            </div>
            <p className="text-white font-semibold">Connecting to video room...</p>
            <p className="text-gray-500 text-sm mt-1">Please allow camera and microphone access</p>
          </div>
        )}

        {status === 'joined' && (
          <>
            {participantCount < 2 ? (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">Waiting</span>
                </div>
                <p className="text-white font-semibold">Waiting for the other participant...</p>
                <p className="text-gray-500 text-sm mt-1">They&apos;ll join using their link</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">Connected</span>
                </div>
                <p className="text-white font-semibold text-lg">In Session</p>
                <p className="text-accent text-sm font-semibold mt-1">{formatTime(elapsed)}</p>
                <p className="text-gray-500 text-xs mt-1">{participantCount} participant{participantCount !== 1 ? 's' : ''}</p>
              </div>
            )}
          </>
        )}

        {/* Status bar */}
        {status === 'joined' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-white text-xs font-semibold">
              Live {formatTime(elapsed)}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-5 safe-bottom">
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
              micOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
            }`}
            title={micOn ? 'Mute' : 'Unmute'}
          >
            {micOn ? '🎤' : '🔇'}
          </button>
          <button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
              camOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
            }`}
            title={camOn ? 'Camera off' : 'Camera on'}
          >
            {camOn ? '📹' : '📷'}
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white"
            title="End call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
