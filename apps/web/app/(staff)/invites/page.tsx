'use client';

import { useEffect, useState } from 'react';
import { useStaffAuth, staffFetch } from '../../../lib/use-staff-auth';

interface Invite {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialty: string;
  clinicName: string | null;
  status: string;
  agreementSigned: boolean;
  sentAt: string;
  expiresAt: string;
  token: string;
}

interface InviteResult {
  invite: Invite;
  inviteUrl: string;
  emailContent: { subject: string; text: string; html: string };
  smsContent?: string;
}

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Surgery',
  'Urology',
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
};

export default function InvitesPage() {
  const { user, token } = useStaffAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formClinicName, setFormClinicName] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadInvites();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function loadInvites() {
    if (!token) return;
    staffFetch('/api/doctor-invites', token)
      .then((data) => setInvites(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !formName || !formEmail || !formSpecialty) return;
    setFormError('');
    setSending(true);

    try {
      const result: InviteResult = await staffFetch('/api/doctor-invites', token, {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          specialty: formSpecialty,
          clinicName: formClinicName || undefined,
        }),
      });

      setShowResult(result);
      setShowForm(false);
      resetForm();
      loadInvites();
    } catch {
      setFormError('Failed to create invitation. Please try again.');
    }
    setSending(false);
  }

  function resetForm() {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSpecialty('');
    setFormClinicName('');
    setFormError('');
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }

  const pending = invites.filter((i) => i.status === 'pending');
  const completed = invites.filter((i) => i.status !== 'pending');

  return (
    <div className="pb-20">
      <header className="bg-primary text-white px-5 pt-12 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Doctor Invitations</h1>
            <p className="text-xs opacity-80 mt-1">
              {loading ? '...' : `${pending.length} pending, ${completed.length} completed`}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setShowResult(null); }}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Invite
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Invite Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 safe-bottom max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Invite a Doctor</h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 text-xl">&times;</button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane.smith@clinic.ca"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(780) 555-0123"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty *</label>
                  <select
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                    required
                  >
                    <option value="">Select specialty...</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Clinic / Institution (optional)</label>
                  <input
                    type="text"
                    value={formClinicName}
                    onChange={(e) => setFormClinicName(e.target.value)}
                    placeholder="e.g., U of A Hospital, Cold Lake Medical Clinic"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}

                <button
                  type="submit"
                  disabled={sending || !formName || !formEmail || !formSpecialty}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                    sending ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'
                  }`}
                >
                  {sending ? 'Creating invite...' : 'Create Invitation'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Result — show email/link to copy */}
        {showResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">&#10003;</span>
              <h3 className="font-bold text-green-800">Invitation Created for {showResult.invite.name}</h3>
            </div>

            {/* Invite Link */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Invite Link (share directly):</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={showResult.inviteUrl}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                />
                <button
                  onClick={() => copyToClipboard(showResult.inviteUrl, 'link')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    copied === 'link' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Email Content */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Email (copy and send via your email client):</p>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => copyToClipboard(showResult.emailContent.subject, 'subject')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    copied === 'subject' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {copied === 'subject' ? 'Copied!' : 'Copy Subject'}
                </button>
                <button
                  onClick={() => copyToClipboard(showResult.emailContent.html, 'html')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    copied === 'html' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {copied === 'html' ? 'Copied!' : 'Copy Email HTML'}
                </button>
                <button
                  onClick={() => copyToClipboard(showResult.emailContent.text, 'text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    copied === 'text' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {copied === 'text' ? 'Copied!' : 'Copy Plain Text'}
                </button>
              </div>

              {/* Mailto link */}
              <a
                href={`mailto:${showResult.invite.email}?subject=${encodeURIComponent(showResult.emailContent.subject)}&body=${encodeURIComponent(showResult.emailContent.text)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Open in Email App
              </a>
            </div>

            {/* SMS */}
            {showResult.invite.phone && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">SMS:</p>
                <div className="flex gap-2">
                  <a
                    href={`sms:${showResult.invite.phone}?body=${encodeURIComponent((showResult as any).smsContent || '')}`}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-semibold"
                  >
                    Send SMS
                  </a>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowResult(null)}
              className="text-sm text-gray-500 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pending Invites */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">&#9993;</span>
            <p className="text-gray-500 font-semibold">No invitations sent yet</p>
            <p className="text-gray-400 text-sm mt-1">Tap &quot;+ Invite&quot; to invite a doctor to join the platform</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3">Pending ({pending.length})</h2>
                <div className="space-y-2">
                  {pending.map((inv) => (
                    <div key={inv.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{inv.name}</h3>
                          <p className="text-xs text-primary font-semibold">{inv.specialty}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{inv.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[inv.status]}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] text-gray-400">Sent {timeAgo(inv.sentAt)}</span>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/doctor-onboard?token=${inv.token}`;
                            copyToClipboard(url, inv.id);
                          }}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                            copied === inv.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {copied === inv.id ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3">Completed ({completed.length})</h2>
                <div className="space-y-2">
                  {completed.map((inv) => (
                    <div key={inv.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 opacity-70">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{inv.name}</h3>
                          <p className="text-xs text-gray-500">{inv.specialty} &bull; {inv.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[inv.status]}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
