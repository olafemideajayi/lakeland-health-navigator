'use client';

import { useState } from 'react';

export default function StaffControlsPage() {
  const [waitMinutes, setWaitMinutes] = useState(15);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(3);
  const [walkInOpen, setWalkInOpen] = useState(true);
  const [telehealthOpen, setTelehealthOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function updateWaitTime() {
    setSaving(true);
    try {
      await fetch('/api/staff/wait-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: 'demo-clinic',
          minutes: waitMinutes,
          patientsWaiting: Math.ceil(waitMinutes / 5),
          capacity: 12,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">⚙️ Clinic Controls</h1>
        <p className="text-xs opacity-80 mt-1">Cold Lake Health Centre</p>
      </header>

      <div className="p-4 space-y-4">
        {/* Wait Time Control */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Current Wait Time</h3>
                <p className="text-xs text-gray-400">Last updated 2 min ago</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWaitMinutes(Math.max(0, waitMinutes - 5))}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-800 min-w-[40px] text-center">{waitMinutes}</span>
                <span className="text-xs text-gray-500">min</span>
                <button
                  onClick={() => setWaitMinutes(waitMinutes + 5)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Doctors on duty */}
          <div className="p-4 border-b border-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Doctors on Duty</h3>
                <p className="text-xs text-gray-400">Shift change at 7 PM</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDoctorsOnDuty(Math.max(0, doctorsOnDuty - 1))}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-800 min-w-[30px] text-center">{doctorsOnDuty}</span>
                <button
                  onClick={() => setDoctorsOnDuty(doctorsOnDuty + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:border-primary hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="p-4 border-b border-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Accepting Walk-ins</h3>
                <p className="text-xs text-gray-400">Toggle availability</p>
              </div>
              <button
                onClick={() => setWalkInOpen(!walkInOpen)}
                className={`w-12 h-7 rounded-full relative transition-colors ${walkInOpen ? 'bg-accent' : 'bg-gray-300'}`}
              >
                <span className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-sm transition-transform ${walkInOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Telehealth Available</h3>
                <p className="text-xs text-gray-400">Video consult room</p>
              </div>
              <button
                onClick={() => setTelehealthOpen(!telehealthOpen)}
                className={`w-12 h-7 rounded-full relative transition-colors ${telehealthOpen ? 'bg-accent' : 'bg-gray-300'}`}
              >
                <span className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-sm transition-transform ${telehealthOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={updateWaitTime}
          disabled={saving}
          className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
            saved ? 'bg-accent' : 'bg-primary hover:bg-primary-dark'
          } ${saving ? 'opacity-60' : ''}`}
        >
          {saved ? '✓ Updated Successfully' : saving ? 'Saving...' : 'Update Clinic Status'}
        </button>
      </div>
    </div>
  );
}
