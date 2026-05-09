'use client';

import { useState, useEffect } from 'react';

interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
}

interface StaffAuth {
  user: StaffUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useStaffAuth(): StaffAuth {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('staff_token');
    const storedUser = localStorage.getItem('staff_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/signin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    localStorage.setItem('staff_token', data.access_token);
    localStorage.setItem('staff_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    setToken(null);
    setUser(null);
  }

  return { user, token, loading, login, logout };
}

export function getStaffToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('staff_token');
}

export function staffFetch(path: string, token: string, options?: RequestInit) {
  return fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  }).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  });
}
