-- 1. Create Storage Bucket
-- Run this in your Supabase Dashboard SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- Allow public access for viewing (since we use publicUrl)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'client-documents');

-- Allow authenticated users to upload
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'client-documents' AND auth.role() = 'authenticated');

-- 3. Database RLS Policies (Table: documents)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can do everything on documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 4. Database RLS Policies (Table: session_notes)
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" ON session_notes
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can do everything on session_notes" ON session_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
