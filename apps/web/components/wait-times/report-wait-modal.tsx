'use client';

import { useState } from 'react';

interface Props {
  clinicId: string;
  clinicName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const QUICK_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function ReportWaitModal({ clinicId, clinicName, onClose, onSubmitted }: Props) {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    const waitTime = minutes ?? parseInt(customMinutes);
    if (!waitTime || waitTime < 1) return;

    setSubmitting(true);
    try {
      await fetch('/api/wait-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          minutesWaited: waitTime,
          visitReason: reason || undefined,
        }),
      });
      setDone(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Report Your Wait Time</h2>
          <button onClick={onClose} className="text-white/80 text-xl font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-lg font-bold text-gray-800 mt-3">Thanks for reporting!</p>
            <p className="text-sm text-gray-500 mt-1">This helps other patients plan their visit.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              How long did you wait at <strong>{clinicName}</strong>?
            </p>

            {/* Quick select grid */}
            <div className="grid grid-cols-3 gap-2">
              {QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setMinutes(opt); setCustomMinutes(''); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    minutes === opt
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {opt < 60 ? `${opt} min` : `${opt / 60}h ${opt % 60 ? (opt % 60) + 'm' : ''}`}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">or</span>
              <input
                type="number"
                min="1"
                max="480"
                placeholder="Custom minutes"
                value={customMinutes}
                onChange={(e) => { setCustomMinutes(e.target.value); setMinutes(null); }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500">min</span>
            </div>

            {/* Optional reason */}
            <input
              type="text"
              placeholder="Visit reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            />

            <button
              onClick={submit}
              disabled={submitting || (!minutes && !customMinutes)}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Anonymous — helps other patients estimate wait times
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
