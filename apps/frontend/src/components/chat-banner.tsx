'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui';
import { AuthBanner } from './auth';
import { cn } from '@/lib/utils';

export const ChatBanner: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const authRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  const handleStart = () => {
    setShowAuth(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (authRef.current) {
          authRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Try to focus first input inside AuthBanner for accessibility, if present.
          const input = authRef.current.querySelector<HTMLInputElement>(
            'input, [tabindex]:not([tabindex="-1"])',
          );
          if (input) input.focus();
        }
      }, 50);
    });
  };

  const handleCancel = () => {
    // Hide the AuthBanner and scroll back to the hero content.
    setShowAuth(false);

    // Wait a tick so the hero expands/animates, then scroll to it.
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (heroRef.current) {
          heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

          const startBtn = heroRef.current.querySelector<HTMLButtonElement>('button');
          if (startBtn) startBtn.focus();
        }
      }, 50);
    });
  };

  return (
    <div className="min-h-screen">
      <div
        aria-hidden={showAuth}
        className={cn(
          'mx-auto mt-2 md:w-[481px] transition-[max-height,opacity,transform] duration-500 ease-in-out overflow-hidden',
          showAuth ? 'max-h-0 opacity-0 -translate-y-4' : 'max-h-[520px] opacity-100 translate-y-0',
        )}
      >
        <div className="flex flex-col justify-center items-center md:w-[481px] h-[437px] mt-5">
          {/* Dark-mode logo (hidden in light mode) */}
          <div className="hidden dark:flex rounded-full p-4 border-[0.2px] border-grey-450">
            <Image src="/darkchat.svg" alt="Dark mode chat icon" width={100} height={100} />
          </div>

          {/* Light-mode logo (hidden in dark mode) */}
          <div className="flex dark:hidden rounded-full p-4 border-[0.2px] border-grey-900">
            <Image src="/chatlogo.svg" alt="Light mode chat icon" width={100} height={100} />
          </div>

          <div className="flex flex-col items-center justify-center text-center mt-6">
            <h2 className="text-xs mt-4 text-grey-450">BOOMSCORE AI ASSISTANT</h2>
            <h1 className="font-semibold text-2xl">Ask BoomScore AI</h1>
            <h2 className="text-2xl font-semibold text-grey-450">just anything...</h2>
          </div>
          <div className="mt-6">
            <Button size="lg" className="bg-[#2bbb82]" onClick={handleStart}>
              Start a Chat
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={authRef}
        aria-hidden={!showAuth}
     className={cn(
    "mx-auto mt-2 w-full md:max-w-[640px] transition-[max-height,opacity,transform] duration-500 ease-in-out overflow-hidden",
    showAuth
      ? "max-h-[2000px] opacity-100 translate-y-0"
      : "max-h-0 opacity-0 -translate-y-4"
  )}
      >
        <div className="md:w-[481px] mx-auto">
          <AuthBanner onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};
