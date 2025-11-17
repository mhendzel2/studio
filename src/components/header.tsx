'use client';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppState } from '@/hooks/use-app-state';

export function Header() {
  const { resetState } = useAppState();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              FluoroSegStat
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button onClick={resetState} variant="outline">Reset</Button>
        </div>
      </div>
    </header>
  );
}
