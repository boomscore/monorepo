import { FixturesList } from './components/fixtures-list';

export default function FixturesPage() {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto bg-app-background ">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Fixtures</h1>
        <p className="text-gray-600">Today's matches grouped by league</p>
      </div>
      <FixturesList initialDate={today} />
    </div>
  );
}
