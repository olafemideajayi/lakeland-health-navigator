'use client';

import { useState } from 'react';
import { TRIAGE_LEVELS, HEALTH_LINK_NUMBER } from '@lhn/shared';

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ level: keyof typeof TRIAGE_LEVELS; recommendation: string } | null>(null);

  function selectOption(value: string) {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
      } else {
        setResult(assessTriage(newAnswers));
      }
    }, 300);
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold">🩺 Symptom Triage</h1>
        <p className="text-xs opacity-80 mt-1">Get guided to the right level of care</p>
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

        {!result ? (
          <>
            {/* Progress */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>

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
          </>
        ) : (
          /* Result */
          <div className="text-center py-6">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
              style={{ backgroundColor: TRIAGE_LEVELS[result.level].color + '20' }}
            >
              {result.level === 'EMERGENCY' ? '🚨' : result.level === 'TELEHEALTH' ? '📹' : '💚'}
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: TRIAGE_LEVELS[result.level].color }}>
              {TRIAGE_LEVELS[result.level].label}
            </h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{result.recommendation}</p>

            <button onClick={reset} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">
              Start Over
            </button>

            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-[11px] text-gray-400 leading-relaxed">
              ⚠️ This tool provides guidance only and does not replace professional medical advice.
              If you&apos;re unsure, call Health Link at <strong>{HEALTH_LINK_NUMBER}</strong> to speak with a registered nurse 24/7.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
