import { useState } from 'react';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Own: show original by default. Other's: show translated by default.
  const [showOriginal, setShowOriginal] = useState(isOwn);
  const [imageFullscreen, setImageFullscreen] = useState(false);

  const messageType = message.message_type ?? 'text';
  const displayText = showOriginal ? message.content : (message.translated ?? message.content);
  const hasTranslation = !!message.translated;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bubbleBase = isOwn
    ? 'rounded-br-md bg-indigo-500 text-white'
    : 'rounded-bl-md bg-white text-gray-900 shadow-sm';

  // 이미지 메시지
  if (messageType === 'image' && message.file_url) {
    return (
      <>
        {imageFullscreen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setImageFullscreen(false)}
          >
            <img src={message.file_url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
        )}
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
          <div className="max-w-[75%]">
            <div
              className={`inline-block overflow-hidden rounded-2xl ${bubbleBase} cursor-pointer`}
              onClick={() => setImageFullscreen(true)}
            >
              <img
                src={message.file_url}
                alt={message.file_name ?? 'Image'}
                className="max-h-60 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
              <span>{time}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 동영상 메시지
  if (messageType === 'video' && message.file_url) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="max-w-[75%]">
          <div className={`inline-block overflow-hidden rounded-2xl ${bubbleBase}`}>
            <video
              src={message.file_url}
              controls
              preload="metadata"
              className="max-h-60 w-full rounded-lg"
            />
          </div>
          <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // 파일 메시지
  if (messageType === 'file' && message.file_url) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="max-w-[75%]">
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 ${bubbleBase} no-underline`}
          >
            <svg className="h-8 w-8 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{message.file_name ?? 'File'}</p>
              {message.file_size && (
                <p className="text-xs opacity-60">{formatFileSize(message.file_size)}</p>
              )}
            </div>
          </a>
          <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // 텍스트 메시지 (기존)
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="max-w-[75%]">
        <div
          onClick={() => hasTranslation && setShowOriginal(!showOriginal)}
          className={`inline-block rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed ${bubbleBase} ${hasTranslation ? 'cursor-pointer active:opacity-80' : ''}`}
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
