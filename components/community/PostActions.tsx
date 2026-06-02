'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

// 본인(author) 또는 admin 일 때만 수정/삭제 버튼 노출 (RLS가 서버에서 한 번 더 강제).
export default function PostActions({
  postId,
  authorId,
}: {
  postId: number | string;
  authorId: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [canEdit, setCanEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      if (user.id === authorId) {
        if (active) setCanEdit(true);
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (active) setCanEdit(prof?.role === 'admin');
    })();
    return () => {
      active = false;
    };
  }, [supabase, authorId]);

  async function onDelete() {
    if (!confirm('이 글을 삭제할까요?')) return;
    setError(null);
    setBusy(true);
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    setBusy(false);
    if (error) {
      setError(`삭제 실패: ${error.message}`);
      return;
    }
    router.push('/community');
    router.refresh();
  }

  if (!canEdit) return null;

  return (
    <>
      <div className="post-actions">
        <Link className="post-act" href={`/community/write?edit=${postId}`}>
          수정
        </Link>
        <button className="post-act danger" onClick={onDelete} disabled={busy}>
          {busy ? '삭제 중…' : '삭제'}
        </button>
      </div>
      {error && <p className="auth-msg err post-err">{error}</p>}
    </>
  );
}
