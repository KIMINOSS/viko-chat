-- chat-files 버킷 Storage 정책
-- 인증된 사용자 업로드 허용
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

-- 누구나 읽기 허용 (public 버킷)
CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-files');
