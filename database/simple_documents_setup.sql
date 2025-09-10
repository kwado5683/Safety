-- Simple single-organization documents setup
-- This removes the org_id foreign key constraint

-- Drop the foreign key constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_org_id_fkey;

-- Remove the org_id column if it exists
ALTER TABLE documents DROP COLUMN IF EXISTS org_id;

-- Remove foreign key constraint on uploaded_by if it exists
ALTER TABLE document_versions DROP CONSTRAINT IF EXISTS document_versions_uploaded_by_fkey;

-- Fix uploaded_by column type if it exists (change from UUID to TEXT)
ALTER TABLE document_versions ALTER COLUMN uploaded_by TYPE TEXT;

-- Create documents table if it doesn't exist (simplified version)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk user IDs
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for documents (allow all authenticated users)
CREATE POLICY "Allow all authenticated users to access documents" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for document_versions (allow all authenticated users)
CREATE POLICY "Allow all authenticated users to access document_versions" ON document_versions
  FOR ALL USING (auth.role() = 'authenticated');

-- Verify the setup
SELECT 'Documents table created successfully' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'documents';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'document_versions';
