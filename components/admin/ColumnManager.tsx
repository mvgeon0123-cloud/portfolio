'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

type Column = {
  id: string | number;
  title: string;
  source: string;
  url: string;
  sort_order: number;
};

const emptyForm = { title: '', source: '', url: '', sort_order: '' };

export default function ColumnManager({
  supabase,
  userEmail,
}: {
  supabase: SupabaseClient;
  userEmail: string;
}) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from('columns')
      .select('id, title, source, url, sort_order')
      .order('sort_order', { ascending: true });
    if (error) setError(`목록 조회 실패: ${error.message}`);
    else setColumns((data ?? []) as Column[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addColumn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.from('columns').insert({
      title: form.title,
      source: form.source,
      url: form.url,
      sort_order: Number(form.sort_order) || 0,
    });
    setBusy(false);
    if (error) {
      setError(`추가 실패: ${error.message}`);
      return;
    }
    setForm(emptyForm);
    await load();
  }

  function editLocal(id: Column['id'], patch: Partial<Column>) {
    setColumns((cols) => cols.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function saveColumn(col: Column) {
    setError(null);
    setBusy(true);
    const { error } = await supabase
      .from('columns')
      .update({
        title: col.title,
        source: col.source,
        url: col.url,
        sort_order: Number(col.sort_order) || 0,
      })
      .eq('id', col.id);
    setBusy(false);
    if (error) {
      setError(`수정 실패: ${error.message}`);
      return;
    }
    await load();
  }

  async function deleteColumn(id: Column['id']) {
    if (!confirm('이 칼럼을 삭제할까요?')) return;
    setError(null);
    setBusy(true);
    const { error } = await supabase.from('columns').delete().eq('id', id);
    setBusy(false);
    if (error) {
      setError(`삭제 실패: ${error.message}`);
      return;
    }
    await load();
  }

  return (
    <div>
      <p className="admin-muted">로그인 계정: {userEmail}</p>
      {error && <p className="admin-error">{error}</p>}

      <form className="admin-card" onSubmit={addColumn}>
        <h2>새 칼럼 추가</h2>
        <div className="admin-grid">
          <input
            placeholder="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <input
            placeholder="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <input
            placeholder="sort_order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
        </div>
        <button className="admin-btn" type="submit" disabled={busy}>
          추가
        </button>
      </form>

      <h2 className="admin-h2">칼럼 ({columns.length})</h2>
      {loading ? (
        <p className="admin-muted">로딩 중…</p>
      ) : columns.length === 0 ? (
        <p className="admin-muted">칼럼이 없습니다.</p>
      ) : (
        <div className="admin-list">
          {columns.map((col) => (
            <div key={col.id} className="admin-row">
              <div className="admin-grid">
                <input
                  value={col.title}
                  onChange={(e) => editLocal(col.id, { title: e.target.value })}
                />
                <input
                  value={col.source}
                  onChange={(e) => editLocal(col.id, { source: e.target.value })}
                />
                <input
                  value={col.url}
                  onChange={(e) => editLocal(col.id, { url: e.target.value })}
                />
                <input
                  type="number"
                  value={col.sort_order}
                  onChange={(e) =>
                    editLocal(col.id, { sort_order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="admin-row-actions">
                <button
                  className="admin-btn small"
                  onClick={() => saveColumn(col)}
                  disabled={busy}
                >
                  저장
                </button>
                <button
                  className="admin-btn small danger"
                  onClick={() => deleteColumn(col.id)}
                  disabled={busy}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
