-- ===================================================================
-- Audique 2.0 - Initial Database Schema
-- V1__initial_schema.sql
-- ===================================================================

-- Users table: maps Supabase auth identity to application user
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supabase_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_supabase_id ON users(supabase_user_id);
CREATE INDEX idx_users_email ON users(email);

-- Lecture Sessions table
CREATE TABLE IF NOT EXISTS lecture_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    audio_file_path VARCHAR(1000),
    duration INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lectures_user_id ON lecture_sessions(user_id);
CREATE INDEX idx_lectures_status ON lecture_sessions(status);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lecture_session_id UUID NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    full_text TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcripts_lecture_id ON transcripts(lecture_session_id);

-- Summaries table (supports versioning for regeneration)
CREATE TABLE IF NOT EXISTS summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lecture_session_id UUID NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summaries_lecture_id ON summaries(lecture_session_id);

-- Notes table (multiple per lecture, editable)
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lecture_session_id UUID NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    heading VARCHAR(500),
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_lecture_id ON notes(lecture_session_id);

-- Flashcards table (multiple per lecture, editable)
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lecture_session_id UUID NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcards_lecture_id ON flashcards(lecture_session_id);

