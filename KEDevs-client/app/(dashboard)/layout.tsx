'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { AuthGuard, OnboardingGuard } from '@/lib/auth/guards';
import { NotificationBell } from '@/components/shared/notification-bell';
import { ProfileCompletionBanner } from '@/components/shared/profile-completion-banner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Rss,
  Briefcase,
  Users,
  Building2,
  CreditCard,
  Bell,
  LogOut,
  User,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: Rss },
  { href: '/developers', label: 'Developers', icon: Users },
  { href: '/employers', label: 'Employers', icon: Building2 },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">K</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">KEDevs</span>
            <p className="text-sidebar-foreground/60 text-xs">Connect</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-sidebar-primary text-white shadow-lg shadow-teal/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  active ? 'text-white' : 'text-sidebar-foreground/70'
                )}
              />
              {label}
              {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </Link>
          );
        })}

        {/* Spotlight link */}
        <div className="pt-4 border-t border-sidebar-border mt-4">
          <Link
            href="/spotlight"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
              pathname.startsWith('/spotlight')
                ? 'bg-sidebar-primary text-white'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
            )}
          >
            <Star className="w-5 h-5 text-yellow-400" />
            Spotlight
          </Link>
        </div>

        {/* Admin link — only show for ADMIN role */}
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin/dashboard"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              pathname.startsWith('/admin')
                ? 'bg-sidebar-primary text-white'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
            )}
          >
            <Building2 className="w-5 h-5" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors group text-left"
          >
            <Avatar className="w-9 h-9 ring-2 ring-sidebar-border">
              <AvatarImage src={user?.profileImageUrl} alt={user?.fullName} />
              <AvatarFallback className="bg-teal text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.fullName}
              </p>
              <p className="text-sidebar-foreground/60 text-xs truncate capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-white transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 mb-2">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/profile/me')}
            >
              <User className="w-4 h-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function TopBar() {
  const { user } = useAuth();
  const isUnapprovedEmployer = user?.role === 'EMPLOYER' && !user?.isApprovedByAdmin;

  return (
    <>
      <header className={cn(
        "fixed top-0 right-0 left-[280px] h-16 bg-background/80 backdrop-blur-md border-b border-border z-30 flex items-center justify-end px-6 gap-4",
        isUnapprovedEmployer && "top-14"
      )}>
        <NotificationBell />
      </header>



      {isUnapprovedEmployer && (
        <div className="fixed top-0 right-0 left-[280px] h-14 bg-amber-500/10 border-b border-amber-500/20 z-40 flex items-center px-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-amber-200 text-xs font-semibold">Account Pending Approval</p>
              <p className="text-amber-200/60 text-[10px]">
                Complete your company profile to help our admins verify your account faster.
              </p>
            </div>
          </div>
          <Link href="/profile/me">
            <Button variant="outline" size="sm" className="h-8 text-[10px] border-amber-500/30 text-amber-200 hover:bg-amber-500/20">
              Edit Profile
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isUnapprovedEmployer = user?.role === 'EMPLOYER' && !user?.isApprovedByAdmin;

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <TopBar />
          <main className={cn(
            "ml-[280px] pt-16 min-h-screen transition-all duration-300",
            isUnapprovedEmployer && "pt-[120px]"
          )}>
            <ProfileCompletionBanner />
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
