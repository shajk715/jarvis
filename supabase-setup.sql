-- JARVIS 데이터베이스 테이블 생성

-- 일정 테이블
CREATE TABLE schedules (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 메모 테이블
CREATE TABLE memos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 사용자 본인 데이터만 접근 가능
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own memos" ON memos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memos" ON memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memos" ON memos
  FOR DELETE USING (auth.uid() = user_id);
