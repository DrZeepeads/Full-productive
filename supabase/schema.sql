-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create chats table
-- Removed user_id column and its reference to profiles
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  reactions TEXT[] DEFAULT '{}'
);

-- Create knowledge_base table with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  chapter TEXT,
  section TEXT,
  embedding vector(1536), -- OpenAI/Mistral embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medical_tools_usage table for tracking tool usage
-- Removed user_id column and its reference to profiles
CREATE TABLE IF NOT EXISTS medical_tools_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
-- Removed idx_chats_user_id
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON knowledge_base(source);
-- Removed idx_medical_tools_user_id
CREATE INDEX IF NOT EXISTS idx_medical_tools_created_at ON medical_tools_usage(created_at DESC);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  chapter TEXT,
  section TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.title,
    knowledge_base.content,
    knowledge_base.source,
    knowledge_base.chapter,
    knowledge_base.section,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
-- Removed trigger for profiles table
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies are removed for profiles, chats, messages, medical_tools_usage.
-- By default, tables are publicly accessible if no RLS is enabled or no policies are defined.
-- If stricter control is needed, new, non-user-specific RLS policies could be added.
-- For now, we assume public accessibility for these tables.

-- The profiles table is removed.
-- The handle_new_user function and its trigger on auth.users are removed.
-- All user-specific RLS policies are removed.

-- Ensure RLS is disabled for tables that should be public, or no policies are present.
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_tools_usage DISABLE ROW LEVEL SECURITY;
-- knowledge_base is intended to be publicly readable. If RLS was ever enabled, disable it.
-- ALTER TABLE knowledge_base DISABLE ROW LEVEL SECURITY; -- Uncomment if needed

-- Note: The `auth.users` table is managed by Supabase Auth.
-- We are not dropping it here, but all our application's dependencies on it are removed.
-- If Supabase Auth is no longer needed at all for the project, it can be disabled in Supabase project settings.

