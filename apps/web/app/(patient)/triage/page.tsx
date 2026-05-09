'use client';

import { useState, useEffect } from 'react';
import { TRIAGE_LEVELS, HEALTH_LINK_NUMBER } from '@lhn/shared';
import { HealthLinkDisclaimer } from '@/components/ui/health-link-disclaimer';

const steps = [
  {
    question: 'What best describes your primary concern?',
    options: [
      { value: 'pain', icon: '🩹', label: 'Pain or discomfort' },
      { value: 'illness', icon: '🤒', label: 'Feeling unwell (fever, nausea, fatigue)' },
      { value: 'skin', icon: '🩸', label: 'Skin issue (rash, wound, swelling)' },
      { value: 'mental', icon: '🧠', label: 'Mental health concern' },
      { value: 'chronic', icon: '💊', label: 'Chronic condition follow-up' },
      { value: 'other', icon: '❓', label: 'Something else' },
    ],
  },
  {
    question: 'How long have you been experiencing this?',
    options: [
      { value: 'hours', icon: '⏰', label: 'Less than 24 hours' },
      { value: 'days', icon: '📅', label: '1-3 days' },
      { value: 'week', icon: '📆', label: 'More than a week' },
      { value: 'ongoing', icon: '🔄', label: "It's an ongoing/recurring issue" },
    ],
  },
  {
    question: 'How would you rate the severity?',
    options: [
      { value: 'mild', icon: '🟢', label: 'Mild — uncomfortable but manageable' },
      { value: 'moderate', icon: '🟠', label: 'Moderate — affecting daily activities' },
      { value: 'severe', icon: '🔴', label: 'Severe — significant pain or distress' },
    ],
  },
];

function assessTriage(answers: Record<number, string>) {
  const severity = answers[2];
  const concern = answers[0];

  if (severity === 'severe') {
    return { level: 'EMERGENCY' as const, recommendation: 'Visit your nearest emergency department for prompt evaluation.' };
  }
  if (severity === 'moderate' && concern === 'pain') {
    return { level: 'URGENT' as const, recommendation: 'Visit urgent care within the next few hours.' };
  }
  if (concern === 'mental' || concern === 'chronic') {
    return { level: 'TELEHEALTH' as const, recommendation: 'A telehealth consultation with a specialist is recommended.' };
  }
  if (severity === 'moderate') {
    return { level: 'TELEHEALTH' as const, recommendation: 'Your concern can likely be addressed through a video consultation.' };
  }
  return { level: 'WALK_IN' as const, recommendation: 'A walk-in clinic visit is appropriate for your symptoms.' };
}

