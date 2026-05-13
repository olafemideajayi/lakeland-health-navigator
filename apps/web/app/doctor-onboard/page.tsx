'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface InviteData {
  name: string;
  email: string;
  specialty: string;
  clinicName: string | null;
}

interface ClinicOption {
  id: string;
  name: string;
  city: string;
}

export default function DoctorOnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <DoctorOnboardInner />
    </Suspense>
  );
}

function DoctorOnboardInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [step, setStep] = useState<'loading' | 'agreement' | 'profile' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  // Agreement state
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedConduct, setAgreedConduct] = useState(false);

  // Profile state
  const [bio, setBio] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setStep('error');
      return;
    }

    Promise.all([
      fetch(`/api/doctor-invites/verify/${token}`).then((r) => {
        if (!r.ok) throw new Error('Invalid or expired invitation');
        return r.json();
      }),
      fetch('/api/clinics').then((r) => r.json()),
    ])
      .then(([inviteData, clinicData]) => {
        setInvite(inviteData);
        setClinics(
          clinicData.map((c: any) => ({ id: c.id, name: c.name, city: c.city })),
        );
        setStep('agreement');
      })
      .catch((err) => {
        setError(err.message);
        setStep('error');
      });
  }, [token]);

  async function handleSubmit() {
    if (!clinicId || !licenseNumber) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/doctor-invites/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, licenseNumber, clinicId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to complete onboarding');
      }

      setStep('done');
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Verifying your invitation...</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Unable to Continue</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-green-600">&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Aboard!</h1>
          <p className="text-gray-500 mb-6">
            Thank you, {invite?.name}. Your profile has been created and the agreement is signed.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left space-y-3 mb-6">
            <h3 className="font-bold text-gray-800 text-sm">What happens next:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                Clinic staff will activate your on-call status when you&apos;re available
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                Patients will see you in the &quot;Available Now&quot; section
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                You&apos;ll receive a secure video link when a patient connects
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">4.</span>
                No app install needed &mdash; consultations happen in your browser
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-400">
            Questions? Contact <a href="mailto:admin@lakelandhealth.ca" className="text-primary">admin@lakelandhealth.ca</a>
          </p>
        </div>
      </div>
    );
  }

  if (step === 'agreement') {
    const allAgreed = agreedTerms && agreedPrivacy && agreedConduct;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-primary text-white px-6 py-8 text-center">
            <h1 className="text-xl font-bold">Lakeland Health Navigator</h1>
            <p className="text-sm opacity-80 mt-1">Physician Telehealth Agreement</p>
          </div>

          <div className="bg-white border-x border-b border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600 mb-1">
              Welcome, <strong>{invite?.name}</strong> ({invite?.specialty})
            </p>
            <p className="text-xs text-gray-400">
              Please review the agreement below and sign to complete your onboarding.
            </p>
          </div>

          {/* Agreement text */}
          <div className="bg-white border-x border-gray-200 px-6 py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-h-[50vh] overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
              <h2 className="font-bold text-gray-900 text-base">PHYSICIAN TELEHEALTH SERVICES AGREEMENT</h2>
              <p className="text-xs text-gray-500">Lakeland Health Navigator &mdash; Effective upon signing</p>

              <h3 className="font-bold text-gray-800 mt-4">1. PURPOSE</h3>
              <p>This Agreement governs the provision of telehealth services by the undersigned physician (&quot;Provider&quot;) through the Lakeland Health Navigator platform (&quot;Platform&quot;), operated to serve patients in the Lakeland region of Alberta, including Cold Lake, Bonnyville, Lac La Biche, and St. Paul.</p>

              <h3 className="font-bold text-gray-800">2. SCOPE OF SERVICES</h3>
              <p>The Provider agrees to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide virtual consultations within their scope of practice and specialty</li>
                <li>Be available during agreed-upon on-call hours as coordinated with clinic staff</li>
                <li>Conduct consultations via the Platform&apos;s secure video system</li>
                <li>Maintain appropriate medical documentation for each consultation</li>
                <li>Refer patients to in-person care when clinically appropriate</li>
              </ul>

              <h3 className="font-bold text-gray-800">3. LICENSURE AND QUALIFICATIONS</h3>
              <p>The Provider represents and warrants that they:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hold a valid license to practice medicine in Alberta issued by the College of Physicians &amp; Surgeons of Alberta (CPSA)</li>
                <li>Maintain active registration and good standing with the CPSA</li>
                <li>Carry professional liability insurance with minimum coverage of $5,000,000</li>
                <li>Will immediately notify the Platform of any changes to licensure status</li>
              </ul>

              <h3 className="font-bold text-gray-800">4. PRIVACY AND CONFIDENTIALITY (PHIA COMPLIANCE)</h3>
              <p>The Provider acknowledges and agrees to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Comply with the Alberta <em>Health Information Act</em> (HIA) and the <em>Personal Health Information Protection Act</em> (PHIA)</li>
                <li>Access patient health information only as necessary for providing care</li>
                <li>Conduct consultations from a private, secure location</li>
                <li>Not record, screenshot, or otherwise capture video consultations</li>
                <li>Report any privacy breaches immediately to the Platform administrator</li>
                <li>Maintain confidentiality of all patient information after termination of this Agreement</li>
              </ul>

              <h3 className="font-bold text-gray-800">5. TECHNOLOGY REQUIREMENTS</h3>
              <p>The Provider agrees to maintain:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>A reliable internet connection (minimum 10 Mbps)</li>
                <li>A device with a working camera, microphone, and speaker</li>
                <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                <li>A private, well-lit, quiet environment for consultations</li>
              </ul>

              <h3 className="font-bold text-gray-800">6. COMPENSATION</h3>
              <p>Telehealth consultations are billed through Alberta Health under existing fee schedules. The Platform does not charge physicians for use. Billing codes and procedures follow AMA guidelines for virtual care.</p>

              <h3 className="font-bold text-gray-800">7. STANDARD OF CARE</h3>
              <p>The Provider agrees to deliver care consistent with the standard of care expected of a similarly qualified physician practicing in Alberta, recognizing the limitations inherent in telehealth consultations.</p>

              <h3 className="font-bold text-gray-800">8. TERMINATION</h3>
              <p>Either party may terminate this Agreement with 30 days&apos; written notice. The Platform may immediately suspend access if the Provider&apos;s license is revoked, suspended, or subject to disciplinary action.</p>

              <h3 className="font-bold text-gray-800">9. LIMITATION OF LIABILITY</h3>
              <p>The Platform provides the technology infrastructure only. The Provider retains full clinical responsibility for medical decisions and patient care. The Platform is not liable for clinical outcomes.</p>

              <h3 className="font-bold text-gray-800">10. GOVERNING LAW</h3>
              <p>This Agreement is governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="bg-white border-x border-gray-200 px-6 py-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the <strong>Physician Telehealth Services Agreement</strong> above
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                I agree to comply with <strong>PHIA and Alberta HIA</strong> requirements for patient data privacy
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedConduct}
                onChange={(e) => setAgreedConduct(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                I confirm that I hold a <strong>valid CPSA license</strong> and carry professional liability insurance
              </span>
            </label>
          </div>

          {/* Sign button */}
          <div className="bg-white border-x border-b border-gray-200 rounded-b-xl px-6 py-5">
            <button
              onClick={() => setStep('profile')}
              disabled={!allAgreed}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all ${
                allAgreed
                  ? 'bg-primary text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              I Agree &mdash; Continue to Profile Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="bg-primary text-white px-6 py-8 text-center">
            <h1 className="text-xl font-bold">Complete Your Profile</h1>
            <p className="text-sm opacity-80 mt-1">{invite?.name} &mdash; {invite?.specialty}</p>
          </div>

          <div className="bg-white border-x border-b border-gray-200 rounded-b-xl px-6 py-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                CPSA License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g., 12345"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Primary Clinic <span className="text-red-500">*</span>
              </label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">Select a clinic...</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Professional Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description of your experience and areas of focus..."
                className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">This will be visible to patients on your profile.</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!licenseNumber || !clinicId || submitting}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all ${
                licenseNumber && clinicId && !submitting
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Creating your profile...' : 'Complete Onboarding'}
            </button>

            <button
              onClick={() => setStep('agreement')}
              className="w-full py-2 text-gray-500 text-sm font-semibold"
            >
              &larr; Back to Agreement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
