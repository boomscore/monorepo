import { Badge } from '@/components';
import React from 'react';

//render a list of sport types as gotten from the backend
export const FixtureSportType = () => {
  return (
    <div className="flex gap-2 items-center">
      <Badge variant="primary">Football</Badge>
      <Badge>Basketball</Badge>
    </div>
  );
};
