import { FixtureGames, SportsTypeTabs } from './components';
import { FixturesList } from './components/fixtures-list';

export default function FixturesPage() {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto bg-app-background gap-6 flex flex-col">
      <div className="mb-6">
        <div className="border-y-1 border-grey-300 py-4">
          <SportsTypeTabs />
        </div>
        <div>
          <FixtureGames today={today} />
        </div>
      </div>
      <FixturesList initialDate={today} />
    </div>
  );
}
