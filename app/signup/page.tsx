'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SignupPage() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nick = nickname.trim();
    if (!nick) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nick }, // 가입 트리거가 profiles.nickname 에 저장
        emailRedirectTo: `${location.origin}/login`,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Confirm email 켜진 상태에서 이미 가입된 이메일이면 identities가 빈 배열(이메일 enumeration 보호)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('이미 가입된 이메일입니다. 로그인해 주세요.');
      return;
    }
    setSent(true);
  }

  return (
    <main className="auth-wrap">
      <a href="/" className="auth-home">이동건</a>
      <h1>회원가입</h1>
      <p className="auth-sub">이메일·닉네임·비밀번호로 가입합니다.</p>

      {sent ? (
        <div className="auth-msg ok">
          확인 메일을 보냈어요. 메일의 링크를 눌러 인증을 완료하세요.
          <br />
          인증을 마친 뒤 <a className="auth-inline" href="/login">로그인</a>할 수 있습니다.
        </div>
      ) : (
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
            <span>닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={20}
              autoComplete="nickname"
              placeholder="표시될 이름"
            />
          </label>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="auth-msg err">{error}</p>}
          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? '가입 중…' : '회원가입'}
          </button>
          <div className="auth-links">
            <a href="/login">이미 계정이 있으신가요? 로그인</a>
          </div>
        </form>
      )}
    </main>
  );
}
