'use client';

import { HEALTH_LINK_NUMBER } from '@lhn/shared';

interface Props {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function HealthLinkDisclaimer({ open, onAccept, onDecline }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="text-center mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 text-center mb-3">Important Disclaimer</h2>
        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <p>
            This symptom assessment tool provides <strong>general guidance only</strong> and does not constitute medical advice, diagnosis, or treatment.
          </p>
          <p>
            If you are experiencing a medical emergency, <strong>call 911 immediately</strong>.
          </p>
          <p>
            For non-emergency health advice, you can call Health Link at <strong>{HEALTH_LINK_NUMBER}</strong> to speak with a registered nurse 24/7.
          </p>
          <p className="text-xs text-gray-400">
            By proceeding, you acknowledge that this tool is for informational purposes only and agree to seek professional medical attention if your condition worsens.
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onAccept}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm"
          >
            I Understand — Continue
          </button>
          <button
            onClick={onDecline}
            className="w-full py-3 text-gray-500 font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