export default function TriagePage() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ level: keyof typeof TRIAGE_LEVELS; recommendation: string } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Check if disclaimer was already accepted this session
  useEffect(() => {
    if (sessionStorage.getItem('triage-disclaimer-accepted')) {
      setShowDisclaimer(false);
      setDisclaimerAccepted(true);
    }
  }, []);

  function handleDisclaimerAccept() {
    setShowDisclaimer(false);
    setDisclaimerAccepted(true);
    sessionStorage.setItem('triage-disclaimer-accepted', 'true');
  }

  function handleDisclaimerDecline() {
    window.history.back();
  }

  function selectOption(value: string) {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
      } else {
        const triageResult = assessTriage(newAnswers);
        setResult(triageResult);
        // Save result offline for later sync
        saveResultLocally(newAnswers, triageResult);
      }
    }, 300);
  }

  function saveResultLocally(answers: Record<number, string>, triageResult: { level: string; recommendation: string }) {
    try {
      const saved = JSON.parse(localStorage.getItem('triage-results') || '[]');
      saved.push({
        answers,
        result: triageResult,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      localStorage.setItem('triage-results', JSON.stringify(saved));

      // Try to sync to server if online
      if (navigator.onLine) {
        syncResults();
      }
    } catch (e) {
      // localStorage might be full or unavailable
    }
  }

  async function syncResults() {
    try {
      const saved = JSON.parse(localStorage.getItem('triage-results') || '[]');
      const unsynced = saved.filter((r: any) => !r.synced);

      for (const entry of unsynced) {
        await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: {
              concern: entry.answers[0],
              duration: entry.answers[1],
              severity: entry.answers[2],
            },
            disclaimerAcked: true,
          }),
        });
        entry.synced = true;
      }

      localStorage.setItem('triage-results', JSON.stringify(saved));
    } catch (e) {
      // Will retry next time online
    }
  }

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => syncResults();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  function reset() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  if (!disclaimerAccepted) {
    return (
      <div className="pb-20">
        <header className="bg-primary text-white px-5 pt-12 pb-5">
          <h1 className="text-xl font-bold">🩺 Symptom Triage</h1>
          <p className="text-xs opacity-80 mt-1">Get guided to the right level of care</p>
        </header>
        <HealthLinkDisclaimer
          open={showDisclaimer}
          onAccept={handleDisclaimerAccept}
          onDecline={handleDisclaimerDecline}
        />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">🩺 Symptom Triage</h1>
        <p className="text-xs opacity-80 mt-1">
          Get guided to the right level of care
          {isOffline && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-[10px]">Offline Mode</span>}
        </p>
      </header>

      <div className="p-4">
        {/* Emergency warning */}
        <div className="mb-4 p-3.5 bg-warning-light border border-warning/20 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-warning">If this is an emergency, call 911</p>
            <p className="text-xs text-warning/70">This tool helps guide non-emergency care decisions</p>
          </div>
        </div>

        {/* Offline indicator */}
        {isOffline && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-3">
            <span className="text-lg">📡</span>
            <p className="text-xs text-gray-600">
              <strong>Offline mode active.</strong> Triage works without internet. Results will sync when you reconnect.
            </p>
          </div>
        )}

        {!result ? (
          <>
            {/* Progress */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>

            {/* Step indicator */}
            <p className="text-xs text-gray-400 font-semibold mb-2">Step {step + 1} of 3</p>

            {/* Question */}
            <h2 className="text-[17px] font-bold text-gray-800 mb-4">{steps[step].question}</h2>
            <div className="space-y-2.5">
              {steps[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className={`w-full p-3.5 border rounded-xl text-left flex items-center gap-3 transition-all ${
                    answers[step] === opt.value
                      ? 'border-primary bg-primary-light text-primary font-semibold'
                      : 'border-gray-200 text-gray-700 hover:border-primary hover:bg-primary-light'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Back button */}
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-4 text-sm text-gray-500 font-semibold"
              >
                ← Back
              </button>
            )}
          </>
        ) : (
          /* Result */
          <div className="text-center py-6">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
              style={{ backgroundColor: TRIAGE_LEVELS[result.level].color + '20' }}
            >
              {result.level === 'EMERGENCY' ? '🚨' : result.level === 'URGENT' ? '⚡' : result.level === 'TELEHEALTH' ? '📹' : '💚'}
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: TRIAGE_LEVELS[result.level].color }}>
              {TRIAGE_LEVELS[result.level].label}
            </h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{result.recommendation}</p>

            {/* Recommended action */}
            {result.level === 'EMERGENCY' && (
              <a href="tel:911" className="block w-full py-3.5 bg-danger text-white rounded-xl font-semibold mb-3">
                📞 Call 911
              </a>
            )}
            {result.level === 'TELEHEALTH' && (
              <a href="/telehealth" className="block w-full py-3.5 bg-primary text-white rounded-xl font-semibold mb-3">
                📹 Book Telehealth Now
              </a>
            )}
            {(result.level === 'WALK_IN' || result.level === 'URGENT') && (
              <a href="/" className="block w-full py-3.5 bg-primary text-white rounded-xl font-semibold mb-3">
                🏥 View Nearby Clinics
              </a>
            )}

            <button onClick={reset} className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm">
              Start Over
            </button>

            {/* Health Link reminder */}
            <div className="mt-4 p-4 bg-primary-light border border-primary/10 rounded-xl text-left">
              <p className="text-sm font-semibold text-primary mb-1">Not sure? Call Health Link</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Speak with a registered nurse 24/7 for free health advice.
              </p>
              <a href="tel:811" className="inline-block mt-2 text-sm font-bold text-primary">
                📞 Call {HEALTH_LINK_NUMBER}
              </a>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-[11px] text-gray-400 leading-relaxed text-left">
              ⚠️ This tool provides guidance only and does not replace professional medical advice.
              Always seek professional attention if your condition worsens or you are unsure.
            </div>

            {isOffline && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-[11px] text-yellow-700 font-semibold">
                📡 Result saved locally — will sync when you&apos;re back online.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
