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
        <a href="#top" className="nm">
          이동건
        </a>
        <div className="lk">
          <a href="#columns">Column</a>
          <a href="#channels">Instagram</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
  );
}
