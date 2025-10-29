'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui';
import { AuthBanner } from './auth/auth';
import { Chat } from './chat';
import { getCurrentUser } from '@/lib/auth/client';

export const ChatBanner: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      setIsLoading(true);
      checkAuth();
    };

    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  const handleStart = () => {
    setShowAuth(true);
  };

  const handleCancel = () => {
    setShowAuth(false);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsLoading(true);
    getCurrentUser()
      .then(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  };

 
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-text-grey">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col ">
        <Chat />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      {!showAuth && (
        <div className="flex flex-col justify-center items-center md:w-[481px] h-[437px] mt-5 mx-auto">
          {/* Dark-mode logo (hidden in light mode) */}
          <div className="hidden dark:flex rounded-full p-4 border-[0.2px] border-grey-450">
            <Image src="/darkchat.svg" alt="Dark mode chat icon" width={100} height={100} />
          </div>

          {/* Light-mode logo (hidden in dark mode) */}
          <div className="flex dark:hidden rounded-full p-4 border-[0.2px] border-border-grey">
            <Image src="/chatlogo.svg" alt="Light mode chat icon" width={100} height={100} />
          </div>

          <div className="flex flex-col items-center justify-center text-center mt-6">
            <h3 className="text-xs mt-4 text-text-grey">BOOMSCORE AI ASSISTANT</h3>
            <h1 className="font-semibold text-2xl">Ask BoomScore AI</h1>
            <h3 className="text-2xl font-semibold text-text-grey">just anything...</h3>
          </div>
          <div className="mt-6">
            <Button size="lg" onClick={handleStart}>
              Start a Chat
            </Button>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="mx-auto mt-2 w-full md:max-w-[481px]">
          <AuthBanner onCancel={handleCancel} onSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
};
