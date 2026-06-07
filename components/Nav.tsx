'use client';

import { useEffect, useRef } from 'react';

// index.html <script>: addEventListener('scroll', () => n.classList.toggle('on', scrollY > 8))
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('on', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav id="nav" ref={navRef}>
      <div className="in">
        <a href="#top" className="nm" aria-label="홈">
          {/* 로고/이름 텍스트는 숨김 처리(자리는 유지). 필요 시 아래 글자만 노출하면 됨. */}
          <span style={{ visibility: 'hidden' }} aria-hidden="true">
            이동건
          </span>
        </a>
        <div className="lk">
          <a href="#columns">Column</a>
          <a href="#channels">Instagram</a>
          <a href="#contact">Contact</a>
          {/* 커뮤니티·로그인 진입점은 숨김 처리(라우트/페이지는 유지). 필요 시 아래 복구.
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
          )} */}
        </div>
      </div>
    </nav>
  );
}
