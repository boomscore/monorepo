'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Skeleton } from '@/components';
import Image from 'next/image';
// Define local types for H2H data structure
interface HeadToHeadMatch {
  id: string;
  homeTeam: { id: string; name: string; logo?: string };
  awayTeam: { id: string; name: string; logo?: string };
  homeScore: number;
  awayScore: number;
  startTime: string;
  league: { name: string };
}

const GET_HEAD_TO_HEAD_STATS = gql`
  query GetHeadToHeadStats($homeTeamId: String!, $awayTeamId: String!) {
    headToHeadStats(homeTeamId: $homeTeamId, awayTeamId: $awayTeamId) {
      totalMatches
      homeWins
      awayWins
      draws
      totalGoals
      homeGoals
      awayGoals
      homeWinPercent
      awayWinPercent
      drawPercent
      avgPointsPerGame
      recentMatches {
        id
        homeTeam {
          id
          name
          logo
        }
        awayTeam {
          id
          name
          logo
        }
        homeScore
        awayScore
        startTime
        league {
          name
        }
      }
    }
  }
`;

interface HeadToHeadProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export const HeadToHead: React.FC<HeadToHeadProps> = ({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
}) => {
  const { data, loading, error } = useQuery(GET_HEAD_TO_HEAD_STATS, {
    variables: { homeTeamId, awayTeamId },
  });

  if (loading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 ">
        <p>Error loading head-to-head data</p>
      </div>
    );
  }

  const stats = data?.headToHeadStats;
  const matches = stats?.recentMatches || [];

  if (!stats || stats.totalMatches === 0) {
    return (
      <div className="p-4 text-center ">
        <p>No previous matches found</p>
      </div>
    );
  }

  const homeWinPercent = stats.homeWinPercent.toFixed(1);
  const drawPercent = stats.drawPercent.toFixed(1);
  const awayWinPercent = stats.awayWinPercent.toFixed(1);
  const avgPointsPerGame = stats.avgPointsPerGame.toFixed(1);

  return (
    // <div className="p-4">
    //   <div className="text-center mb-4">
    //     <div className="text-lg font-bold mb-1">
    //       {homeTeamName} {stats.homeWins}-{stats.draws}-{stats.awayWins} {awayTeamName}
    //     </div>
    //     <div className="text-sm text-gray-600 mb-1">(Home-Draw-Away)</div>
    //     <div className="text-sm text-gray-600">{stats.totalMatches} matches played</div>
    //   </div>

    //   {/* Statistics Grid */}
    //   <div className="grid grid-cols-2 gap-4 text-sm mb-6">
    //     <div className="space-y-2">
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">Total Goals</span>
    //         <span className=">{stats.totalGoals}</span>
    //       </div>
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">Avg Points/Game</span>
    //         <span className=">{avgPointsPerGame}</span>
    //       </div>
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">Goals For</span>
    //         <span className=">
    //           {stats.homeGoals} - {stats.awayGoals}
    //         </span>
    //       </div>
    //     </div>
    //     <div className="space-y-2">
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">{homeTeamName} Win %</span>
    //         <span className=">{homeWinPercent}%</span>
    //       </div>
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">Draw %</span>
    //         <span className=">{drawPercent}%</span>
    //       </div>
    //       <div className="flex justify-between">
    //         <span className="text-gray-600">{awayTeamName} Win %</span>
    //         <span className="font-medium">{awayWinPercent}%</span>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Last Meeting */}
    //   {matches.length > 0 && (
    //     <div className="mb-6">
    //       <h4 className="font-medium text-sm mb-3">Last Meeting:</h4>
    //       {(() => {
    //         const lastMatch = matches[0];
    //         const matchDate = new Date(lastMatch.startTime);
    //         return (
    //           <div
    //             key={lastMatch.id}
    //             className="flex items-center justify-between text-sm border-b border-gray-200 pb-3"
    //           >
    //             <div className="text-gray-600 min-w-[60px]">
    //               {matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
    //             </div>
    //             <div className="flex items-center gap-2 flex-1 justify-center">
    //               {/* Home Team */}
    //               <div className="flex items-center gap-1">
    //                 {lastMatch.homeTeam.logo && (
    //                   <div className="w-4 h-4 relative">
    //                     <Image
    //                       src={lastMatch.homeTeam.logo}
    //                       alt={lastMatch.homeTeam.name}
    //                       width={16}
    //                       height={16}
    //                       className="object-contain"
    //                     />
    //                   </div>
    //                 )}
    //                 <span className="text-xs font-medium">{lastMatch.homeTeam.name}</span>
    //               </div>

    //               {/* Score */}
    //               <div className="font-bold text-base mx-2">
    //                 {lastMatch.homeScore}-{lastMatch.awayScore}
    //               </div>

    //               {/* Away Team */}
    //               <div className="flex items-center gap-1">
    //                 {lastMatch.awayTeam.logo && (
    //                   <div className="w-4 h-4 relative">
    //                     <Image
    //                       src={lastMatch.awayTeam.logo}
    //                       alt={lastMatch.awayTeam.name}
    //                       width={16}
    //                       height={16}
    //                       className="object-contain"
    //                     />
    //                   </div>
    //                 )}
    //                 <span className="text-xs font-medium">{lastMatch.awayTeam.name}</span>
    //               </div>
    //             </div>
    //             <div className="text-xs text-gray-600 min-w-[80px] text-right">
    //               {lastMatch.league.name}
    //             </div>
    //           </div>
    //         );
    //       })()}
    //     </div>
    //   )}

    //   {/* Recent Meetings */}
    //   {matches.length > 1 && (
    //     <div>
    //       <h4 className="font-medium text-sm mb-3">Recent Meetings:</h4>
    //       <div className="space-y-2">
    //         {matches.slice(1, 6).map((match: HeadToHeadMatch) => {
    //           const matchDate = new Date(match.startTime);
    //           return (
    //             <div
    //               key={match.id}
    //               className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
    //             >
    //               <div className="text-gray-600 min-w-[60px]">
    //                 {matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
    //               </div>
    //               <div className="flex items-center gap-2 flex-1 justify-center">
    //                 {/* Home Team */}
    //                 <div className="flex items-center gap-1">
    //                   {match.homeTeam.logo && (
    //                     <div className="w-4 h-4 relative">
    //                       <Image
    //                         src={match.homeTeam.logo}
    //                         alt={match.homeTeam.name}
    //                         width={16}
    //                         height={16}
    //                         className="object-contain"
    //                       />
    //                     </div>
    //                   )}
    //                   <span className="text-xs">{match.homeTeam.name}</span>
    //                 </div>

    //                 {/* Score */}
    //                 <div className="font-bold mx-2">
    //                   {match.homeScore}-{match.awayScore}
    //                 </div>

    //                 {/* Away Team */}
    //                 <div className="flex items-center gap-1">
    //                   {match.awayTeam.logo && (
    //                     <div className="w-4 h-4 relative">
    //                       <Image
    //                         src={match.awayTeam.logo}
    //                         alt={match.awayTeam.name}
    //                         width={16}
    //                         height={16}
    //                         className="object-contain"
    //                       />
    //                     </div>
    //                   )}
    //                   <span className="text-xs">{match.awayTeam.name}</span>
    //                 </div>
    //               </div>
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </div>
    //   )}
    // </div>

    <section>
      <div className="flex items-center justify-between text-text-grey ">
        <div className="flex items-center gap-2">
          <Image
            src={homeTeamLogo}
            alt={homeTeamName}
            width={16}
            height={16}
            className="object-contain"
          />
          <p className="text-sm">{homeTeamName}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm">{stats.totalMatches} matches played</p>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={awayTeamLogo}
            alt={awayTeamName}
            width={16}
            height={16}
            className="object-contain"
          />
          <p className="text-sm">{awayTeamName}</p>
        </div>
      </div>



      <Card padding="none">
        <div className=""></div>


      </Card>
    </section>
  );
};
