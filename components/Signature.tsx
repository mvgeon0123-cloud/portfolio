'use client';

import { useEffect, useRef } from 'react';
import { SIG_PATH } from './signature-path';

// index.html 사인 애니메이션을 그대로 포팅:
// mask(#sm) 안의 흰색 path(#rvp)를 stroke-dashoffset 으로 그려서 <image>(서명 PNG)를 드러냄.
// L = 6963, dur = 3800ms, delay = 300ms, ease = easeInOutCubic — 원본과 동일.
export default function Signature() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;

    const L = 6963;
    const dur = 3800;
    const delay = 300;
    let t0: number | null = null;
    let rafId = 0;

    const ease = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const el = ts - t0 - delay;
      if (el < 0) {
        rafId = requestAnimationFrame(step);
        return;
      }
      let k = el / dur;
      if (k > 1) k = 1;
      p.style.strokeDashoffset = (L * (1 - ease(k))).toFixed(1);
      if (k < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        p.style.strokeDashoffset = '0';
      }
    };

    p.style.strokeDasharray = String(L);
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <svg
      className="sig"
      viewBox="0 0 1353 589"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-label="signature"
    >
      <defs>
        <mask id="sm" maskUnits="userSpaceOnUse" x="0" y="0" width="1353" height="589">
          <rect x="0" y="0" width="1353" height="589" fill="#000" />
          <path
            ref={pathRef}
            id="rvp"
            d={SIG_PATH}
            fill="none"
            stroke="#fff"
            strokeWidth="32.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <image
        x="0"
        y="0"
        width="1353"
        height="589"
        xlinkHref="/signature.png"
        mask="url(#sm)"
      />
    </svg>
  );
}
