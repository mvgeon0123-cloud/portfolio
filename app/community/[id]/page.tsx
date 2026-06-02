import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PostActions from '@/components/community/PostActions';

// 동적 라우트 — 항상 최신 글 표시(수정 직후 반영) + 정적 파라미터 수집 워커 비활성(dev 노이즈 제거)
export const dynamic = 'force-dynamic';

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
        {/* 본문: 지금은 일반 텍스트, 줄바꿈 보존(white-space:pre-wrap). 리치 서식은 다음 단계. */}
        <div className="post-body">{post.body}</div>
      </article>
      <PostActions postId={post.id} authorId={post.author_id} />
      <Link className="comm-back" href="/community">
        ← 목록으로
      </Link>
    </main>
  );
}
