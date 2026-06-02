'use client';

import { useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-browser';
import LoginForm from '@/components/admin/LoginForm';
import ColumnManager from '@/components/admin/ColumnManager';

export default function AdminPage() {
  const [supabase] = useState<SupabaseClient>(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <main className="admin-wrap">
      <header className="admin-head">
        <h1>칼럼 관리</h1>
        {session && (
          <button className="admin-btn ghost" onClick={() => supabase.auth.signOut()}>
            로그아웃
          </button>
        )}
      </header>

      {loading ? (
        <p className="admin-muted">로딩 중…</p>
      ) : session ? (
        <ColumnManager supabase={supabase} userEmail={session.user.email ?? ''} />
      ) : (
        <LoginForm supabase={supabase} />
      )}
    </main>
  );
}
