'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('email not confirmed')) {
        setError('이메일 인증이 완료되지 않았습니다. 받은 메일의 링크를 눌러 인증을 완료해 주세요.');
      } else if (msg.includes('invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(error.message);
      }
      return;
    }
    // 로그인 성공 → 홈으로
    router.push('/');
    router.refresh();
  }

  async function onResetPassword() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('비밀번호를 재설정할 이메일을 먼저 입력해 주세요.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/login`,
    });
    if (error) setError(error.message);
    else setInfo('비밀번호 재설정 메일을 보냈어요. 메일을 확인해 주세요.');
  }

  return (
    <main className="auth-wrap">
      <a href="/" className="auth-home">이동건</a>
      <h1>로그인</h1>
      <p className="auth-sub">이메일과 비밀번호로 로그인합니다.</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="auth-field">
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="auth-msg err">{error}</p>}
        {info && <p className="auth-msg ok">{info}</p>}
        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
        <div className="auth-links">
          <button type="button" className="auth-link" onClick={onResetPassword}>
            비밀번호 재설정
          </button>
          <a href="/signup">계정이 없으신가요? 회원가입</a>
        </div>
      </form>
    </main>
  );
}
