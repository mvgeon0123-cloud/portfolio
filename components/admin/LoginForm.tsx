'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function LoginForm({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    // 성공 시 부모의 onAuthStateChange 가 세션을 갱신해 관리 화면으로 전환됨
  }

  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <h2>로그인</h2>
      <label className="admin-field">
        <span>이메일</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label className="admin-field">
        <span>비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button className="admin-btn" type="submit" disabled={busy}>
        {busy ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}
