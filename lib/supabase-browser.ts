import { createBrowserClient } from '@supabase/ssr';

// 브라우저용 Supabase 클라이언트 — 세션을 쿠키에 저장해 유지.
// /admin 의 로그인·CRUD에서 사용. 홈(서버 읽기)은 lib/supabase.ts 를 그대로 사용.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
