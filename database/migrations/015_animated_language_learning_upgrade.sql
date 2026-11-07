-- ============================================================================
-- STUDYAI MIGRATION 015: ANIMATED PICTURE-BASED LANGUAGE LEARNING UPGRADE
-- Adds persistence for Picture Vocabulary Collections, Listening Comprehension
-- Logs, and the 7 Interactive Language Games (Games A-G).
-- ============================================================================

-- 1. Student Saved Vocabulary Collection (Picture Vocabulary Bank)
CREATE TABLE IF NOT EXISTS public.student_saved_vocabulary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  support_language_code TEXT NOT NULL DEFAULT 'te',
  word_id TEXT NOT NULL,
  category TEXT NOT NULL,
  english_word TEXT NOT NULL,
  target_word TEXT NOT NULL,
  romanization TEXT,
  support_meaning TEXT NOT NULL,
  mastery_level INTEGER NOT NULL DEFAULT 1,
  practice_count INTEGER NOT NULL DEFAULT 1,
  last_pronunciation_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, language_code, word_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_vocab_user_lang
  ON public.student_saved_vocabulary(user_id, language_code);

-- 2. Student Listening Activity Logs
CREATE TABLE IF NOT EXISTS public.student_listening_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'word_picture' | 'sentence_meaning' | 'dialogue' | 'minimal_pairs' | 'fill_blank'
  question_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  score_earned INTEGER NOT NULL DEFAULT 0,
  playback_speed REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listening_logs_user_lang
  ON public.student_listening_logs(user_id, language_code);

-- 3. Student Interactive Language Game Logs (Games A to G)
CREATE TABLE IF NOT EXISTS public.student_language_game_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  game_code TEXT NOT NULL, -- 'picture_to_word' | 'listen_and_select' | 'speak_the_word' | 'missing_letters' | 'word_matching' | 'sentence_builder' | 'conversation_challenge'
  difficulty TEXT NOT NULL DEFAULT 'medium',
  score INTEGER NOT NULL DEFAULT 0,
  accuracy_percent INTEGER NOT NULL DEFAULT 0,
  items_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lang_game_logs_user_lang
  ON public.student_language_game_logs(user_id, language_code);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_saved_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_listening_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_language_game_logs ENABLE ROW LEVEL SECURITY;

-- Student Isolation Policies
CREATE POLICY student_saved_vocab_own_policy ON public.student_saved_vocabulary
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY student_listening_logs_own_policy ON public.student_listening_logs
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY student_lang_game_logs_own_policy ON public.student_language_game_logs
  FOR ALL USING (auth.uid()::text = user_id);
