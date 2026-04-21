// Supabase 클라이언트 초기화
import CONFIG from '../config.js';

const { createClient } = supabase; // CDN에서 로드된 전역 객체

export const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
