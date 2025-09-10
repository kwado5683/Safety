-- Create document_versions table for tracking document versions
-- This table stores information about each version of a document
-- Updated to match the user's actual table schema

CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  version int NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now(),
  
  -- Ensure unique version per document
  UNIQUE(document_id, version)
);

-- Create index for better query performance
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_uploaded_at ON document_versions(uploaded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for document_versions
-- Users can only see versions of documents from their organization
CREATE POLICY "Users can view document versions from their organization" ON document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE org_id = auth.jwt() ->> 'org_id'
    )
  );

-- Users can insert new versions for documents in their organization
CREATE POLICY "Users can create document versions in their organization" ON document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE org_id = auth.jwt() ->> 'org_id'
    )
  );

-- Users can update versions for documents in their organization
CREATE POLICY "Users can update document versions in their organization" ON document_versions
  FOR UPDATE USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE org_id = auth.jwt() ->> 'org_id'
    )
  );

-- Users can delete versions for documents in their organization
CREATE POLICY "Users can delete document versions in their organization" ON document_versions
  FOR DELETE USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE org_id = auth.jwt() ->> 'org_id'
    )
  );
