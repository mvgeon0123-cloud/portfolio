import Link from 'next/link';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { supabase } from '@/lib/supabase';
import PostActions from '@/components/community/PostActions';

// 동적 라우트 — 항상 최신 글 표시(수정 직후 반영) + 정적 파라미터 수집 워커 비활성(dev 노이즈 제거)
export const dynamic = 'force-dynamic';

// 저장된 HTML은 표시 단계에서 반드시 sanitize (XSS 방지). 에디터가 만드는 태그/스타일만 허용.
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 's', 'del', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'code', 'pre', 'a', 'hr'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
  },
  allowedStyles: {
    '*': { 'text-align': [/^(left|right|center|justify)$/] },
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
