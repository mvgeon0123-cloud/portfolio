import { createClient } from '@supabase/supabase-js';

// .env.local 의 NEXT_PUBLIC_ 변수 사용.
// ANON_KEY는 Supabase publishable key(sb_publishable_...) — anon 역할이라 클라이언트에 노출돼도 안전.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
