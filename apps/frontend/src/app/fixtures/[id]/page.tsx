'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Separator } from '@/components';
import { ArrowLeftIcon } from 'lucide-react';
import { FixtureContent } from './components/fixture-content';

export default function FixtureDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto">
      <div className="p-4 flex items-center gap-2">
        <Button onClick={handleGoBack} variant="ghost" size="sm">
          <ArrowLeftIcon />
        </Button>
        <p>Fixture details</p>
      </div>
      <Separator />
      <div className="p-4">
        <FixtureContent />
      </div>
    </div>
  );
}
