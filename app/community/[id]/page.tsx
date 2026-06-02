import Link from 'next/link';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { supabase } from '@/lib/supabase';
import PostActions from '@/components/community/PostActions';

// 동적 라우트 — 항상 최신 글 표시(수정 직후 반영) + 정적 파라미터 수집 워커 비활성(dev 노이즈 제거)
export const dynamic = 'force-dynamic';
// supabase fetch가 Next Data Cache에 캐시돼 수정/삭제 후 stale하게 보이는 것 방지(항상 fresh)
export const fetchCache = 'force-no-store';

// 저장된 HTML은 표시 단계에서 반드시 sanitize (XSS 방지). 에디터가 만드는 태그/스타일만 허용.
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 's', 'del', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'code', 'pre', 'a', 'hr', 'img', 'figure', 'figcaption', 'span', 'mark', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'title', 'style'],
    figure: ['style'],
    span: ['style', 'class'],
    mark: ['style', 'data-color'],
    th: ['colspan', 'rowspan', 'style'],
    td: ['colspan', 'rowspan', 'style'],
    table: ['style'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
  },
  // 이미지 src는 https/http 만 (data: 등 차단)
  allowedSchemesByTag: { img: ['https', 'http'] },
  // style은 레이아웃 관련(text-align/width)만 허용 — 위험한 속성 차단(XSS 방지)
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      width: [/^\d+(\.\d+)?(px|%)$/],
      color: [/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/, /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/, /^[a-zA-Z]+$/],
      'background-color': [/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/, /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/, /^[a-zA-Z]+$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, body, created_at, author_id')
    .eq('id', params.id)
    .single();

  if (!post) notFound();

  // 작성자 닉네임만 (이메일 노출 금지)
  let nickname = '익명';
  if (post.author_id) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', post.author_id)
      .single();
    if (prof?.nickname) nickname = prof.nickname;
  }

  // 과거 평문 글 호환: HTML 태그가 있으면 sanitize 후 렌더, 없으면 평문(줄바꿈 보존)으로 표시.
  const rawBody = post.body ?? '';
  const looksHtml = /<\/?[a-z][^>]*>/i.test(rawBody);

  return (
    <main className="comm-wrap">
      <header className="comm-head">
        <a href="/" className="comm-home">이동건</a>
      </header>
      <article className="post">
        <h1 className="post-title">{post.title}</h1>
        <p className="post-meta">
          {nickname} · {formatDate(post.created_at)}
        </p>
        {looksHtml ? (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(rawBody, SANITIZE_OPTS) }}
          />
        ) : (
          <div className="post-body">{rawBody}</div>
        )}
      </article>
      <PostActions postId={post.id} authorId={post.author_id} />
      <Link className="comm-back" href="/community">
        ← 목록으로
      </Link>
    </main>
  );
}
