'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

type Ed = NonNullable<ReturnType<typeof useEditor>>;

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
  const setLink = () => {
    const prev = (editor.getAttributes('link').href as string | undefined) ?? 'https://';
    const url = window.prompt('링크 URL', prev);
    if (url === null) return; // 취소
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

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
