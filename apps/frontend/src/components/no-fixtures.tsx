import Image from 'next/image';
import React from 'react';

export const NoFixtures = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <div className="flex flex-col">
      <p className=" py-4 text-text-grey font-semibold">Search results for "{searchQuery}"</p>
      <div className="flex flex-col min-h-screen bg-app-background rounded-2xl pt-10 items-center">
        <Image src="/search.svg" alt="Search icon" width={100} height={100} />
        <div className="flex flex-col justify-center items-center gap-1 mt-3">
          <h3 className="font-semibold text-2xl">No Search results for</h3>
          <h3 className="text-2xl font-semibold text-text-grey">{searchQuery}</h3>
        </div>
      </div>
    </div>
  );
};
