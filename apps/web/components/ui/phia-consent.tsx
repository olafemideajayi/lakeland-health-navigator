'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'lhn_phia_consent';

export function PhiaConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem(CONSENT_KEY);
    if (!consented) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom">
        <div className="text-center mb-4">
          <span className="text-3xl">🔒</span>
          <h2 className="text-lg font-bold text-gray-800 mt-2">Health Information Privacy</h2>
        </div>

        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <p>
            Lakeland Health Navigator collects and processes personal health information in accordance with
            Alberta&apos;s <strong>Health Information Act (HIA)</strong> and the{' '}
            <strong>Personal Health Information Protection Act (PHIA)</strong>.
          </p>
          <p>By continuing, you acknowledge that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your health data is stored securely in Canada (ca-central-1)</li>
            <li>Information is only shared with your authorized healthcare providers</li>
            <li>You may request access to or deletion of your data at any time</li>
            <li>Telehealth sessions are not recorded unless explicitly consented</li>
            <li>Triage results are guidance only — not a medical diagnosis</li>
          </ul>
        </div>

        <button
          onClick={accept}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-sm"
        >
          I Understand & Consent
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-3">
          For questions, contact privacy@lakelandhealth.ca
        </p>
      </div>
    </div>
  );
}
