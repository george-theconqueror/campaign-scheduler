import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ModeToggle } from './ThemeButton';

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              Campaign Scheduler
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link href="/campaigns">
              <Button variant="outline">
                Campaigns
              </Button>
            </Link>
            <Link href="/schedule-campaigns">
              <Button>
                Schedule
              </Button>
            </Link>
            <Link href="/launch">
              <Button variant="secondary">
                Launch
              </Button>
            </Link>
            < ModeToggle/>
          </nav>
        </div>
      </div>
    </header>
  );
}
