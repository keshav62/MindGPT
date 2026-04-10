import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

function Message({ message, isNew, onTypingDone }) {
  const [displayText, setDisplayText] = useState(isNew ? '' : message.content);
  const [isTyping, setIsTyping]       = useState(isNew && !message.isImage);
  const [copied, setCopied]           = useState(false);
  const indexRef      = useRef(0);
  const onDoneRef     = useRef(onTypingDone); // always-fresh callback, no deps needed

  // Keep the callback ref up-to-date
  useEffect(() => { onDoneRef.current = onTypingDone; });

  // Prism highlight after content settles
  useEffect(() => {
    Prism.highlightAll();
  }, [displayText]);

  // Typing animation — runs ONCE on mount only.
  // Using [] intentionally so the interval is never restarted if isNew flips to false.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isNew || message.isImage) {
      // Existing / image messages: show full content immediately
      setDisplayText(message.content);
      setIsTyping(false);
      return;
    }

    indexRef.current = 0;
    setDisplayText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayText(message.content.slice(0, indexRef.current));

      if (indexRef.current >= message.content.length) {
        clearInterval(interval);
        setIsTyping(false);
        onDoneRef.current?.(); // call via ref so we always have the latest version
      }
    }, 12);

    return () => clearInterval(interval);
  }, []); // ← [] is intentional: fire once on mount, never interrupted

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── User message ──────────────────────────────────────────────────────
  if (message.role === 'user') {
    return (
      <div className='flex items-start justify-end my-4 gap-2'>
        <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl'>
          <p className='text-sm dark:text-white'>{message.content}</p>
          <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
        <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
      </div>
    );
  }

  // ── Assistant message ──────────────────────────────────────────────────
  return (
    <div className='group relative inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 dark:text-primary border border-[#80609F]/30 rounded-md my-4'>

      {/* Image response */}
      {message.isImage ? (
        <img src={message.content} className='w-full max-w-md mt-2 rounded-md' alt="AI generated" />
      ) : (
        <>
          {/* Typed text */}
          <div className='text-sm dark:text-white reset-tw'>
            <Markdown>{displayText}</Markdown>

            {/* Blinking cursor while typing */}
            {isTyping && (
              <span className='inline-block w-[2px] h-4 ml-0.5 bg-purple-500 align-middle animate-pulse rounded-full' />
            )}
          </div>

          {/* Copy button — appears on hover, bottom-right */}
          {!isTyping && (
            <button
              onClick={handleCopy}
              title='Copy response'
              className='absolute bottom-2 right-2 opacity-0 group-hover:opacity-100
                         transition-all duration-200 hover:scale-110 active:scale-95'
            >
              {copied ? (
                // Green checkmark
                <svg className='w-4 h-4 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
              ) : (
                // Clipboard icon
                <svg className='w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
                </svg>
              )}
            </button>
          )}
        </>
      )}

      <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
        {moment(message.timestamp).fromNow()}
      </span>
    </div>
  );
}

export default Message
