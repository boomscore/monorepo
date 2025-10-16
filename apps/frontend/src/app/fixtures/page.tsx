import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components';
import { SportsTypeTabs } from './components';
import { FixturesList } from './components/fixtures-list';

export default function FixturesPage() {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto bg-app-background gap-6 flex flex-col">
      <div className="mb-6">
        <div className="border-y-1 border-grey-300 py-4">
          <SportsTypeTabs />
        </div>
        <div className='mt-2'>
          <h1 className="text-2xl font-semibold ">Fixtures</h1>
          <div className="mt-2 w-[100px]" >
            <Select defaultValue={today}  name="fixture-date">
              <SelectTrigger size="sm">
                <SelectValue placeholder="Filter options" className='text-grey-950' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">All fixtures</SelectItem>
                <SelectItem value="two">Upcoming fixtures</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <FixturesList initialDate={today} />
    </div>
  );
}
