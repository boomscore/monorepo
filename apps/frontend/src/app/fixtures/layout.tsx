'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useMobile } from '@/lib/utils/use-mobile';
import { Button, Chat, ChatBanner } from '@/components';
import { useScrollRestoration } from '@/lib/utils/use-scroll-restoration';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// graphQl

export default function FixturesLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { scrollElementRef } = useScrollRestoration('fixtures-scroll');


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
            className="w-full px-4 sm:px-10 h-[80vh] sm:h-[calc(100vh-64px)] p-0 rounded-t-3xl border-0 dark:bg-[#191a1a]"
          >
            {/* ✅ Hidden accessible title */}
            <VisuallyHidden>
              <SheetTitle>Chat Panel</SheetTitle>
            </VisuallyHidden>

            <div className="h-full flex flex-col justify-center items-center py-6">
              <div className="w-full max-w-lg mx-auto">
                <ChatBanner />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
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
        <div className="flex flex-col min-h-screen bg-app-background rounded-2xl">
          <div className="flex-1 ">
            <ChatBanner />
            {/* <Chat /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
