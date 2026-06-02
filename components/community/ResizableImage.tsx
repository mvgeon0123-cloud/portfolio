'use client';

import { useRef } from 'react';
import Image from '@tiptap/extension-image';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from '@tiptap/react';

type ImgAttrs = {
  src: string;
  alt: string | null;
  width: string | null;
  align: string; // 'left' | 'center' | 'right'
  caption: string;
};

// 에디터용 NodeView: 이미지 + 드래그 리사이즈 핸들 + 정렬 버튼 + 캡션 입력
function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, align, caption } = node.attrs as ImgAttrs;
  const imgRef = useRef<HTMLImageElement>(null);

  function startResize(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const startX = e.clientX;
    const startW = img.getBoundingClientRect().width;
    const maxW = img.naturalWidth || 2000;
    const move = (ev: PointerEvent) => {
      const next = Math.round(startW + (ev.clientX - startX));
      const clamped = Math.max(60, Math.min(next, maxW));
      updateAttributes({ width: `${clamped}px` });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const setAlign = (a: 'left' | 'center' | 'right') => updateAttributes({ align: a });

  return (
    <NodeViewWrapper
      className="img-nv"
      style={{ textAlign: (align as React.CSSProperties['textAlign']) || 'center' }}
    >
      <span
        className={`img-nv-frame${selected ? ' selected' : ''}`}
        contentEditable={false}
        style={{ width: width || undefined }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ''}
          draggable={false}
          style={{ width: width || undefined }}
        />
        {selected && (
          <span className="img-nv-controls">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('left')} title="왼쪽 정렬">좌</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('center')} title="가운데 정렬">중</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('right')} title="오른쪽 정렬">우</button>
          </span>
        )}
        {selected && (
          <span className="img-nv-handle" onPointerDown={startResize} title="드래그하여 크기 조절" />
        )}
      </span>
      <input
        className="img-nv-caption"
        value={caption ?? ''}
        placeholder="캡션 입력 (선택)"
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </NodeViewWrapper>
  );
}

// @tiptap/extension-image 를 확장 — 노드명 'image' 유지(=> 업로드 흐름 setImage 그대로).
// 저장 형식: <figure class="post-figure" style="text-align:..."><img style="width:..."><figcaption>캡션</figcaption></figure>
// 과거 단순 <img> 글도 파싱 호환.
const ResizableImage = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      align: { default: 'center' },
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure.post-figure',
        getAttrs: (el) => {
          const fig = el as HTMLElement;
          const img = fig.querySelector('img');
          const cap = fig.querySelector('figcaption');
          return {
            src: img?.getAttribute('src') || null,
            alt: img?.getAttribute('alt') || null,
            width:
              (img as HTMLElement | null)?.style.width ||
              img?.getAttribute('width') ||
              null,
            align: fig.style.textAlign || 'center',
            caption: cap?.textContent || '',
          };
        },
      },
      {
        // 과거 단순 <img> 호환
        tag: 'img[src]',
        getAttrs: (el) => {
          const img = el as HTMLElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.style.width || img.getAttribute('width') || null,
            align: 'center',
            caption: '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, width, align, caption } = node.attrs as ImgAttrs;
    const imgAttrs: Record<string, string> = { src };
    if (alt) imgAttrs.alt = alt;
    if (width) imgAttrs.style = `width:${width}`;
    const out: unknown[] = [
      'figure',
      { class: 'post-figure', style: `text-align:${align || 'center'}` },
      ['img', imgAttrs],
    ];
    if (caption && caption.trim()) out.push(['figcaption', {}, caption]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return out as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export default ResizableImage;
