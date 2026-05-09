'use client';

import { useState } from 'react';
import { useStaffAuth } from '../../lib/use-staff-auth';

export function StaffAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useStaffAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
        <header className="bg-primary text-white px-5 pt-12 pb-6 text-center">
          <h1 className="text-xl font-bold">Staff Login</h1>
          <p className="text-xs opacity-80 mt-1">Lakeland Health Navigator</p>
        </header>
        <form
          className="p-6 space-y-4 flex-1"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setSubmitting(true);
            try {
              await login(email, password);
            } catch {
              setError('Invalid email or password');
            }
            setSubmitting(false);
          }}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              placeholder="staff@coldlake.health"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
