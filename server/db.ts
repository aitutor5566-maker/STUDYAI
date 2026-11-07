import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DATA_DIR = process.env.STUDYAI_DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.STUDYAI_DB_PATH || path.join(DATA_DIR, 'studyai.sqlite');
export const db = new DatabaseSync(DB_PATH);

export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(`studyai_salt_${secret}`).digest('hex');
}

export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      grade TEXT NOT NULL,
      board TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      streak_days INTEGER NOT NULL DEFAULT 0,
      parent_passcode_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parent_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_preferences (
      user_id TEXT PRIMARY KEY,
      explanation_depth TEXT NOT NULL DEFAULT 'simple',
      preferred_language TEXT NOT NULL DEFAULT 'English',
      voice_speed REAL NOT NULL DEFAULT 1.0,
      voice_name TEXT NOT NULL DEFAULT 'Nova (Teacher)',
      daily_goal_minutes INTEGER NOT NULL DEFAULT 45,
      daily_goal_topics INTEGER NOT NULL DEFAULT 2,
      subjects_json TEXT NOT NULL,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      reduced_motion INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_adaptive_profiles (
      user_id TEXT PRIMARY KEY,
      difficult_subjects_json TEXT NOT NULL DEFAULT '[]',
      difficult_topics_json TEXT NOT NULL DEFAULT '[]',
      reading_difficulty INTEGER NOT NULL DEFAULT 0,
      spelling_difficulty INTEGER NOT NULL DEFAULT 0,
      writing_difficulty INTEGER NOT NULL DEFAULT 0,
      vocabulary_difficulty INTEGER NOT NULL DEFAULT 0,
      concept_difficulty INTEGER NOT NULL DEFAULT 0,
      memory_difficulty INTEGER NOT NULL DEFAULT 0,
      math_calculation_difficulty INTEGER NOT NULL DEFAULT 0,
      explanation_style TEXT NOT NULL DEFAULT 'balanced',
      preferred_learning_methods_json TEXT NOT NULL DEFAULT '["diagrams","examples"]',
      topic_understanding_json TEXT NOT NULL DEFAULT '{}',
      recent_feedback_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      target_count INTEGER NOT NULL DEFAULT 1,
      current_count INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tutor_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Grade 10',
      mode TEXT NOT NULL DEFAULT 'simple',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tutor_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      structured_json TEXT,
      media_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES tutor_conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Grade 10',
      depth TEXT NOT NULL DEFAULT 'detailed',
      notebook TEXT NOT NULL DEFAULT 'General',
      content_markdown TEXT NOT NULL,
      structured_json TEXT NOT NULL,
      flashcards_json TEXT NOT NULL,
      quiz_json TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'topic',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS library_resources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      summary TEXT NOT NULL,
      content_json TEXT NOT NULL,
      media_url TEXT,
      status TEXT NOT NULL DEFAULT 'ready',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS generation_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT 'Science',
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      settings_json TEXT NOT NULL,
      result_json TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      subject TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      questions_json TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      accuracy INTEGER NOT NULL DEFAULT 0,
      mistakes_json TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      correct_count INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      stage_reached INTEGER NOT NULL DEFAULT 1,
      duration_seconds INTEGER NOT NULL DEFAULT 60,
      mistakes_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_activity (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 5,
      score_percent INTEGER,
      resource_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shared_topic_context (
      user_id TEXT PRIMARY KEY,
      active_topic TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT NOT NULL,
      explanation_mode TEXT NOT NULL,
      last_conversation_id TEXT,
      last_note_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS icse_curriculum_nodes (
      id TEXT PRIMARY KEY,
      board TEXT NOT NULL DEFAULT 'ICSE',
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      book_title TEXT NOT NULL,
      publisher TEXT NOT NULL,
      edition TEXT DEFAULT 'Current Edition',
      chapter_number INTEGER,
      chapter_title TEXT NOT NULL,
      topic_name TEXT NOT NULL,
      subtopics_json TEXT DEFAULT '[]',
      learning_objectives_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS multimodal_ingestions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      file_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      raw_transcription TEXT,
      detected_questions_json TEXT DEFAULT '[]',
      source_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS external_research_cache (
      id TEXT PRIMARY KEY,
      query_hash TEXT NOT NULL UNIQUE,
      query_text TEXT NOT NULL,
      source_engine TEXT NOT NULL,
      verified_snippets_json TEXT NOT NULL DEFAULT '[]',
      confidence_score REAL NOT NULL DEFAULT 0.90,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subject_dossiers (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      dossier_type TEXT NOT NULL,
      entity_name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      max_students INTEGER NOT NULL DEFAULT 5,
      subscription_tier TEXT NOT NULL DEFAULT 'standard',
      subscription_status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      is_primary_guardian INTEGER NOT NULL DEFAULT 0,
      joined_at TEXT NOT NULL,
      FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
      UNIQUE(family_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT UNIQUE,
      avatar_url TEXT DEFAULT '/avatars/default.svg',
      birth_date TEXT,
      current_grade TEXT NOT NULL DEFAULT 'Grade 10',
      current_board TEXT NOT NULL DEFAULT 'CBSE',
      is_active INTEGER NOT NULL DEFAULT 1,
      daily_screen_time_limit_mins INTEGER DEFAULT 180,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_profile_access (
      id TEXT PRIMARY KEY,
      student_profile_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'student',
      granted_at TEXT NOT NULL,
      approved_by TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      UNIQUE(student_profile_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS family_invitations (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      invited_email TEXT NOT NULL,
      target_student_profile_id TEXT,
      role_id TEXT NOT NULL DEFAULT 'student',
      invitation_code TEXT NOT NULL UNIQUE,
      invited_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TEXT NOT NULL,
      accepted_at TEXT,
      accepted_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academic_preferences (
      id TEXT PRIMARY KEY,
      student_profile_id TEXT NOT NULL UNIQUE,
      target_board TEXT NOT NULL DEFAULT 'CBSE',
      class_grade TEXT NOT NULL DEFAULT 'Grade 10',
      academic_year TEXT NOT NULL DEFAULT '2026-2027',
      enrolled_subjects_json TEXT NOT NULL DEFAULT '["Mathematics","Science","Social Science","English"]',
      stream TEXT DEFAULT 'General',
      preserve_history_on_promotion INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      student_profile_id TEXT NOT NULL,
      parent_user_id TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      is_granted INTEGER NOT NULL DEFAULT 1,
      ip_address TEXT,
      user_agent TEXT,
      granted_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
      FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tester_role_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      default_modules_json TEXT NOT NULL,
      default_permissions_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tester_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role_template_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      is_email_verified INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT,
      last_login_at TEXT,
      created_by TEXT,
      invitation_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (role_template_id) REFERENCES tester_role_templates(id)
    );

    CREATE TABLE IF NOT EXISTS tester_permission_overrides (
      id TEXT PRIMARY KEY,
      tester_account_id TEXT NOT NULL,
      permission_key TEXT NOT NULL,
      override_state TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tester_account_id) REFERENCES tester_accounts(id) ON DELETE CASCADE,
      UNIQUE(tester_account_id, permission_key)
    );

    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      expected_outcome TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tester_assignments (
      id TEXT PRIMARY KEY,
      tester_id TEXT NOT NULL,
      test_case_id TEXT NOT NULL,
      module TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'assigned',
      deadline TEXT,
      assigned_by TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tester_id) REFERENCES tester_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_runs (
      id TEXT PRIMARY KEY,
      tester_id TEXT NOT NULL,
      environment TEXT NOT NULL DEFAULT 'staging',
      status TEXT NOT NULL DEFAULT 'in_progress',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (tester_id) REFERENCES tester_accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      test_run_id TEXT NOT NULL,
      test_case_id TEXT NOT NULL,
      tester_id TEXT NOT NULL,
      status TEXT NOT NULL,
      actual_result TEXT NOT NULL,
      execution_time_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (tester_id) REFERENCES tester_accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bug_reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      affected_module TEXT NOT NULL,
      severity TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      steps_to_reproduce TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      actual_result TEXT NOT NULL,
      screenshot_url TEXT,
      permitted_logs TEXT,
      reporter_id TEXT,
      reporter_email TEXT NOT NULL,
      assigned_developer TEXT,
      fix_version TEXT,
      retest_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (reporter_id) REFERENCES tester_accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS system_health_events (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL,
      status TEXT NOT NULL,
      affected_component TEXT NOT NULL,
      issue_description TEXT,
      started_at TEXT NOT NULL,
      last_successful_check TEXT NOT NULL,
      responsible_team TEXT NOT NULL DEFAULT 'Platform Infrastructure',
      is_resolved INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS usage_analytics (
      id TEXT PRIMARY KEY,
      metric_category TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      dimensions_json TEXT DEFAULT '{}',
      recorded_at TEXT NOT NULL
    );

    -- ==============================================================================
    -- AI SPEAKING SKILLS & MULTILINGUAL LANGUAGE LEARNING LIBRARY TABLES
    -- ==============================================================================
    CREATE TABLE IF NOT EXISTS supported_languages (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      script_name TEXT NOT NULL,
      flag_emoji TEXT NOT NULL,
      description TEXT NOT NULL,
      speech_recognition_code TEXT NOT NULL,
      speech_synthesis_voice TEXT NOT NULL,
      stages_count INTEGER NOT NULL DEFAULT 8,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS language_courses (
      id TEXT PRIMARY KEY,
      language_code TEXT NOT NULL,
      title TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
      total_stages INTEGER NOT NULL DEFAULT 8,
      total_lessons INTEGER NOT NULL DEFAULT 24,
      estimated_hours INTEGER NOT NULL DEFAULT 30,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_language_enrolments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      support_language_code TEXT NOT NULL DEFAULT 'en',
      is_primary_active INTEGER NOT NULL DEFAULT 0,
      current_stage INTEGER NOT NULL DEFAULT 1,
      current_lesson_number INTEGER NOT NULL DEFAULT 1,
      skill_level TEXT NOT NULL DEFAULT 'Beginner (Stage 1)',
      completed_lessons_count INTEGER NOT NULL DEFAULT 0,
      total_lessons_count INTEGER NOT NULL DEFAULT 24,
      progress_percentage INTEGER NOT NULL DEFAULT 0,
      vocabulary_words_learned INTEGER NOT NULL DEFAULT 0,
      grammar_concepts_learned INTEGER NOT NULL DEFAULT 0,
      speaking_exercises_completed INTEGER NOT NULL DEFAULT 0,
      listening_exercises_completed INTEGER NOT NULL DEFAULT 0,
      reading_exercises_completed INTEGER NOT NULL DEFAULT 0,
      writing_exercises_completed INTEGER NOT NULL DEFAULT 0,
      average_speaking_accuracy INTEGER NOT NULL DEFAULT 0,
      is_course_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      last_studied_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, language_code)
    );

    CREATE TABLE IF NOT EXISTS student_lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      score_percentage INTEGER NOT NULL DEFAULT 0,
      attempts_count INTEGER NOT NULL DEFAULT 1,
      speaking_score INTEGER,
      listening_score INTEGER,
      mistakes_json TEXT NOT NULL DEFAULT '[]',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS student_speaking_evaluations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      exercise_type TEXT NOT NULL,
      target_text TEXT NOT NULL,
      recognized_text TEXT NOT NULL,
      accuracy_score INTEGER NOT NULL,
      phonetic_feedback TEXT,
      support_language_explanation TEXT,
      audio_duration_seconds REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_language_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      achievement_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL DEFAULT 'award',
      badge_color TEXT NOT NULL DEFAULT '#FF6A00',
      earned_at TEXT NOT NULL,
      UNIQUE(user_id, language_code, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS student_saved_vocabulary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, language_code, word_id)
    );

    CREATE TABLE IF NOT EXISTS student_listening_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      question_id TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      score_earned INTEGER NOT NULL DEFAULT 0,
      playback_speed REAL NOT NULL DEFAULT 1.0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_language_game_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_code TEXT NOT NULL,
      game_code TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      score INTEGER NOT NULL DEFAULT 0,
      accuracy_percent INTEGER NOT NULL DEFAULT 0,
      items_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- ==============================================================================
    -- EDUCATIONAL GAMES LIBRARY (7 GAMES MODULE) TABLES
    -- ==============================================================================
    CREATE TABLE IF NOT EXISTS educational_games_catalog (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      badge_color TEXT NOT NULL,
      compatible_subjects_json TEXT NOT NULL,
      supported_difficulties_json TEXT NOT NULL,
      instructions_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS educational_game_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_slug TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      total_questions INTEGER NOT NULL DEFAULT 5,
      correct_count INTEGER NOT NULL DEFAULT 0,
      incorrect_count INTEGER NOT NULL DEFAULT 0,
      hints_used INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      accuracy_percentage INTEGER NOT NULL DEFAULT 0,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_progress',
      weak_concepts_json TEXT NOT NULL DEFAULT '[]',
      mastered_concepts_json TEXT NOT NULL DEFAULT '[]',
      session_data_json TEXT NOT NULL DEFAULT '{}',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS educational_game_question_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      question_payload_json TEXT NOT NULL,
      student_answer_json TEXT NOT NULL,
      correct_answer_json TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      score_earned INTEGER NOT NULL DEFAULT 0,
      hints_used INTEGER NOT NULL DEFAULT 0,
      concept_tested TEXT,
      explanation TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_educational_game_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_slug TEXT NOT NULL,
      total_sessions_completed INTEGER NOT NULL DEFAULT 0,
      total_questions_answered INTEGER NOT NULL DEFAULT 0,
      total_correct_answers INTEGER NOT NULL DEFAULT 0,
      highest_score INTEGER NOT NULL DEFAULT 0,
      average_accuracy INTEGER NOT NULL DEFAULT 0,
      favorite_topic TEXT,
      last_played_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, game_slug)
    );
  `);

  try {
    db.prepare("ALTER TABLE notes ADD COLUMN design_mode TEXT DEFAULT 'handwritten'").run();
  } catch {
    // column already exists
  }

  seedInitialDataIfEmpty();
  seedFamilyDataIfEmpty();
  seedAdminAndTesterDataIfEmpty();
  seedLanguageDataIfEmpty();
  seedEducationalGamesIfEmpty();
  try {
    db.prepare("UPDATE supported_languages SET script_name = 'ひらがな, カタカナ & 漢字 (Hiragana, Katakana & Kanji)' WHERE code = 'ja'").run();
  } catch {}
}

function seedFamilyDataIfEmpty() {
  const existingFamily = db.prepare('SELECT id FROM families LIMIT 1').get() as { id: string } | undefined;
  if (existingFamily) return;

  const now = new Date().toISOString();

  // Ensure parent user exists
  const existingParent = db.prepare('SELECT id FROM users WHERE id = ?').get('parent-primary');
  if (!existingParent) {
    db.prepare(`
      INSERT INTO users (id, name, email, grade, board, avatar_url, streak_days, parent_passcode_hash, created_at)
      VALUES ('parent-primary', 'Parent Guardian', 'parent@studyai.edu', 'Adult', 'CBSE', '/avatars/default.svg', 0, ?, ?)
    `).run(hashSecret('2468'), now);
  }

  // 1. Create Default Family
  db.prepare(`
    INSERT INTO families (id, name, created_by, max_students, subscription_tier, subscription_status, created_at)
    VALUES ('family-sai', 'Sai Family', 'parent-primary', 5, 'premium', 'active', ?)
  `).run(now);

  // 2. Family Members
  db.prepare(`
    INSERT INTO family_members (id, family_id, user_id, role_id, is_primary_guardian, joined_at)
    VALUES
      ('fm-parent', 'family-sai', 'parent-primary', 'family_owner', 1, ?),
      ('fm-vishwak', 'family-sai', 'student-vishwak', 'student', 0, ?),
      ('fm-aarav', 'family-sai', 'student-new', 'student', 0, ?)
  `).run(now, now, now);

  // 3. Student Profiles
  db.prepare(`
    INSERT INTO student_profiles (id, family_id, display_name, slug, avatar_url, birth_date, current_grade, current_board, is_active, daily_screen_time_limit_mins, created_at, updated_at)
    VALUES
      ('profile-vishwak', 'family-sai', 'Vishwak Sai', 'student-vishwak', '/avatars/vishwak.svg', '2010-05-15', 'Grade 10', 'CBSE', 1, 180, ?, ?),
      ('profile-aarav', 'family-sai', 'Aarav Sharma', 'student-new', '/avatars/new.svg', '2011-08-20', 'Grade 9', 'ICSE', 1, 180, ?, ?)
  `).run(now, now, now, now);

  // 4. Student Profile Access
  db.prepare(`
    INSERT INTO student_profile_access (id, student_profile_id, user_id, access_level, granted_at, approved_by, is_active)
    VALUES
      ('spa-v-1', 'profile-vishwak', 'student-vishwak', 'student', ?, 'parent-primary', 1),
      ('spa-v-2', 'profile-vishwak', 'parent-primary', 'owner_parent', ?, 'parent-primary', 1),
      ('spa-a-1', 'profile-aarav', 'student-new', 'student', ?, 'parent-primary', 1),
      ('spa-a-2', 'profile-aarav', 'parent-primary', 'owner_parent', ?, 'parent-primary', 1)
  `).run(now, now, now, now);

  // 5. Academic Preferences
  db.prepare(`
    INSERT INTO academic_preferences (id, student_profile_id, target_board, class_grade, academic_year, enrolled_subjects_json, stream, preserve_history_on_promotion, updated_at)
    VALUES
      ('acad-v', 'profile-vishwak', 'CBSE', 'Grade 10', '2026-2027', '["Mathematics","Science","Social Science","English"]', 'General', 1, ?),
      ('acad-a', 'profile-aarav', 'ICSE', 'Grade 9', '2026-2027', '["Mathematics","Physics","Chemistry","Biology","English"]', 'General', 1, ?)
  `).run(now, now);

  // 6. Consent Records
  db.prepare(`
    INSERT INTO consent_records (id, family_id, student_profile_id, parent_user_id, consent_type, is_granted, ip_address, user_agent, granted_at, revoked_at)
    VALUES
      ('cr-v', 'family-sai', 'profile-vishwak', 'parent-primary', 'coppa_parental_consent', 1, '127.0.0.1', 'Seed Initializer', ?, NULL),
      ('cr-a', 'family-sai', 'profile-aarav', 'parent-primary', 'coppa_parental_consent', 1, '127.0.0.1', 'Seed Initializer', ?, NULL)
  `).run(now, now);
}

function seedInitialDataIfEmpty() {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get('student-vishwak') as { id: string } | undefined;
  if (existing) return;

  const now = new Date();
  const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString();

  // 1. Primary Student Profile (Vishwak Sai - Grade 10 CBSE) + New Student Profile for testing empty states
  db.prepare(`
    INSERT INTO users (id, name, email, grade, board, avatar_url, streak_days, parent_passcode_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-vishwak',
    'Vishwak Sai',
    'vishwak.sai@studyai.edu',
    'Grade 10',
    'CBSE',
    '/avatars/vishwak.svg',
    7,
    hashSecret('2468'), // Default server-verified Parent Access Passcode: 2468
    iso(24 * 14)
  );

  db.prepare(`
    INSERT INTO users (id, name, email, grade, board, avatar_url, streak_days, parent_passcode_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-new',
    'Aarav Sharma',
    'aarav@studyai.edu',
    'Grade 9',
    'ICSE',
    '/avatars/new.svg',
    0,
    hashSecret('2468'),
    iso(1)
  );

  // 2. Learning Preferences
  db.prepare(`
    INSERT INTO learning_preferences (user_id, explanation_depth, preferred_language, voice_speed, voice_name, daily_goal_minutes, daily_goal_topics, subjects_json, notifications_enabled, reduced_motion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-vishwak',
    'simple',
    'English',
    1.0,
    'Nova (Teacher)',
    60,
    3,
    JSON.stringify(['Science', 'Maths', 'English', 'Social Studies', 'Computer Science']),
    1,
    0
  );

  db.prepare(`
    INSERT INTO learning_preferences (user_id, explanation_depth, preferred_language, voice_speed, voice_name, daily_goal_minutes, daily_goal_topics, subjects_json, notifications_enabled, reduced_motion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-new',
    'simple',
    'English',
    1.0,
    'Nova (Teacher)',
    30,
    2,
    JSON.stringify(['Science', 'Maths', 'English']),
    1,
    0
  );

  // 2B. Student Adaptive Profiles
  db.prepare(`
    INSERT INTO student_adaptive_profiles (
      user_id, difficult_subjects_json, difficult_topics_json,
      reading_difficulty, spelling_difficulty, writing_difficulty, vocabulary_difficulty,
      concept_difficulty, memory_difficulty, math_calculation_difficulty,
      explanation_style, preferred_learning_methods_json, topic_understanding_json, recent_feedback_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-vishwak',
    JSON.stringify(['Maths', 'Physics']),
    JSON.stringify(['Quadratic Equations', 'Chemical Bonding']),
    0, // reading_difficulty
    0, // spelling_difficulty
    0, // writing_difficulty
    1, // vocabulary_difficulty (prefers clear glossaries)
    1, // concept_difficulty (benefits from visual 3D & diagrams)
    0, // memory_difficulty
    1, // math_calculation_difficulty
    'balanced',
    JSON.stringify(['diagrams', 'images', 'examples']),
    JSON.stringify({
      'Photosynthesis': { score: 92, status: 'mastered', assessedAt: iso(2) },
      'Human Heart': { score: 88, status: 'mastered', assessedAt: iso(4) }
    }),
    JSON.stringify([
      { topic: 'Photosynthesis', rating: 'just_right', date: iso(2) }
    ]),
    iso(1)
  );

  db.prepare(`
    INSERT INTO student_adaptive_profiles (
      user_id, difficult_subjects_json, difficult_topics_json,
      reading_difficulty, spelling_difficulty, writing_difficulty, vocabulary_difficulty,
      concept_difficulty, memory_difficulty, math_calculation_difficulty,
      explanation_style, preferred_learning_methods_json, topic_understanding_json, recent_feedback_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student-new',
    JSON.stringify(['Science', 'Maths']),
    JSON.stringify([]),
    1, // reading_difficulty (benefits from shorter sentences & audio)
    1, // spelling_difficulty (gentle spelling guidance)
    1, // writing_difficulty (answer structuring help)
    1,
    1,
    1,
    1,
    'concise',
    JSON.stringify(['audio', 'diagrams', 'examples']),
    JSON.stringify({}),
    JSON.stringify([]),
    iso(1)
  );

  // 3. Study Goals
  const goals = [
    { id: 'goal-1', title: 'Complete Photosynthesis Notes & 3D Cell Review', subject: 'Science', target: 2, current: 2, completed: 1, due: iso(-12) },
    { id: 'goal-2', title: 'Solve 10 Quadratic Equations Practice Questions', subject: 'Maths', target: 10, current: 8, completed: 0, due: iso(-18) },
    { id: 'goal-3', title: 'Master Fractions & Algebra in Answer Battle', subject: 'Maths', target: 1, current: 1, completed: 1, due: iso(-24) },
    { id: 'goal-4', title: 'Review Human Heart 3D Chambers & Blood Flow', subject: 'Science', target: 1, current: 1, completed: 1, due: iso(-6) },
    { id: 'goal-5', title: 'Revise World War II Timeline & Causes', subject: 'Social Studies', target: 2, current: 1, completed: 0, due: iso(-36) },
    { id: 'goal-6', title: 'Complete Active & Passive Voice Grammar Quiz', subject: 'English', target: 1, current: 0, completed: 0, due: iso(-48) },
  ];
  const insertGoal = db.prepare(`
    INSERT INTO study_goals (id, user_id, title, subject, target_count, current_count, completed, due_date, created_at)
    VALUES (?, 'student-vishwak', ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const g of goals) {
    insertGoal.run(g.id, g.title, g.subject, g.target, g.current, g.completed, g.due, iso(48));
  }

  // 4. Initial Tutor Conversation (Photosynthesis — matching the UI screenshot)
  const convId = 'conv-photosynthesis';
  db.prepare(`
    INSERT INTO tutor_conversations (id, user_id, topic, subject, level, mode, created_at, updated_at)
    VALUES (?, 'student-vishwak', 'Photosynthesis', 'Science', 'Grade 10', 'simple', ?, ?)
  `).run(convId, iso(2), iso(2));

  const photosynthesisStructured = {
    topic: 'Photosynthesis',
    subject: 'Science',
    introduction:
      'Photosynthesis is the biochemical process by which green plants, algae, and certain bacteria convert light energy from the sun into chemical energy stored in glucose (food). It occurs primarily inside the chloroplasts of plant leaf cells using the green pigment chlorophyll.',
    keySteps: [
      'Light Absorption — Chlorophyll inside the thylakoid membranes captures sunlight energy.',
      'Water Splitting (Photolysis) — Roots absorb water (H₂O) from the soil; light energy splits water molecules, releasing oxygen (O₂) gas.',
      'Carbon Fixation (Calvin Cycle) — Carbon dioxide (CO₂) enters leaves through tiny pores called stomata and combines with hydrogen to synthesize glucose (C₆H₁₂O₆).'
    ],
    formula: {
      equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      reactants: [
        { symbol: '6CO₂', label: 'Carbon dioxide' },
        { symbol: '6H₂O', label: 'Water' }
      ],
      products: [
        { symbol: 'C₆H₁₂O₆', label: 'Glucose (food)' },
        { symbol: '6O₂', label: 'Oxygen' }
      ],
      catalyst: 'Sunlight + Chlorophyll'
    },
    definitions: [
      { term: 'Chloroplast', definition: 'Specialized plant cell organelle where photosynthesis takes place.' },
      { term: 'Chlorophyll', definition: 'Green photosynthetic pigment that absorbs blue and red wavelengths of light.' },
      { term: 'Stomata', definition: 'Microscopic pores on leaf surfaces regulated by guard cells for gas exchange.' }
    ],
    analogies: 'Think of a plant leaf as a solar-powered kitchen: sunlight is the electricity, CO₂ and water are the raw ingredients, chlorophyll is the chef, glucose is the meal prepared, and oxygen is the fresh air released.',
    misconceptions: [
      'Misconception: Plants only perform photosynthesis and do not respire. Reality: Plants perform cellular respiration 24 hours a day, and photosynthesis when light is available.',
      'Misconception: Plants get most of their solid mass from soil. Reality: Most of a plant’s dry biomass comes from carbon dioxide in the air!'
    ],
    recap: 'Plants capture sunlight with chlorophyll to convert Carbon Dioxide (CO₂) and Water (H₂O) into Glucose (C₆H₁₂O₆) for energy and release Oxygen (O₂) into the atmosphere.',
    diagramType: 'photosynthesis',
    model3dType: 'chloroplast_molecule',
    suggestedFollowUps: [
      'What happens during the light-independent (Calvin) cycle?',
      'How do desert plants perform photosynthesis without losing water?',
      'Test me with a 5-question quiz on Photosynthesis'
    ]
  };

  db.prepare(`
    INSERT INTO tutor_messages (id, conversation_id, role, content, structured_json, media_json, created_at)
    VALUES (?, ?, 'user', ?, NULL, NULL, ?)
  `).run('msg-1', convId, 'Explain photosynthesis in simple terms', iso(2));

  db.prepare(`
    INSERT INTO tutor_messages (id, conversation_id, role, content, structured_json, media_json, created_at)
    VALUES (?, ?, 'assistant', ?, ?, ?, ?)
  `).run(
    'msg-2',
    convId,
    `${photosynthesisStructured.introduction}\n\n### Key Steps:\n1. ${photosynthesisStructured.keySteps[0]}\n2. ${photosynthesisStructured.keySteps[1]}\n3. ${photosynthesisStructured.keySteps[2]}\n\n**Chemical Equation:** \`6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\``,
    JSON.stringify(photosynthesisStructured),
    JSON.stringify({ diagramType: 'photosynthesis', hasAudio: true, model3dId: 'model-photosynthesis' }),
    iso(2)
  );

  // 5. Initial Notes (matching the 5 Recent Notes in the reference UI)
  const seedNotes = [
    {
      id: 'note-photosynthesis',
      title: 'Photosynthesis',
      subject: 'Science',
      topic: 'Photosynthesis',
      notebook: 'Biology',
      hoursAgo: 2,
      markdown: `# Photosynthesis — Complete Study Notes\n\n## 1. Introduction & Core Definition\n**Photosynthesis** is the physico-chemical process by which autotrophic organisms (green plants, algae, cyanobacteria) synthesize organic compounds (**glucose**) from inorganic raw materials (**CO₂** and **H₂O**) in the presence of **sunlight** and **chlorophyll**.\n\n## 2. Balanced Chemical Equation\n\`6CO₂ + 12H₂O —(Sunlight / Chlorophyll)→ C₆H₁₂O₆ + 6O₂ + 6H₂O\`\n\n## 3. Site of Photosynthesis\n- **Chloroplasts**: Double-membrane organelles found mainly in mesophyll cells of leaves.\n- **Grana (Thylakoids)**: Site of Light-Dependent Reactions (trapping light energy, ATP & NADPH synthesis).\n- **Stroma**: Site of Dark / Light-Independent Reactions (Calvin Cycle — carbon fixation into glucose).\n\n## 4. Step-by-Step Mechanism\n1. **Absorption of Light Energy** by chlorophyll-a and accessory pigments.\n2. **Conversion of Light Energy** into chemical energy and **photolysis of water** into H⁺, electrons, and O₂.\n3. **Reduction of Carbon Dioxide** into carbohydrates (glucose) using ATP and NADPH.\n\n## 5. Key Comparisons: Light vs Dark Reactions\n- **Light Reaction (Hill Reaction)**: Takes place in Grana; requires sunlight; produces ATP, NADPH, and O₂.\n- **Calvin Cycle (C3 Pathway)**: Takes place in Stroma; uses ATP and NADPH to fix CO₂ into Glucose.\n\n## 6. Revision Summary\n- Oxygen released during photosynthesis comes from **water (H₂O)**, not carbon dioxide.\n- Stomatal opening is regulated by turgor pressure changes in **guard cells**.`,
      structured: {
        summary: 'Complete biology notes covering light reactions, Calvin cycle, chloroplast structure, and balanced equation.',
        keywords: ['Chloroplast', 'Chlorophyll', 'Photolysis', 'Calvin Cycle', 'Stomata', 'ATP & NADPH'],
        formulas: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'],
        faq: [
          { q: 'Where does the oxygen released in photosynthesis come from?', a: 'It comes from the splitting (photolysis) of water (H₂O) molecules during the light-dependent reaction.' },
          { q: 'Why do leaves appear green?', a: 'Chlorophyll absorbs mainly blue and red wavelengths of sunlight and reflects green light.' }
        ]
      },
      flashcards: [
        { front: 'What is the balanced equation for photosynthesis?', back: '6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂' },
        { front: 'Where do light-dependent reactions occur?', back: 'In the thylakoid membranes (grana) of the chloroplast.' },
        { front: 'Where does the Calvin Cycle occur?', back: 'In the stroma of the chloroplast.' },
        { front: 'Which gas is released as a byproduct of photolysis of water?', back: 'Oxygen (O₂)' }
      ]
    },
    {
      id: 'note-quadratic',
      title: 'Quadratic Equations',
      subject: 'Maths',
      topic: 'Quadratic Equations',
      notebook: 'Maths',
      hoursAgo: 24,
      markdown: `# Quadratic Equations — Formula & Roots Guide\n\n## 1. Standard Form\nA quadratic equation in variable $x$ is of the form:\n\`ax² + bx + c = 0\` where $a, b, c \\in \\mathbb{R}$ and $a \\neq 0$.\n\n## 2. Quadratic Formula (Sridharacharya Formula)\n\`x = (-b ± √(b² - 4ac)) / (2a)\`\n\n## 3. Nature of Roots & Discriminant (D)\nThe expression \`D = b² - 4ac\` is called the **Discriminant**:\n- **If D > 0**: Two distinct real roots.\n- **If D = 0**: Two equal real roots (\`x = -b / 2a\`).\n- **If D < 0**: No real roots (complex conjugate roots).\n\n## 4. Worked Example\nSolve \`2x² - 7x + 3 = 0\`:\n- Here $a = 2, b = -7, c = 3$\n- $D = (-7)² - 4(2)(3) = 49 - 24 = 25 > 0$\n- $x = (7 ± √25) / 4 = (7 ± 5) / 4$\n- Roots: \`x = 3\` and \`x = 1/2\`.`,
      structured: {
        summary: 'Standard form, quadratic formula, discriminant rules for nature of roots, and step-by-step worked examples.',
        keywords: ['Discriminant', 'Roots', 'Factorization', 'Completing the Square', 'Parabola'],
        formulas: ['ax² + bx + c = 0', 'D = b² - 4ac', 'x = (-b ± √D) / 2a'],
        faq: [
          { q: 'When does a quadratic equation have equal roots?', a: 'When the discriminant D = b² - 4ac equals zero.' }
        ]
      },
      flashcards: [
        { front: 'What is the discriminant of ax² + bx + c = 0?', back: 'D = b² - 4ac' },
        { front: 'What is the sum and product of roots (α, β)?', back: 'Sum (α + β) = -b/a, Product (αβ) = c/a' }
      ]
    },
    {
      id: 'note-ww2',
      title: 'World War II',
      subject: 'Social Studies',
      topic: 'World War II',
      notebook: 'History',
      hoursAgo: 48,
      markdown: `# World War II (1939–1945) — Causes, Turning Points & Impact\n\n## 1. Overview\nWorld War II was a global conflict fought between two major alliances: the **Allied Powers** (Britain, USSR, USA, France, China) and the **Axis Powers** (Germany, Japan, Italy).\n\n## 2. Key Causes\n1. Treaty of Versailles (1919) and severe economic reparations.\n2. Rise of Fascism in Italy and Nazism in Germany.\n3. Failure of the League of Nations and policy of appeasement.\n4. Immediate trigger: German invasion of Poland on **1 September 1939**.\n\n## 3. Major Turning Points\n- **Battle of Stalingrad (1942–43)**: Halted Axis eastern expansion.\n- **Battle of Midway (1942)**: Shifted naval balance in the Pacific.\n- **D-Day / Operation Overlord (June 6, 1944)**: Allied liberation of Western Europe.\n\n## 4. Global Consequences\n- Establishment of the **United Nations (UN)** in October 1945.\n- Beginning of the Cold War bipolar order and decolonization in Asia & Africa.`,
      structured: {
        summary: 'Structured historical analysis of World War II causes, Axis vs Allies, key battles, and formation of the UN.',
        keywords: ['Allied Powers', 'Axis Powers', 'Treaty of Versailles', 'D-Day', 'United Nations'],
        formulas: [],
        faq: [
          { q: 'What event triggered the start of World War II in Europe?', a: 'Germany’s invasion of Poland on September 1, 1939.' }
        ]
      },
      flashcards: [
        { front: 'When did World War II begin and end?', back: 'September 1, 1939 to September 2, 1945' },
        { front: 'What was Operation Overlord?', back: 'The Allied invasion of Normandy, France on June 6, 1944 (D-Day).' }
      ]
    },
    {
      id: 'note-water-cycle',
      title: 'Water Cycle',
      subject: 'Science',
      topic: 'Water Cycle',
      notebook: 'Science',
      hoursAgo: 72,
      markdown: `# The Hydrological (Water) Cycle\n\n## 1. Core Processes\n1. **Evaporation**: Solar radiation heats surface water in oceans, lakes, and rivers, turning liquid water into water vapor.\n2. **Transpiration**: Release of water vapor from plant leaves through stomata.\n3. **Condensation**: Rising warm vapor cools at higher altitudes to form clouds and water droplets.\n4. **Precipitation**: Condensed water falls back to Earth as rain, snow, sleet, or hail.\n5. **Infiltration & Percolation**: Water seeps into soil and replenishes groundwater aquifers.`,
      structured: {
        summary: 'Continuous movement of water across Earth’s atmosphere, land, and oceans through evaporation, condensation, and precipitation.',
        keywords: ['Evaporation', 'Transpiration', 'Condensation', 'Precipitation', 'Aquifer'],
        formulas: [],
        faq: []
      },
      flashcards: [
        { front: 'What drives the Earth’s water cycle?', back: 'Solar energy from the Sun and gravity.' }
      ]
    },
    {
      id: 'note-grammar',
      title: 'Grammar Basics',
      subject: 'English',
      topic: 'Grammar Basics',
      notebook: 'English',
      hoursAgo: 96,
      markdown: `# English Grammar Basics — Tenses, Active/Passive Voice & Clauses\n\n## 1. Active vs Passive Voice\n- **Active Voice**: Subject performs the action (*"Chlorophyll absorbs sunlight"*).\n- **Passive Voice**: Object receives the action (*"Sunlight is absorbed by chlorophyll"*).\n\n## 2. Subject-Verb Agreement Rules\n- Singular subjects take singular verbs; plural subjects take plural verbs.\n- Collective nouns take singular verbs when acting as a single unit.`,
      structured: {
        summary: 'Essential rules for sentence structure, active/passive transformation, and subject-verb concord.',
        keywords: ['Active Voice', 'Passive Voice', 'Subject-Verb Concord', 'Clauses'],
        formulas: ['Active: Subject + Verb + Object', 'Passive: Object + Auxiliary Verb + V3 + by + Subject'],
        faq: []
      },
      flashcards: [
        { front: 'Convert to Passive: "The student solved the equation."', back: '"The equation was solved by the student."' }
      ]
    }
  ];

  const insertNote = db.prepare(`
    INSERT INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, created_at, updated_at)
    VALUES (?, 'student-vishwak', ?, ?, ?, 'Grade 10', 'detailed', ?, ?, ?, ?, '[]', 'topic', ?, ?)
  `);
  for (const n of seedNotes) {
    insertNote.run(
      n.id,
      n.title,
      n.subject,
      n.topic,
      n.notebook,
      n.markdown,
      JSON.stringify(n.structured),
      JSON.stringify(n.flashcards),
      iso(n.hoursAgo),
      iso(n.hoursAgo)
    );
  }

  // 6. Seed Library Resources (matching Library screenshot: Human Heart 3D Model, Solar System Video, DNA Notes, Maths Quiz, plus saved notes/images/models)
  const resources = [
    {
      id: 'res-heart-3d',
      type: 'model3d',
      title: 'Human Heart 3D Model',
      subject: 'Science',
      topic: 'Human Heart & Cardiac Cycle',
      summary: 'Interactive 4-chamber cardiac visualization with Left/Right Atrium, Left/Right Ventricle, Aorta, and pulsatile blood-flow animation.',
      content: { modelId: 'human_heart', verified: false, verificationLabel: 'Interactive Procedural Scientific Visualization (4 Chambers & Aortic Arch)' },
      hoursAgo: 48
    },
    {
      id: 'res-solar-video',
      type: 'video',
      title: 'Solar System Video',
      subject: 'Science',
      topic: 'Solar System & Planetary Orbits',
      summary: 'Narrated multi-scene educational video exploring Kepler’s laws, inner rocky planets, gas giants, and orbital mechanics.',
      content: {
        durationSeconds: 45,
        audience: 'Grade 10',
        language: 'English',
        style: 'Cinematic Scientific',
        scenes: [
          { title: 'The Sun — Gravitational Anchor', narration: 'At the center of our Solar System lies the Sun, containing 99.86% of the system’s total mass and binding eight planets in elliptical orbits.', duration: 11, visualTheme: 'sun_core' },
          { title: 'Terrestrial Inner Planets', narration: 'Mercury, Venus, Earth, and Mars are rocky terrestrial worlds with high density and metallic cores.', duration: 11, visualTheme: 'inner_planets' },
          { title: 'Jovian Gas & Ice Giants', narration: 'Beyond the asteroid belt orbit Jupiter, Saturn, Uranus, and Neptune — massive worlds with ring systems and dozens of moons.', duration: 12, visualTheme: 'gas_giants' },
          { title: 'Kepler’s Laws of Orbital Motion', narration: 'Planets sweep equal areas in equal times, moving faster at perihelion and slower at aphelion.', duration: 11, visualTheme: 'kepler_orbits' }
        ]
      },
      hoursAgo: 72
    },
    {
      id: 'res-dna-notes',
      type: 'note',
      title: 'DNA Notes',
      subject: 'Science',
      topic: 'DNA Double Helix & Genetics',
      summary: 'Nucleotide base pairing (Adenine-Thymine, Guanine-Cytosine), sugar-phosphate backbone, and replication forks.',
      content: { noteId: 'note-photosynthesis', markdown: '# DNA Structure & Heredity\n\n- **Double Helix** discovered by Watson, Crick, Franklin, and Wilkins.\n- **Complementary Base Pairing**: Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds; Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.' },
      hoursAgo: 96
    },
    {
      id: 'res-maths-quiz',
      type: 'quiz',
      title: 'Maths Quiz - Fractions & Quadratics',
      subject: 'Maths',
      topic: 'Quadratic Equations',
      summary: '10-question adaptive mastery assessment on algebraic fractions, roots, and discriminants (Score: 90%).',
      content: { quizId: 'quiz-maths-1', score: 9, total: 10 },
      hoursAgo: 120
    },
    {
      id: 'res-photo-diagram',
      type: 'image',
      title: 'Photosynthesis Chloroplast Diagram',
      subject: 'Science',
      topic: 'Photosynthesis',
      summary: 'Annotated scientific illustration showing Sunlight, CO₂ intake, H₂O absorption, Glucose synthesis, and O₂ release.',
      content: { diagramType: 'photosynthesis', caption: 'Annotated Scientific Diagram — Verify stoichiometric details against textbook reference.' },
      hoursAgo: 2
    },
    {
      id: 'res-solar-3d',
      type: 'model3d',
      title: 'Solar System 3D Orbital Lab',
      subject: 'Science',
      topic: 'Solar System',
      summary: 'Real-time 3D heliocentric orbital simulator with interactive planet labels, orbital speed controls, and zoom.',
      content: { modelId: 'solar_system', verified: false, verificationLabel: 'Interactive Procedural 3D Orbital Simulation' },
      hoursAgo: 18
    },
    {
      id: 'res-dna-3d',
      type: 'model3d',
      title: 'DNA Double Helix 3D Structure',
      subject: 'Science',
      topic: 'DNA Structure',
      summary: '3D molecular base-pair ladder showing A-T and G-C rungs and antiparallel sugar-phosphate strands.',
      content: { modelId: 'dna_helix', verified: false, verificationLabel: 'Interactive Procedural Molecular Visualization' },
      hoursAgo: 30
    },
    {
      id: 'res-audio-photo',
      type: 'audio',
      title: 'Photosynthesis — Teacher Audio Lesson',
      subject: 'Science',
      topic: 'Photosynthesis',
      summary: 'Natural teacher-style audio explanation of light reactions and Calvin cycle (2m 15s).',
      content: { text: photosynthesisStructured.introduction + ' ' + photosynthesisStructured.keySteps.join(' ') + ' ' + photosynthesisStructured.recap, voice: 'Nova (Teacher)', speed: 1.0 },
      hoursAgo: 2
    }
  ];

  const insertResource = db.prepare(`
    INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
    VALUES (?, 'student-vishwak', ?, ?, ?, ?, ?, ?, NULL, 'ready', ?)
  `);
  for (const r of resources) {
    insertResource.run(r.id, r.type, r.title, r.subject, r.topic, r.summary, JSON.stringify(r.content), iso(r.hoursAgo));
  }

  // 7. Seed Quizzes & Game Sessions
  db.prepare(`
    INSERT INTO quizzes (id, user_id, topic, subject, difficulty, questions_json, score, total_questions, accuracy, mistakes_json, completed, created_at, completed_at)
    VALUES ('quiz-maths-1', 'student-vishwak', 'Quadratic Equations & Fractions', 'Maths', 'medium', '[]', 9, 10, 90, '[{"question":"Find discriminant of x²+2x+5=0","yourAnswer":"16","correctAnswer":"-16"}]', 1, ?, ?)
  `).run(iso(4), iso(4));

  db.prepare(`
    INSERT INTO quizzes (id, user_id, topic, subject, difficulty, questions_json, score, total_questions, accuracy, mistakes_json, completed, created_at, completed_at)
    VALUES ('quiz-science-1', 'student-vishwak', 'Photosynthesis & Cellular Respiration', 'Science', 'medium', '[]', 5, 5, 100, '[]', 1, ?, ?)
  `).run(iso(2), iso(2));

  db.prepare(`
    INSERT INTO game_sessions (id, user_id, game_type, subject, topic, difficulty, score, accuracy, correct_count, total_questions, stage_reached, duration_seconds, mistakes_json, created_at)
    VALUES ('game-1', 'student-vishwak', 'answer_battle', 'Science', 'Photosynthesis', 'medium', 1250, 92, 11, 12, 4, 95, '[]', ?)
  `).run(iso(6));

  db.prepare(`
    INSERT INTO game_sessions (id, user_id, game_type, subject, topic, difficulty, score, accuracy, correct_count, total_questions, stage_reached, duration_seconds, mistakes_json, created_at)
    VALUES ('game-2', 'student-vishwak', 'learning_runner', 'Maths', 'Quadratic Equations', 'medium', 980, 85, 6, 7, 3, 80, '[]', ?)
  `).run(iso(14));

  db.prepare(`
    INSERT INTO game_sessions (id, user_id, game_type, subject, topic, difficulty, score, accuracy, correct_count, total_questions, stage_reached, duration_seconds, mistakes_json, created_at)
    VALUES ('game-3', 'student-vishwak', 'space_shooter', 'Science', 'Solar System', 'medium', 1540, 94, 15, 16, 5, 110, '[]', ?)
  `).run(iso(26));

  // 8. Seed Real Persisted Learning Activity (used for Academic Overview, Subject Bars, Weekly Activity, Study Time)
  const activities = [
    { id: 'act-1', type: 'note', title: 'Photosynthesis Notes', subject: 'Science', topic: 'Photosynthesis', mins: 35, score: 92, resId: 'note-photosynthesis', hoursAgo: 2 },
    { id: 'act-2', type: 'quiz', title: 'Maths Quiz - Fractions', subject: 'Maths', topic: 'Quadratic Equations & Fractions', mins: 25, score: 78, resId: 'quiz-maths-1', hoursAgo: 4 },
    { id: 'act-3', type: 'video', title: 'Solar System Video', subject: 'Science', topic: 'Solar System & Planetary Orbits', mins: 20, score: 94, resId: 'res-solar-video', hoursAgo: 24 },
    { id: 'act-4', type: 'model3d', title: 'Human Heart 3D Model', subject: 'Science', topic: 'Human Heart & Cardiac Cycle', mins: 30, score: 90, resId: 'res-heart-3d', hoursAgo: 48 },
    { id: 'act-5', type: 'note', title: 'Grammar Basics & Voice', subject: 'English', topic: 'Grammar Basics', mins: 40, score: 68, resId: 'note-grammar', hoursAgo: 72 },
    { id: 'act-6', type: 'note', title: 'World War II Timeline', subject: 'Social Studies', topic: 'World War II', mins: 35, score: 54, resId: 'note-ww2', hoursAgo: 96 },
    { id: 'act-7', type: 'game', title: 'Answer Battle: Photosynthesis', subject: 'Science', topic: 'Photosynthesis', mins: 15, score: 92, resId: 'game-1', hoursAgo: 6 }
  ];

  const insertAct = db.prepare(`
    INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
    VALUES (?, 'student-vishwak', ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of activities) {
    insertAct.run(a.id, a.type, a.title, a.subject, a.topic, a.mins, a.score, a.resId, iso(a.hoursAgo));
  }

  // 9. Shared Topic Context
  db.prepare(`
    INSERT INTO shared_topic_context (user_id, active_topic, subject, level, explanation_mode, last_conversation_id, last_note_id, updated_at)
    VALUES ('student-vishwak', 'Photosynthesis', 'Science', 'Grade 10', 'simple', 'conv-photosynthesis', 'note-photosynthesis', ?)
  `).run(iso(1));
}

function seedAdminAndTesterDataIfEmpty() {
  const existingTester = db.prepare('SELECT id FROM tester_role_templates LIMIT 1').get() as { id: string } | undefined;
  if (existingTester) return;

  const now = new Date().toISOString();

  // 1. Seed Role Templates
  const insertRole = db.prepare(`
    INSERT INTO tester_role_templates (id, name, description, default_modules_json, default_permissions_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertRole.run(
    'tester_overall',
    'Overall Testing Agent',
    'Full access to test all major modules: Home, Notes, Tutor, Library, Profile, Synthetic Parent Dashboard, Games, 3D Lab, Images, Voice',
    JSON.stringify(['home', 'notes', 'tutor', 'library', 'profile', 'parent_qa', 'games', '3d_lab', 'image_studio', 'voice_teacher']),
    JSON.stringify({ read: true, create: true, edit: true, delete: false, export: true, test_run: true, bug_report: true, view_reports: true }),
    now
  );

  insertRole.run(
    'tester_notes',
    'AI Notes Tester',
    'Specialized QA access to AI Notes, topic-to-notes generation, PDF processing, link processing, editing, saving, image relevance, PDF export, bug reporting',
    JSON.stringify(['notes', 'library']),
    JSON.stringify({ 'notes:read': true, 'notes:create': true, 'notes:edit': true, 'notes:export': true, 'notes:test_run': true, 'bug_report': true }),
    now
  );

  insertRole.run(
    'tester_tutor',
    'AI Tutor Tester',
    'Specialized QA access to AI Tutor, subject/topic classification, knowledge retrieval, explanation quality, diagrams, 3D visualization, voice explanations',
    JSON.stringify(['tutor', '3d_lab', 'voice_teacher']),
    JSON.stringify({ 'tutor:read': true, 'tutor:create': true, '3d:test_run': true, 'voice:test_run': true, 'bug_report': true }),
    now
  );

  insertRole.run(
    'tester_games',
    'Game Tester',
    'Specialized QA access to Educational Games, game dashboard, controls, questions, scoring, levels, difficulty progression, hints, results, game bug reports',
    JSON.stringify(['games']),
    JSON.stringify({ 'games:read': true, 'games:play': true, 'games:test_run': true, 'bug_report': true }),
    now
  );

  // 2. Seed Standard Test Cases
  const insertTC = db.prepare(`
    INSERT INTO test_cases (id, module, title, description, expected_outcome, severity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTC.run('TC-TUTOR-01', 'tutor', 'Photosynthesis Detailed Lesson Generation', 'Verify Mode B tutor produces 14 structured pedagogical sections with real content', 'Detailed structured lesson returned with genuine definitions and formulas', 'critical', now);
  insertTC.run('TC-TUTOR-02', 'tutor', 'Formula and Numerical Calculation Clarity', 'Verify quadratic equation explanation step-by-step calculation without truncation', 'Correct discriminant calculation and real quadratic root values', 'high', now);
  insertTC.run('TC-NOTES-01', 'notes', 'AI Notes Generation from Topic Context', 'Verify Notes engine structures markdown summary, key takeaways, and flashcards correctly', 'Structured note document generated with clear headers and bullet points', 'high', now);
  insertTC.run('TC-NOTES-02', 'notes', 'PDF Export Integrity', 'Verify PDF export produces valid, readable PDF document', 'Decodable PDF format with metadata', 'medium', now);
  insertTC.run('TC-3D-01', '3d_lab', 'Human Heart 3D Scientific Fidelity', 'Verify 3D Lab renders multi-chamber cardiac anatomy instead of generic spheres', 'Accurate 4-chamber cardiac geometry with ventricles and aorta', 'critical', now);
  insertTC.run('TC-VOICE-01', 'voice_teacher', 'Voice Curriculum Outline Generation', 'Verify Voice Teacher produces sequential teaching outline matching AI Tutor explanation', 'Lesson speech sequence with checkpoints and clear spoken narration', 'high', now);
  insertTC.run('TC-GAME-01', 'games', 'Answer Battle Game State & Scoring', 'Verify scoring algorithm, correct streak multipliers, and battle stage progression', 'Score increments accurately; stage clears on threshold', 'medium', now);

  // 3. Seed Initial Tester Accounts
  const insertTester = db.prepare(`
    INSERT INTO tester_accounts (id, user_id, email, full_name, role_template_id, status, is_email_verified, expires_at, created_by, invitation_token, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', 1, ?, 'superadmin-user', ?, ?, ?)
  `);

  const expireOneYear = new Date(Date.now() + 365 * 24 * 3600_000).toISOString();
  insertTester.run('tester-overall-1', 'user-qa-overall', 'qa.overall@studyai.edu', 'Alex Rivera (Lead QA)', 'tester_overall', expireOneYear, 'token-overall', now, now);
  insertTester.run('tester-notes-1', 'user-qa-notes', 'qa.notes@studyai.edu', 'Sarah Lin (Notes QA)', 'tester_notes', expireOneYear, 'token-notes', now, now);
  insertTester.run('tester-tutor-1', 'user-qa-tutor', 'qa.tutor@studyai.edu', 'David Chen (AI Tutor QA)', 'tester_tutor', expireOneYear, 'token-tutor', now, now);
  insertTester.run('tester-games-1', 'user-qa-games', 'qa.games@studyai.edu', 'Maya Patel (Game QA)', 'tester_games', expireOneYear, 'token-games', now, now);

  // 4. Seed Initial Assignments
  const insertAssign = db.prepare(`
    INSERT INTO tester_assignments (id, tester_id, test_case_id, module, priority, status, deadline, assigned_by, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'assigned', ?, 'superadmin-user', ?, ?, ?)
  `);

  const deadlineNextWeek = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();
  insertAssign.run('assign-1', 'tester-tutor-1', 'TC-TUTOR-01', 'tutor', 'critical', deadlineNextWeek, 'Verify complete 14-section pedagogical flow without question repetition', now, now);
  insertAssign.run('assign-2', 'tester-notes-1', 'TC-NOTES-01', 'notes', 'high', deadlineNextWeek, 'Verify flashcard extraction from generated notes', now, now);
  insertAssign.run('assign-3', 'tester-games-1', 'TC-GAME-01', 'games', 'medium', deadlineNextWeek, 'Check stage transition in Answer Battle mode', now, now);
  insertAssign.run('assign-4', 'tester-overall-1', 'TC-3D-01', '3d_lab', 'critical', deadlineNextWeek, 'Verify cardiac procedural 3D model structures', now, now);

  // 5. Seed System Health Events
  const insertHealth = db.prepare(`
    INSERT INTO system_health_events (id, service_name, status, affected_component, issue_description, started_at, last_successful_check, responsible_team, is_resolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  insertHealth.run('health-1', 'AI Tutor Ollama Engine', 'Healthy', 'qwen2.5:7b Local Inference Server', 'Inference latency avg 210ms, 0 errors', now, now, 'AI Infrastructure Team');
  insertHealth.run('health-2', 'Knowledge Nexus Database', 'Healthy', 'PostgreSQL / SQLite Dual Store', 'Indexed queries responding in <15ms', now, now, 'Database Operations Team');
  insertHealth.run('health-3', 'Three.js 3D Generation Pipeline', 'Healthy', 'WebGL / WebGPU Procedural Shaders', 'Scientific asset generator validated', now, now, 'Interactive 3D Team');
  insertHealth.run('health-4', 'AI Voice Teacher Synthesizer', 'Healthy', 'Web Audio PCM / WAV Pipeline', 'Lesson checkpoint vocalization ready', now, now, 'Audio Core Team');

  // 6. Seed Sample Bug Reports
  const insertBug = db.prepare(`
    INSERT INTO bug_reports (id, title, description, affected_module, severity, priority, status, steps_to_reproduce, expected_result, actual_result, screenshot_url, permitted_logs, reporter_id, reporter_email, assigned_developer, fix_version, retest_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBug.run(
    'BUG-2026-001',
    'Periodic Table Element 118 Missing Valence Shell Geometry',
    '3D Model generation for Oganesson does not render the full outermost electron orbital.',
    '3d_lab',
    'medium',
    'medium',
    'In Progress',
    '1. Open 3D Lab\n2. Select Chemistry\n3. Load Oganesson atom',
    '7 complete energy shells rendered',
    'Only 6 shells rendered before truncation',
    '/screenshots/bug-oganesson.png',
    'WebGL context log: maximum uniform buffer count reached',
    'tester-overall-1',
    'qa.overall@studyai.edu',
    'dev.lead@studyai.edu',
    'v1.4.2',
    'Pending fix verification',
    now,
    now
  );
}

function seedLanguageDataIfEmpty() {
  const now = new Date().toISOString();

  // Always ensure default student 'student-vishwak' has initial language enrolments so dashboard is never blank
  const vishwakEnrolCount = db.prepare('SELECT COUNT(*) as c FROM student_language_enrolments WHERE user_id = ?').get('student-vishwak') as { c: number };
  if (!vishwakEnrolCount || vishwakEnrolCount.c === 0) {
    db.prepare(`
      INSERT OR IGNORE INTO student_language_enrolments (
        id, user_id, language_code, support_language_code, is_primary_active,
        current_stage, current_lesson_number, skill_level, completed_lessons_count, total_lessons_count,
        progress_percentage, vocabulary_words_learned, grammar_concepts_learned,
        speaking_exercises_completed, listening_exercises_completed, reading_exercises_completed, writing_exercises_completed,
        average_speaking_accuracy, is_course_completed, last_studied_at, created_at, updated_at
      ) VALUES (
        'enrol-vishwak-ja', 'student-vishwak', 'ja', 'te', 1,
        2, 1, 'Stage 2 Explorer', 3, 24,
        16, 18, 4,
        6, 5, 4, 3,
        91, 0, ?, ?, ?
      )
    `).run(now, now, now);

    db.prepare(`
      INSERT OR IGNORE INTO student_language_enrolments (
        id, user_id, language_code, support_language_code, is_primary_active,
        current_stage, current_lesson_number, skill_level, completed_lessons_count, total_lessons_count,
        progress_percentage, vocabulary_words_learned, grammar_concepts_learned,
        speaking_exercises_completed, listening_exercises_completed, reading_exercises_completed, writing_exercises_completed,
        average_speaking_accuracy, is_course_completed, last_studied_at, created_at, updated_at
      ) VALUES (
        'enrol-vishwak-en', 'student-vishwak', 'en', 'te', 0,
        3, 2, 'Stage 3 Communicator', 7, 24,
        30, 32, 8,
        12, 10, 8, 6,
        94, 0, ?, ?, ?
      )
    `).run(now, now, now);
  }

  const existingLang = db.prepare('SELECT code FROM supported_languages LIMIT 1').get() as { code: string } | undefined;
  if (existingLang) return;

  const insertLang = db.prepare(`
    INSERT INTO supported_languages (code, name, native_name, script_name, flag_emoji, description, speech_recognition_code, speech_synthesis_voice, stages_count, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insertLang.run('en', 'English', 'English', 'Latin Alphabet (A-Z)', '🇬🇧', 'Master global communication, academic fluency, phonetics, and confident conversational expression.', 'en-US', 'Google US English', 8, now);
  insertLang.run('te', 'Telugu', 'తెలుగు', 'తెలుగు లిపి (Telugu Script)', '🏛️', 'Learn the sweet Italian of the East — Achulu, Hallulu, Guninthalu, vibrant vocabulary, and classical conversation.', 'te-IN', 'Google తెలుగు', 8, now);
  insertLang.run('hi', 'Hindi', 'हिन्दी', 'देवनागरी (Devanagari)', '🦚', 'Explore the national language of India — Varnamala, Matras, rich cultural idioms, and expressive speaking.', 'hi-IN', 'Google हिन्दी', 8, now);
  insertLang.run('ja', 'Japanese', '日本語', 'ひらがな, カタカナ & 漢字 (Hiragana, Katakana & Kanji)', '🌸', 'Progressively learn Hiragana, Katakana, core Kanji, politeness levels (Keigo), and Japanese conversational etiquette.', 'ja-JP', 'Google 日本語', 8, now);
  insertLang.run('fr', 'French', 'Français', 'Alphabet Français avec Accents', '🗼', 'Learn the language of diplomacy and culture — nasal sounds, liaison, gender agreements, and Parisian dialogue.', 'fr-FR', 'Google Français', 8, now);
  insertLang.run('de', 'German', 'Deutsch', 'Lateinisches Alphabet mit Umlauten', '🏰', 'Engineered precision — Genders (der, die, das), 4 grammatical cases, compound words, and fluent spoken German.', 'de-DE', 'Google Deutsch', 8, now);
  insertLang.run('es', 'Spanish', 'Español', 'Alfabeto Español con Ñ', '💃', 'Vibrant global tongue — rolled R (erre), Ser vs. Estar, subjunctive moods, and lively everyday conversations.', 'es-ES', 'Google Español', 8, now);

  // Seed sample initial language courses
  const insertCourse = db.prepare(`
    INSERT INTO language_courses (id, language_code, title, level, total_stages, total_lessons, estimated_hours, created_at)
    VALUES (?, ?, ?, 'Beginner to Advanced', 8, 24, 30, ?)
  `);

  insertCourse.run('course-en', 'en', 'Complete English Mastery Course', now);
  insertCourse.run('course-te', 'te', 'Complete Telugu Fluency Course', now);
  insertCourse.run('course-hi', 'hi', 'Complete Hindi Fluency Course', now);
  insertCourse.run('course-ja', 'ja', 'Complete Japanese (Hiragana to N3) Course', now);
  insertCourse.run('course-fr', 'fr', 'Complete French Fluency Course', now);
  insertCourse.run('course-de', 'de', 'Complete German (A1 to B2) Course', now);
  insertCourse.run('course-es', 'es', 'Complete Spanish Fluency Course', now);

  // Seed sample enrolment for default student 'vishwak-1'
  db.prepare(`
    INSERT OR IGNORE INTO student_language_enrolments (
      id, user_id, language_code, support_language_code, is_primary_active,
      current_stage, current_lesson_number, skill_level, completed_lessons_count, total_lessons_count,
      progress_percentage, vocabulary_words_learned, grammar_concepts_learned,
      speaking_exercises_completed, listening_exercises_completed, reading_exercises_completed, writing_exercises_completed,
      average_speaking_accuracy, is_course_completed, last_studied_at, created_at, updated_at
    ) VALUES (
      'enrol-default-en', 'vishwak-1', 'en', 'te', 1,
      1, 1, 'Beginner (Stage 1)', 0, 24,
      0, 0, 0,
      0, 0, 0, 0,
      0, 0, ?, ?, ?
    )
  `).run(now, now, now);
}

function seedEducationalGamesIfEmpty() {
  const existing = db.prepare('SELECT id FROM educational_games_catalog LIMIT 1').get() as { id: string } | undefined;
  if (existing) return;

  const now = new Date().toISOString();
  const insertGame = db.prepare(`
    INSERT INTO educational_games_catalog (
      id, name, slug, description, category, icon, badge_color,
      compatible_subjects_json, supported_difficulties_json, instructions_json, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const games = [
    {
      id: 'game-1',
      name: 'Missing Letters',
      slug: 'missing_letters',
      description: 'Master scientific and academic spelling by filling in missing letter positions with contextual hints.',
      category: 'vocabulary',
      icon: '🔤',
      badge_color: '#10B981',
      compatible_subjects: ['Biology', 'Physics', 'Chemistry', 'Mathematics', 'English', 'History', 'Geography', 'Languages'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Observe the academic term with blank spaces represented by underscores.',
        'Type or select the correct letters to complete the full term.',
        'Request hints if you get stuck, and view the complete definition upon submission.'
      ]
    },
    {
      id: 'game-2',
      name: 'Missing Words',
      slug: 'missing_words',
      description: 'Complete academic statements and law definitions with the correct concept word.',
      category: 'concept',
      icon: '🧩',
      badge_color: '#3B82F6',
      compatible_subjects: ['Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Economics', 'English'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Read the sentence containing an underlined blank space carefully.',
        'Select the correct word from the choices or type in the exact terminology.',
        'Read the educational explanation to reinforce why this term is correct.'
      ]
    },
    {
      id: 'game-3',
      name: 'Match the Pairs',
      slug: 'match_pairs',
      description: 'Connect related terms with their definitions, formulas with principles, or questions with answers.',
      category: 'recall',
      icon: '🔗',
      badge_color: '#8B5CF6',
      compatible_subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Languages'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Click on a card from Group A (left side) to select it.',
        'Click on the corresponding matching card from Group B (right side).',
        'Match all pairs with minimum mistakes to achieve the highest score.'
      ]
    },
    {
      id: 'game-4',
      name: 'MCQ Challenge',
      slug: 'mcq_challenge',
      description: 'Engage with curriculum-grounded multiple-choice questions with real-time concept feedback.',
      category: 'concept',
      icon: '🎯',
      badge_color: '#EC4899',
      compatible_subjects: ['All Academic Subjects', 'Mathematics', 'Science', 'Social Studies', 'English', 'Computer Science'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Review the academic question and examine the four options provided.',
        'Select the single best answer before the round ends.',
        'Review the concept breakdown to learn both why the correct answer is valid and why distractors are invalid.'
      ]
    },
    {
      id: 'game-5',
      name: 'Word Scramble',
      slug: 'word_scramble',
      description: 'Unscramble mixed letter tiles to discover core scientific terms and vocabulary.',
      category: 'vocabulary',
      icon: '🔀',
      badge_color: '#F59E0B',
      compatible_subjects: ['Biology', 'Chemistry', 'Physics', 'Geography', 'English', 'History', 'Languages'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Look at the scrambled letter tiles representing a key topic word.',
        'Click or drag letters into the answer tray in the correct order.',
        'Use the definition hint to guide your spelling if needed.'
      ]
    },
    {
      id: 'game-6',
      name: 'True or False',
      slug: 'true_false',
      description: 'Evaluate factual and conceptual statements to debunk common academic misconceptions.',
      category: 'logic',
      icon: '⚖️',
      badge_color: '#06B6D4',
      compatible_subjects: ['Science', 'History', 'Geography', 'Mathematics', 'Civics', 'Economics'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Carefully evaluate the provided academic statement.',
        'Choose True if the principle is completely valid, or False if it contains a conceptual flaw.',
        'Read the detailed fact explanation after submission.'
      ]
    },
    {
      id: 'game-7',
      name: 'Find the Mistake',
      slug: 'find_mistake',
      description: 'Spot intentional errors in scientific equations, historical dates, or grammar rules and correct them.',
      category: 'critical_thinking',
      icon: '🔍',
      badge_color: '#EF4444',
      compatible_subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English'],
      supported_difficulties: ['easy', 'medium', 'hard'],
      instructions: [
        'Read the formula, sentence, or statement which contains one intentional mistake.',
        'Tap on the flawed token or segment to isolate the error.',
        'Select or type the correct replacement to restore academic accuracy.'
      ]
    }
  ];

  for (const g of games) {
    insertGame.run(
      g.id,
      g.name,
      g.slug,
      g.description,
      g.category,
      g.icon,
      g.badge_color,
      JSON.stringify(g.compatible_subjects),
      JSON.stringify(g.supported_difficulties),
      JSON.stringify(g.instructions),
      now
    );
  }
}
