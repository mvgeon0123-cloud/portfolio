import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import WriteButton from '@/components/community/WriteButton';

export const revalidate = 30;

type PostRow = { id: number; title: string; created_at: string; author_id: string };

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default async function CommunityPage() {
  // 글 목록 — 최신순 (읽기는 anon 가능)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, created_at, author_id')
    .order('created_at', { ascending: false });

  if (error) console.error('[community] posts 조회 실패:', error.message);
  const list = (posts ?? []) as PostRow[];

  // 작성자 닉네임만 표시 (이메일 노출 금지) — author_id → profiles.nickname 매핑
  const authorIds = Array.from(new Set(list.map((p) => p.author_id).filter(Boolean)));
  const nickById = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', authorIds);
    for (const p of (profs ?? []) as { id: string; nickname: string }[]) {
      nickById.set(p.id, p.nickname);
    }
  }

  return (
    <main className="comm-wrap">
      <header className="comm-head">
        <a href="/" className="comm-home">이동건</a>
        <WriteButton />
      </header>
      <h1 className="comm-title">Community</h1>

      {list.length === 0 ? (
        <p className="comm-empty">아직 글이 없습니다.</p>
      ) : (
        <ul className="comm-list">
          {list.map((post) => (
            <li key={post.id}>
              <Link className="comm-item" href={`/community/${post.id}`}>
                <span className="comm-item-title">{post.title}</span>
                <span className="comm-item-meta">
                  {nickById.get(post.author_id) ?? '익명'} · {formatDate(post.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
