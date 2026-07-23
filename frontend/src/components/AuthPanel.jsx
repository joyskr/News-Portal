'use client';

import { useState } from 'react';
import { API_URL } from '../lib/api';

export default function AuthPanel({ onClose }) {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('Browsing is open. Sign in only if you want a personal account.');

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`${API_URL}/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('newsToken', data.token);
      setMessage(`Welcome, ${data.user.name}!`);
    } else {
      setMessage(data.error || 'Authentication failed.');
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="auth-card modal-card" role="dialog" aria-modal="true" aria-label="Account" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close account dialog">X</button>
        <p className="eyebrow">Account</p>
        <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p>{message}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <input name="name" placeholder="Name" required />}
          <input name="email" placeholder="Email" type="email" required />
          <input name="password" placeholder="Password" type="password" minLength={8} required />
          <button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="link-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </aside>
    </div>
  );
}
