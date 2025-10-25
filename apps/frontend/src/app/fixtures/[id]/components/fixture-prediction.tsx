import { Button } from '@/components';
import React from 'react';

export const FixturePrediction = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-base font-medium">AI prediction</p>
          <p className="text-sm text-text-grey">Make a prediction for this match</p>
        </div>
        <Button className="bg-primary">Generate prediction</Button>
      </div>
    </div>
  );
};
