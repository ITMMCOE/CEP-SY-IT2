
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import {
  User,
  MessageSquare,
  Briefcase,
  Settings,
  LogOut,
  LayoutDashboard,
  Loader2,
  LifeBuoy,
  Map,
  BookCopy,
} from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, claims } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">CareerCompass</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" tooltip="Dashboard" isActive={pathname.startsWith('/dashboard')}>
                <LayoutDashboard />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard#roadmap" tooltip="Roadmap">
                <Map />
                <span className="group-data-[collapsible=icon]:hidden">Roadmap</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/chat" tooltip="Chat" isActive={pathname.startsWith('/chat')}>
                <MessageSquare />
                <span className="group-data-[collapsible=icon]:hidden">Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/profile" tooltip="Profile" isActive={pathname.startsWith('/profile')}>
                <User />
                <span className="group-data-[collapsible=icon]:hidden">Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/support" tooltip="Support" isActive={pathname.startsWith('/support')}>
                <LifeBuoy />
                 <span className="group-data-[collapsible=icon]:hidden">Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/settings" tooltip="Settings" isActive={pathname.startsWith('/settings')}>
                <Settings />
                 <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-2 lg:p-4 border-b bg-card">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex-1">
             {/* Can add search input here if needed */}
          </div>
          <div className="flex items-center gap-4">
            <UserMenu user={user} onSignOut={handleSignOut} />
          </div>
        </header>
        <main className="p-4 md:p-6 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-10 h-10 rounded-full">
          <Avatar className="w-10 h-10 border-2 border-primary/50">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} data-ai-hint="person portrait" />}
            <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
           <a href="/profile">
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
