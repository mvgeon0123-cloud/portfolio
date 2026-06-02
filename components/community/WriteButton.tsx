'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

// 로그인한 사용자에게만 "글쓰기" 버튼 노출 (작성 페이지는 다음 단계 C-3에서 구현).
export default function WriteButton() {
  const [supabase] = useState(() => createClient());
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!loggedIn) return null;
  return (
    <Link className="comm-write-btn" href="/community/write">
      글쓰기
    </Link>
  );
}
