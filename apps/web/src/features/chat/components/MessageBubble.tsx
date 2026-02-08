import { useState } from 'react';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Own: show original by default. Other's: show translated by default.
  const [showOriginal, setShowOriginal] = useState(isOwn);

  const displayText = showOriginal ? message.content : (message.translated ?? message.content);
  const hasTranslation = !!message.translated;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="max-w-[75%]">
        <div
          onClick={() => hasTranslation && setShowOriginal(!showOriginal)}
          className={`inline-block rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed ${
            isOwn
              ? 'rounded-br-md bg-indigo-500 text-white'
              : 'rounded-bl-md bg-white text-gray-900 shadow-sm'
          } ${hasTranslation ? 'cursor-pointer active:opacity-80' : ''}`}
        >
          {displayText}
        </div>
        <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
          <span>{time}</span>
          {hasTranslation && (
            <span className="rounded-full bg-gray-100 px-1.5 py-px text-[9px]">
              {showOriginal ? message.source_lang : message.target_lang}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
