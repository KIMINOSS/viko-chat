import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import type { MessageType } from '@/types';

interface MessageInputProps {
  onSend: (content: string) => void;
  onFileSend: (file: File, messageType: MessageType) => void;
}

export function MessageInput({ onSend, onFileSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [preview, setPreview] = useState<{ url: string; file: File; type: MessageType } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 이모지 피커 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
    inputRef.current?.focus();
  }

  function handleEmojiSelect(emoji: { native: string }) {
    setText((prev) => prev + emoji.native);
    inputRef.current?.focus();
  }

  function getMessageType(file: File): MessageType {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = getMessageType(file);

    if (type === 'image') {
      const url = URL.createObjectURL(file);
      setPreview({ url, file, type });
    } else {
      onFileSend(file, type);
    }

    // reset input
    e.target.value = '';
  }

  function handlePreviewSend() {
    if (!preview) return;
    onFileSend(preview.file, preview.type);
    URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  function handlePreviewCancel() {
    if (!preview) return;
    URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  return (
    <>
      {/* 이미지 미리보기 오버레이 */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4">
            <img
              src={preview.url}
              alt="Preview"
              className="mb-3 max-h-64 w-full rounded-lg object-contain"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePreviewCancel}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewSend}
                className="flex-1 rounded-full bg-indigo-500 py-2.5 text-sm font-medium text-white transition active:scale-95"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-[calc(3.5rem+var(--sab))] left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-3 py-2 backdrop-blur-lg"
      >
        {/* 이모지 피커 */}
        {showEmojiPicker && (
          <div ref={emojiRef} className="absolute bottom-full left-2 right-2 mb-1">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
              maxFrequentRows={2}
              perLine={8}
            />
          </div>
        )}

        <div className="mx-auto flex max-w-lg items-center gap-1.5">
          {/* 이모지 버튼 */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </button>

          {/* 첨부파일 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-600 active:scale-95 disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 0 0-1.788 0l-7 14a1 1 0 0 0 1.169 1.409l5-1.429A1 1 0 0 0 9 15.571V11a1 1 0 1 1 2 0v4.571a1 1 0 0 0 .725.962l5 1.428a1 1 0 0 0 1.17-1.408l-7-14Z" />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}
