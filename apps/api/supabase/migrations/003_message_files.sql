-- 003: messages 테이블에 파일 관련 컬럼 추가
ALTER TABLE messages ADD COLUMN message_type VARCHAR(10) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file'));
ALTER TABLE messages ADD COLUMN file_url TEXT;
ALTER TABLE messages ADD COLUMN file_name TEXT;
ALTER TABLE messages ADD COLUMN file_size BIGINT;
