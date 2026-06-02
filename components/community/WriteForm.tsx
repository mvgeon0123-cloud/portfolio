'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

type Status = 'loading' | 'guest' | 'forbidden' | 'ready';

export default function WriteForm({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        if (active) setStatus('guest');
        return;
      }
      if (active) setUserId(user.id);

      if (editId) {
        // 기존 글 로드 + 권한(본인 또는 admin) 확인
        const { data: post, error } = await supabase
          .from('posts')
          .select('title, body, author_id')
          .eq('id', editId)
          .single();
        if (!active) return;
        if (error || !post) {
          setError('글을 찾을 수 없습니다.');
          setStatus('forbidden');
          return;
        }
        let allowed = post.author_id === user.id;
        if (!allowed) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          allowed = prof?.role === 'admin';
        }
        if (!active) return;
        if (!allowed) {
          setStatus('forbidden');
          return;
        }
        setTitle(post.title ?? '');
        setBody(post.body ?? '');
      }
      if (active) setStatus('ready');
    })();
    return () => {
      active = false;
    };
  }, [supabase, editId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError('제목과 본문을 모두 입력해 주세요.');
      return;
    }
    setBusy(true);

    if (editId) {
      const { error } = await supabase
        .from('posts')
        .update({ title: title.trim(), body, updated_at: new Date().toISOString() })
        .eq('id', editId);
      setBusy(false);
      if (error) {
        setError(`수정 실패: ${error.message}`);
        return;
      }
      router.push(`/community/${editId}`);
      router.refresh();
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert({ title: title.trim(), body, author_id: userId })
        .select('id')
        .single();
      setBusy(false);
      if (error || !data) {
        setError(`작성 실패: ${error?.message ?? '알 수 없는 오류'}`);
        return;
      }
      router.push(`/community/${data.id}`);
      router.refresh();
    }
  }

  const heading = editId ? '글 수정' : '글쓰기';

  if (status === 'loading') {
    return (
      <main className="comm-wrap">
        <p className="comm-muted">로딩 중…</p>
      </main>
    );
  }

  if (status === 'guest') {
    return (
      <main className="comm-wrap">
        <header className="comm-head">
          <a href="/" className="comm-home">이동건</a>
        </header>
        <h1 className="comm-title">{heading}</h1>
        <p className="auth-msg err">
          로그인이 필요합니다. <Link className="auth-inline" href="/login">로그인</Link> 후 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  if (status === 'forbidden') {
    return (
      <main className="comm-wrap">
        <header className="comm-head">
          <a href="/" className="comm-home">이동건</a>
        </header>
        <h1 className="comm-title">{heading}</h1>
        <p className="auth-msg err">{error ?? '이 글을 수정할 권한이 없습니다.'}</p>
        <Link className="comm-back" href="/community">← 목록으로</Link>
      </main>
    );
  }

  return (
    <main className="comm-wrap">
      <header className="comm-head">
        <a href="/" className="comm-home">이동건</a>
      </header>
      <h1 className="comm-title">{heading}</h1>
      <form className="comm-form" onSubmit={onSubmit}>
        <label className="comm-field">
          <span>제목</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </label>
        <label className="comm-field">
          <span>본문</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={14}
            placeholder="내용을 입력하세요. 줄바꿈은 그대로 표시됩니다."
          />
        </label>
        {error && <p className="auth-msg err">{error}</p>}
        <div className="comm-form-actions">
          <button className="auth-btn comm-submit" type="submit" disabled={busy}>
            {busy ? '저장 중…' : editId ? '수정 저장' : '작성'}
          </button>
          <Link className="comm-cancel" href={editId ? `/community/${editId}` : '/community'}>
            취소
          </Link>
        </div>
      </form>
    </main>
  );
}
