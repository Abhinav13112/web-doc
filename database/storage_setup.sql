-- ==============================================================================
-- DOCUVAULT - SUPABASE STORAGE CONFIGURATION & POLICIES
-- Run this in the Supabase SQL Editor to initialize the storage bucket
-- ==============================================================================

-- 1. Create the 'documents' bucket if it doesn't already exist (Private Bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Private bucket: access requires authenticated signed URLs
    52428800, -- 50 MB limit in bytes
    NULL -- All validated document MIME types allowed
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 52428800;

-- 2. Storage Policies for Row Level Security (RLS) on storage.objects

-- Allow authenticated users to upload files only into their own user folder: `userId/...`
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view/download their own documents
CREATE POLICY "Users can read their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
