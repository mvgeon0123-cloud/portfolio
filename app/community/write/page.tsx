import WriteForm from '@/components/community/WriteForm';

// 서버 컴포넌트는 searchParams(edit=<id>)만 읽어 클라이언트 폼에 전달.
// (인증·작성·수정 로직은 모두 WriteForm 클라이언트에서)
export default function WritePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  return <WriteForm editId={searchParams.edit ?? null} />;
}
