import { Handshake } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 -m-1">
      <Handshake className="h-8 w-8 text-accent" />
      <span className="text-foreground">CivicConnect</span>
    </Link>
  );
}
