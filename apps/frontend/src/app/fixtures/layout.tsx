'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useMobile } from '@/lib/utils/use-mobile';
import { Button, Chat } from '@/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function FixturesLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">{children}</div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Open chat</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="w-full sm:max-w-md h-[calc(100vh-64px)]">
            <SheetHeader>
              <SheetTitle>Chat Assistant</SheetTitle>
            </SheetHeader>
            <div className="flex-1 mt-4">
              <Chat />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="max-w-[600px] w-full h-full overflow-y-auto scrollable">{children}</div>

      <div className="border-l border-[#F2F2F2] flex-1 p-1">
        <div className="flex flex-col h-full bg-[#FAFAFA] rounded-2xl">
          <div className="flex-1">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
