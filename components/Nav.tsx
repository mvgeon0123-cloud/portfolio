'use client';

import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-browser';

// index.html <script>: addEventListener('scroll', () => n.classList.toggle('on', scrollY > 8))
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('on', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <nav id="nav" ref={navRef}>
      <div className="in">
        <a href="#top" className="nm">
          이동건
        </a>
        <div className="lk">
          <a href="#columns">Column</a>
          <a href="#channels">Instagram</a>
          <a href="#contact">Contact</a>
          <a href="/community">Community</a>
          {user ? (
            <>
              <span className="nav-user" title={user.email ?? ''}>
                {user.email ?? '내 계정'}
              </span>
              <button className="nav-auth-btn" onClick={() => supabase.auth.signOut()}>
                로그아웃
              </button>
            </>
          ) : (
            <a href="/login">로그인</a>
          )}
        </div>
      </div>
    </nav>
  );
}
