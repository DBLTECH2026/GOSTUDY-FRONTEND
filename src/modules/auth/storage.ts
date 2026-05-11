'use client';

import type { AuthSession } from './types';

const KEY = 'gostudy_session';

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(session));
  document.cookie = `gostudy_token=${session.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  document.cookie = 'gostudy_token=; path=/; max-age=0';
}
