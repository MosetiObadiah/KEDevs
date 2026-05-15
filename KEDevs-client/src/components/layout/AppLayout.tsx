'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import {
  Briefcase,
  Users,
  Building2,
  ClipboardList,
  FileText,
  Star,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Search,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  User,
  Sparkles,
  Flag,
  BarChart3,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Footer from './Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDev = user?.role === 'DEVELOPER';
  const isAdmin = user?.role === 'ADMIN';

  // Prevent wrapping admin routes with global layout
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Logged out Header
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <div className="flex-1 flex justify-start">
              <Logo />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Jobs</Link>
              <Link href="/developers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Developers</Link>
              <Link href="/companies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Companies</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <div className="flex-1 flex items-center justify-end gap-3">
              <Suspense fallback={<div className="hidden lg:flex w-[240px] mx-4 h-9" />}>
                <GlobalSearchBar />
              </Suspense>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Define sidebar links based on role
  const sidebarLinks = isAdmin
    ? [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Management', href: '/admin/users', icon: Users },
        { label: 'Verification Queue', href: '/admin/verification', icon: ShieldCheck },
        { label: 'Flagged Content', href: '/admin/flags', icon: Flag },
        { label: 'Spotlight', href: '/admin/spotlight', icon: Sparkles },
        { label: 'Audit Log', href: '/admin/audit', icon: History },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    : isDev
    ? [
        { label: 'Jobs', href: '/jobs', icon: Briefcase },
        { label: 'Developers', href: '/developers', icon: Users },
        { label: 'Companies', href: '/companies', icon: Building2 },
        { label: 'My Posts', href: '/jobs/my-posts', icon: ClipboardList },
        { label: 'My Applications', href: '/jobs/my-applications', icon: FileText },
        { label: 'Spotlight', href: '/spotlight', icon: Star },
        { label: 'Payments', href: '/payments', icon: CreditCard },
      ]
    : [
        { label: 'Browse Developers', href: '/developers', icon: Users },
        { label: 'Jobs', href: '/jobs', icon: Briefcase },
        { label: 'Companies', href: '/companies', icon: Building2 },
        { label: 'My Job Posts', href: '/jobs/my-posts', icon: ClipboardList },
        { label: 'Hiring Assist', href: '/hiring-assist', icon: Sparkles },
        { label: 'Spotlight', href: '/spotlight', icon: Star },
        { label: 'Payments', href: '/payments', icon: CreditCard },
      ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex-1 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </div>
      <div className="p-4 mt-auto border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors text-left">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile/me">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/notifications">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Access platform sections and your account.</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-accent" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center">
               {(() => {
                  if (pathname === '/jobs') return <h1 className="text-xl font-black tracking-tight">Job <span className="text-primary">Board</span></h1>;
                  if (pathname === '/developers') return <h1 className="text-xl font-black tracking-tight">Talent <span className="text-primary">Directory</span></h1>;
                  if (pathname === '/companies') return <h1 className="text-xl font-black tracking-tight">Ecosystem <span className="text-primary">Directory</span></h1>;
                  if (pathname === '/notifications') return <h1 className="text-xl font-black tracking-tight text-primary">Notifications</h1>;
                  if (pathname === '/profile/me') return <h1 className="text-xl font-black tracking-tight text-primary">My Profile</h1>;
                  if (pathname.startsWith('/settings')) return <h1 className="text-xl font-black tracking-tight text-primary">Settings</h1>;
                  if (pathname === '/spotlight') return <h1 className="text-xl font-black tracking-tight">Talent <span className="text-primary">Spotlight</span></h1>;
                  if (pathname === '/payments') return <h1 className="text-xl font-black tracking-tight text-primary">Financial Ledger</h1>;
                  if (pathname === '/jobs/my-applications') return <h1 className="text-xl font-black tracking-tight text-primary">My Applications</h1>;
                  if (pathname === '/jobs/my-posts') return <h1 className="text-xl font-black tracking-tight text-primary">Job Management</h1>;
                  if (pathname.startsWith('/developers/')) return <h1 className="text-xl font-black tracking-tight text-primary">Talent Profile</h1>;
                  if (pathname.startsWith('/jobs/')) return <h1 className="text-xl font-black tracking-tight text-primary">Job Details</h1>;
                  if (pathname === '/verify') return <h1 className="text-xl font-black tracking-tight text-primary">Verification Center</h1>;
                  if (pathname === '/hiring-assist') return <h1 className="text-xl font-black tracking-tight text-primary">Hiring Assist</h1>;
                  return null;
               })()}
            </div>
          </div>

          <Suspense fallback={<div className="hidden lg:flex w-[240px] mx-4 h-9" />}>
            <GlobalSearchBar />
          </Suspense>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

function GlobalSearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localVal, setLocalVal] = useState('');

  useEffect(() => {
    setLocalVal(searchParams.get('search') || '');
  }, [searchParams]);

  if (pathname !== '/jobs' && pathname !== '/developers' && pathname !== '/companies') {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (val.trim()) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="hidden lg:flex relative animate-in fade-in duration-200 w-[240px] mx-4 shrink-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input 
        placeholder={
          pathname === '/jobs' ? "Search jobs..." : 
          pathname === '/developers' ? "Search talent..." : 
          "Search companies..."
        } 
        className="pl-9 h-9 rounded-xl bg-muted/30 border border-border/60 text-xs font-medium focus-visible:ring-primary/20 transition-all shadow-none"
        value={localVal}
        onChange={handleChange}
      />
    </div>
  );
}

