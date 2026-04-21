import { supabaseClient } from './lib/supabase.js';

// 현재 사용자 가져오기
export async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

// 이메일 로그인
export async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// 회원가입
export async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  await supabaseClient.auth.signOut();
}

// 인증 상태 변화 리스너
export function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
