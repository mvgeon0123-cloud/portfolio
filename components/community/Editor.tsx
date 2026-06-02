'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import ResizableImage from './ResizableImage';
import LinkCard from './LinkCard';
import { createClient } from '@/lib/supabase-browser';

type Ed = NonNullable<ReturnType<typeof useEditor>>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const HL_COLORS = [
  { c: '#fff3a3', n: '노랑' },
  { c: '#c3f0c8', n: '초록' },
  { c: '#ffc9d4', n: '분홍' },
  { c: '#cfe3ff', n: '파랑' },
];
const TEXT_COLORS = [
  { c: '#e03131', n: '빨강' },
  { c: '#1971c2', n: '파랑' },
  { c: '#2f9e44', n: '초록' },
  { c: '#868e96', n: '회색' },
];

function Btn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`tb-btn${active ? ' on' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Swatch({
  color,
  onClick,
  title,
  active,
  hl,
}: {
  color: string;
  onClick: () => void;
  title: string;
  active?: boolean;
  hl?: boolean;
}) {
  return (
    <button
      type="button"
      className={`tb-swatch${active ? ' on' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={hl ? { background: color } : { background: '#fff', color }}
    >
      {hl ? '' : 'A'}
    </button>
  );
}

function Toolbar({ editor }: { editor: Ed }) {
  const [supabase] = useState(() => createClient());
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const setLink = () => {
    const prev = (editor.getAttributes('link').href as string | undefined) ?? 'https://';
    const url = window.prompt('링크 URL', prev);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertLinkCard = () => {
    const url = window.prompt('링크 카드 URL', 'https://');
    if (!url || !url.trim()) return;
    editor.chain().focus().insertContent({ type: 'linkCard', attrs: { href: url.trim() } }).run();
  };

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadErr(null);
    if (!file.type.startsWith('image/')) {
      setUploadErr('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadErr('이미지는 5MB 이하만 업로드할 수 있습니다.');
      return;
    }
    setUploading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setUploading(false);
      setUploadErr('로그인이 필요합니다.');
      return;
    }
    const safeName = (file.name || 'image')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .slice(-80);
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from('post-images')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (upErr) {
      setUploading(false);
      setUploadErr(`업로드 실패: ${upErr.message}`);
      return;
    }
    const { data: pub } = supabase.storage.from('post-images').getPublicUrl(path);
    editor.chain().focus().setImage({ src: pub.publicUrl }).run();
    setUploading(false);
  }

  const inTable = editor.isActive('table');

  return (
    <div className="editor-toolbar">
      <Btn label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
      <Btn label="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Btn>
      <Btn label="취소선" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
      <span className="tb-sep" />
      <Btn label="제목2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn label="제목3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Btn label="인용" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Btn>
      <span className="tb-sep" />
      <Btn label="불릿 목록" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• 목록</Btn>
      <Btn label="번호 목록" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. 목록</Btn>
      <span className="tb-sep" />
      <Btn label="인라인 코드" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>{'`코드`'}</Btn>
      <Btn label="코드 블록" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</Btn>
      <span className="tb-sep" />
      <Btn label="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>─</Btn>
      <Btn label="표 삽입(3x3)" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>표</Btn>
      <span className="tb-sep" />
      {HL_COLORS.map((h) => (
        <Swatch key={`hl${h.c}`} hl color={h.c} title={`형광펜 ${h.n}`} active={editor.isActive('highlight', { color: h.c })} onClick={() => editor.chain().focus().toggleHighlight({ color: h.c }).run()} />
      ))}
      <Btn label="형광펜 해제" onClick={() => editor.chain().focus().unsetHighlight().run()}>형광✕</Btn>
      <span className="tb-sep" />
      {TEXT_COLORS.map((t) => (
        <Swatch key={`tc${t.c}`} color={t.c} title={`글자색 ${t.n}`} onClick={() => editor.chain().focus().setColor(t.c).run()} />
      ))}
      <Btn label="기본 글자색" onClick={() => editor.chain().focus().unsetColor().run()}>기본</Btn>
      <span className="tb-sep" />
      <Btn label="링크" active={editor.isActive('link')} onClick={setLink}>링크</Btn>
      <Btn label="링크 제거" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>링크해제</Btn>
      <Btn label="링크 카드" onClick={insertLinkCard}>링크카드</Btn>
      <span className="tb-sep" />
      <Btn label="이미지 업로드" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? '업로드…' : '🖼 이미지'}</Btn>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      <span className="tb-sep" />
      <Btn label="왼쪽 정렬" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>좌</Btn>
      <Btn label="가운데 정렬" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>중</Btn>
      <Btn label="오른쪽 정렬" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>우</Btn>
      <span className="tb-sep" />
      <Btn label="실행취소" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
      <Btn label="되돌리기" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
      {inTable && (
        <>
          <span className="tb-sep" />
          <Btn label="행 추가" onClick={() => editor.chain().focus().addRowAfter().run()}>행+</Btn>
          <Btn label="행 삭제" onClick={() => editor.chain().focus().deleteRow().run()}>행−</Btn>
          <Btn label="열 추가" onClick={() => editor.chain().focus().addColumnAfter().run()}>열+</Btn>
          <Btn label="열 삭제" onClick={() => editor.chain().focus().deleteColumn().run()}>열−</Btn>
          <Btn label="헤더 행 토글" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>헤더</Btn>
          <Btn label="표 삭제" onClick={() => editor.chain().focus().deleteTable().run()}>표×</Btn>
        </>
      )}
      {uploadErr && <span className="tb-err">{uploadErr}</span>}
    </div>
  );
}

// value: 초기 본문(HTML 또는 과거 평문). onChange: 변경 시 HTML 문자열 전달.
export default function Editor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ResizableImage,
      LinkCard,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: '내용을 입력하세요…' }),
    ],
    content: value || '',
    editorProps: { attributes: { class: 'tiptap-content' } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="editor">
        <div className="editor-loading">에디터 로딩 중…</div>
      </div>
    );
  }

  return (
    <div className="editor">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
