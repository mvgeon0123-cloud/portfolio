'use client';

import { Node } from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from '@tiptap/react';

function domainOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}

// 에디터 표시용 NodeView — 편집 중엔 이동 안 함(카드 모양만). 저장/상세는 renderHTML의 <a>.
function LinkCardView({ node }: NodeViewProps) {
  const href = (node.attrs.href as string) || '';
  return (
    <NodeViewWrapper className="link-card-nv">
      <span className="link-card" contentEditable={false}>
        <span className="lc-domain">{domainOf(href)}</span>
        <span className="lc-url">{href}</span>
      </span>
    </NodeViewWrapper>
  );
}

// 링크 카드: URL을 별도 블록으로 넣으면 도메인+URL 카드로 표시. (og 크롤링 없음)
const LinkCard = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return { href: { default: null } };
  },

  parseHTML() {
    return [
      {
        tag: 'a.link-card',
        getAttrs: (el) => ({ href: (el as HTMLElement).getAttribute('href') }),
      },
    ];
  },

  renderHTML({ node }) {
    const href = (node.attrs.href as string) || '#';
    return [
      'a',
      { class: 'link-card', href, target: '_blank', rel: 'noopener noreferrer' },
      ['span', { class: 'lc-domain' }, domainOf(href)],
      ['span', { class: 'lc-url' }, href],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },
});

export default LinkCard;
