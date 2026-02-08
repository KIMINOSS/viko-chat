import { useState, useRef } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-[calc(3.5rem+var(--sab))] left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-3 py-2 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
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
  );
}
