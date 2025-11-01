'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useMobile } from '@/lib/utils/use-mobile';
import { Button, Chat, ChatBanner } from '@/components';
import { useScrollRestoration } from '@/lib/utils/use-scroll-restoration';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AuthBanner } from '@/components/auth';
import { getCurrentUser } from '@/lib/auth/client';

// graphQl

export default function FixturesLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { scrollElementRef } = useScrollRestoration('fixtures-scroll');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

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
  }, []);

  const handleCancel = () => {
    setIsSheetOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsSheetOpen(false);
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

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <div ref={scrollElementRef} className="flex-1  w-full h-full overflow-y-auto ">
          {children}
        </div>

        <div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40">
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">Open chat</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="w-full px-4 sm:px-10 h-[100vh]  p-0  border-0 dark:bg-[#191a1a]"
            >
              <VisuallyHidden>
                <SheetTitle>Chat Panel</SheetTitle>
              </VisuallyHidden>

              <div className="h-full flex flex-col py-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-text-grey">Loading...</div>
                  </div>
                ) : isAuthenticated ? (
                  <div className="min-h-sreen">
                    <Chat />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full">
                    <div className="w-full max-w-lg mx-auto">
                      <AuthBanner onCancel={handleCancel} onSuccess={handleAuthSuccess} />
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div
        ref={scrollElementRef}
        className="max-w-[600px] w-full h-full overflow-y-auto no-scrollbar"
      >
        {children}
      </div>

      <div className="border-l border-border flex-1 p-1">
        <div className="flex flex-col bg-app-background rounded-2xl h-full">
          <div className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-text-grey">Loading...</div>
              </div>
            ) : isAuthenticated ? (
              <Chat />
            ) : (
              <ChatBanner />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
