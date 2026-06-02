'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { createClient } from '@/lib/supabase-browser';

type Ed = NonNullable<ReturnType<typeof useEditor>>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

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
      onMouseDown={(e) => e.preventDefault()} // 에디터 선택 유지
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {children}
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

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일 다시 선택 가능하도록 리셋
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
    // 로그인 사용자만 업로드 (Storage 정책상 강제되지만 UI에서도 확인)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setUploading(false);
      setUploadErr('로그인이 필요합니다.');
      return;
    }

    // 충돌 방지 경로: <유저id>/<타임스탬프>-<안전한 파일명>
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

  return (
    <div className="editor-toolbar">
      <Btn label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Btn>
      <Btn label="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <Btn label="취소선" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </Btn>
      <span className="tb-sep" />
      <Btn label="제목2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn label="제목3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Btn label="인용" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Btn>
      <span className="tb-sep" />
      <Btn label="불릿 목록" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • 목록
      </Btn>
      <Btn label="번호 목록" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. 목록
      </Btn>
      <span className="tb-sep" />
      <Btn label="인라인 코드" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        {'`코드`'}
      </Btn>
      <Btn label="코드 블록" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {'</>'}
      </Btn>
      <span className="tb-sep" />
      <Btn label="링크" active={editor.isActive('link')} onClick={setLink}>
        링크
      </Btn>
      <Btn label="링크 제거" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
        링크해제
      </Btn>
      <span className="tb-sep" />
      <Btn label="이미지 업로드" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? '업로드…' : '🖼 이미지'}
      </Btn>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      <span className="tb-sep" />
      <Btn label="왼쪽 정렬" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        좌
      </Btn>
      <Btn label="가운데 정렬" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        중
      </Btn>
      <Btn label="오른쪽 정렬" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        우
      </Btn>
      <span className="tb-sep" />
      <Btn label="실행취소" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </Btn>
      <Btn label="되돌리기" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </Btn>
      {uploadErr && <span className="tb-err">{uploadErr}</span>}
    </div>
  );
}

// value: 초기 본문(HTML 또는 과거 평문). onChange: 변경 시 HTML 문자열 전달.
export default function Editor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false, // Next SSR 안전
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // v3 StarterKit은 Link를 기본 포함 → 여기서 설정(별도 추가 시 중복 경고)
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image, // 이미지 (Supabase Storage 공개 URL을 src로 삽입)
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
