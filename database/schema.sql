-- ==============================================================================
-- DOCUVAULT - DATABASE SCHEMA DEFINITION
-- PostgreSQL Schema for Supabase
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(127) NOT NULL,
    file_ext VARCHAR(32) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    category VARCHAR(32) NOT NULL DEFAULT 'other', 
    -- Allowed categories: 'pdf', 'word', 'spreadsheet', 'presentation', 'image', 'text', 'archive', 'other'
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
    trashed_at TIMESTAMPTZ NULL,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_category ON public.documents(user_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_user_trashed ON public.documents(user_id, is_trashed);
CREATE INDEX IF NOT EXISTS idx_documents_user_favorite ON public.documents(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_name_search ON public.documents USING gin(to_tsvector('english', name));

-- 4. Automatic Updated_At Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies
-- Users can only view their own non-trashed or trashed documents
CREATE POLICY "Users can view own documents"
    ON public.documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert records with their own user_id
CREATE POLICY "Users can insert own documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own documents
CREATE POLICY "Users can update own documents"
    ON public.documents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own documents
CREATE POLICY "Users can delete own documents"
    ON public.documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Helper Aggregation Function for Fast User Storage Stats
CREATE OR REPLACE FUNCTION public.get_user_document_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Ensure user can only query their own stats unless caller is service_role
    IF auth.uid() IS NOT NULL AND auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized access to user statistics';
    END IF;

    SELECT json_build_object(
        'total_documents', COUNT(*),
        'total_size_bytes', COALESCE(SUM(file_size), 0),
        'total_favorites', COUNT(*) FILTER (WHERE is_favorite = TRUE AND is_trashed = FALSE),
        'total_trashed', COUNT(*) FILTER (WHERE is_trashed = TRUE),
        'category_counts', json_build_object(
            'pdf', COUNT(*) FILTER (WHERE category = 'pdf' AND is_trashed = FALSE),
            'word', COUNT(*) FILTER (WHERE category = 'word' AND is_trashed = FALSE),
            'spreadsheet', COUNT(*) FILTER (WHERE category = 'spreadsheet' AND is_trashed = FALSE),
            'presentation', COUNT(*) FILTER (WHERE category = 'presentation' AND is_trashed = FALSE),
            'image', COUNT(*) FILTER (WHERE category = 'image' AND is_trashed = FALSE),
            'text', COUNT(*) FILTER (WHERE category = 'text' AND is_trashed = FALSE),
            'archive', COUNT(*) FILTER (WHERE category = 'archive' AND is_trashed = FALSE),
            'other', COUNT(*) FILTER (WHERE category = 'other' AND is_trashed = FALSE)
        ),
        'category_sizes', json_build_object(
            'pdf', COALESCE(SUM(file_size) FILTER (WHERE category = 'pdf' AND is_trashed = FALSE), 0),
            'word', COALESCE(SUM(file_size) FILTER (WHERE category = 'word' AND is_trashed = FALSE), 0),
            'spreadsheet', COALESCE(SUM(file_size) FILTER (WHERE category = 'spreadsheet' AND is_trashed = FALSE), 0),
            'presentation', COALESCE(SUM(file_size) FILTER (WHERE category = 'presentation' AND is_trashed = FALSE), 0),
            'image', COALESCE(SUM(file_size) FILTER (WHERE category = 'image' AND is_trashed = FALSE), 0),
            'text', COALESCE(SUM(file_size) FILTER (WHERE category = 'text' AND is_trashed = FALSE), 0),
            'archive', COALESCE(SUM(file_size) FILTER (WHERE category = 'archive' AND is_trashed = FALSE), 0),
            'other', COALESCE(SUM(file_size) FILTER (WHERE category = 'other' AND is_trashed = FALSE), 0)
        )
    ) INTO result
    FROM public.documents
    WHERE user_id = target_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
