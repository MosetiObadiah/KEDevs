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
  History,
  Tag,
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  Megaphone,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Footer from './Footer';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout, refreshUserStatus } = useAuth();
  const { unreadCount } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ThemeToggle = () => {
    if (!mounted) {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-transparent">
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }
    
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-warning-400 fill-warning-400/20" />
        ) : (
          <Moon className="h-4 w-4 text-azure-600 fill-azure-600/10" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  };

  // Appeal states
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const isDev = user?.role === 'DEVELOPER';
  const isAdmin = user?.role === 'ADMIN';

  const checkIsPublicRoute = (path: string): boolean => {
    if (!path) return false;
    
    // Exact public paths
    const exactPublics = [
      '/',
      '/login',
      '/register',
      '/jobs',
      '/developers',
      '/companies',
      '/contact',
      '/verify-email',
      '/reset-password',
      '/spotlight',
      '/pricing'
    ];
    
    if (exactPublics.includes(path)) return true;
    
    // Check dynamic job detail page: /jobs/[id] (where [id] is a UUID/slug, but not special paths)
    // Avoid matching /jobs/post, /jobs/my-applications, /jobs/my-posts, etc.
    const genericJobDetailRegex = /^\/jobs\/[^\/]+$/;
    if (genericJobDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedJobPaths = ['post', 'my-applications', 'my-posts', 'edit'];
      if (!protectedJobPaths.includes(segment)) {
        return true;
      }
    }
    
    // Check dynamic developer detail page: /developers/[id]
    // Avoid matching edit, onboarding, etc.
    const developerDetailRegex = /^\/developers\/[^\/]+$/;
    if (developerDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedDevPaths = ['edit', 'onboarding'];
      if (!protectedDevPaths.includes(segment)) {
        return true;
      }
    }

    // Check dynamic company detail page: /companies/[id]
    const companyDetailRegex = /^\/companies\/[^\/]+$/;
    if (companyDetailRegex.test(path)) {
      const segment = path.split('/')[2];
      const protectedCompanyPaths = ['edit', 'new'];
      if (!protectedCompanyPaths.includes(segment)) {
        return true;
      }
    }

    return false;
  };

  const isPublicRoute = checkIsPublicRoute(pathname || '');

  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Check status immediately on mount / connection change
    refreshUserStatus();
    
    // Poll status every 60 seconds for background enforcement
    const interval = setInterval(refreshUserStatus, 60000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, refreshUserStatus]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim()) return;
    
    setIsSubmittingAppeal(true);
    try {
      const response = await authService.appeal(appealMessage);
      if (response.success) {
        setAppealSubmitted(true);
        toast.success("Appeal submitted successfully!");
      } else {
        toast.error(response.message || "Failed to submit appeal");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while submitting appeal");
    } finally {
      setIsSubmittingAppeal(false);
    }
  };





  // Prevent wrapping admin routes with global layout
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  if (isLoggedIn && (user?.accountStatus === 'BANNED' || user?.accountStatus === 'SUSPENDED')) {
    const isBanned = user.accountStatus === 'BANNED';
    const isRejectedApplicant = user?.role === 'EMPLOYER' && !user?.isApproved && isBanned;
    
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Decorative background element matching login/jobs page styling */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-6">
            {isRejectedApplicant ? (
              <>
                <span className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-danger-50 text-danger-500 border border-danger-100 px-3 py-1.5 mb-4 inline-block">
                  SECURITY PROTOCOL
                </span>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Application Rejected</h1>
                <p className="text-slate-500 font-medium mt-2">Your company profile did not pass verification.</p>
              </>
            ) : isBanned ? (
              <>
                <span className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-danger-50 text-danger-500 border border-danger-100 px-3 py-1.5 mb-4 inline-block">
                  PERMANENTLY BANNED
                </span>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Access Revoked</h1>
                <p className="text-slate-500 font-medium mt-2">Account Permanently Banned</p>
              </>
            ) : (
              <>
                <span className="rounded-xl font-black tracking-widest text-[10px] uppercase bg-azure-50 text-azure-500 border border-azure-100 px-3 py-1.5 mb-4 inline-block">
                  ACCESS SUSPENDED
                </span>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Access Restricted</h1>
                <p className="text-slate-500 font-medium mt-2">Account Temporarily Suspended</p>
              </>
            )}
          </div>

          <Card className="rounded-xl-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden bg-white">
            <CardContent className="p-8 md:p-10 space-y-6">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm mx-auto",
                isBanned ? "bg-danger-50 border border-danger-100" : "bg-azure-50 border border-azure-100"
              )}>
                {isBanned ? (
                  <ShieldX className="h-8 w-8 text-danger-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-azure-500 animate-pulse" />
                )}
              </div>

              <p className="text-slate-500 font-medium text-center text-sm leading-relaxed">
                {isRejectedApplicant ? (
                  "Your onboarding application has been reviewed and rejected by the administration team. If you believe this was a mistake, you can contest this decision by submitting an appeal below."
                ) : isBanned ? (
                  "This account has been permanently restricted due to severe community guideline violations or administrative action. Banned accounts are completely deactivated, final, and cannot be appealed."
                ) : (
                  "This account has been temporarily restricted by the administration. You can contest this decision and request a reactivation review by submitting an appeal below."
                )}
              </p>

              {isRejectedApplicant && user?.rejectionReason && (
                <div className="w-full bg-danger-50 border border-danger-100 rounded-2xl p-5 mb-2 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-danger-600" />
                    <h3 className="font-black text-danger-900 text-xs uppercase tracking-wider">Reason for Denial</h3>
                  </div>
                  <p className="text-sm text-danger-800 font-medium whitespace-pre-wrap">
                    {user.rejectionReason}
                  </p>
                </div>
              )}

              {(!isBanned || isRejectedApplicant) && (
                <>
                  {appealSubmitted ? (
                    <div className="w-full bg-cyan-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-300">
                      <div className="h-10 w-10 bg-cyan-50/50 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-5 w-5 text-cyan-600" />
                      </div>
                      <h3 className="font-black text-slate-950 text-sm">Contestation Received</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Your appeal has been securely dispatched to our moderation team. You will be notified via email once a decision has been reached.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleAppealSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-slate-500 px-1">Contest Suspension</Label>
                        <textarea
                          id="banned-appeal"
                          rows={4}
                          placeholder="Provide context or explain why your account should be reinstated..."
                          className="w-full rounded-2xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary p-4 text-sm text-slate-900 placeholder-slate-400 transition-all resize-none bg-slate-50/30"
                          value={appealMessage}
                          onChange={(e) => setAppealMessage(e.target.value)}
                          required
                          maxLength={1000}
                        />
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
                          <span>Max 1000 characters</span>
                          <span>{appealMessage.length}/1000</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmittingAppeal || !appealMessage.trim()}
                        className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] bg-azure-500 hover:bg-azure-500 text-white"
                      >
                        {isSubmittingAppeal ? 'Submitting Appeal...' : 'Submit Appeal'}
                      </Button>
                    </form>
                  )}
                </>
              )}

              <div className="relative my-4 pt-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-100" />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <div className="flex-1 flex items-center justify-end gap-3">
              <Suspense fallback={<div className="hidden lg:flex w-[240px] mx-4 h-9" />}>
                <GlobalSearchBar />
              </Suspense>
              <ThemeToggle />
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
        { label: 'Job Advertisements', href: '/admin/job-advertisements', icon: Megaphone },
        { label: 'Spotlight', href: '/admin/spotlight', icon: Sparkles },
        { label: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
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
        { label: 'Pricing', href: '/pricing', icon: Tag },
      ]
    : [
        { label: 'Browse Developers', href: '/developers', icon: Users },
        { label: 'Jobs', href: '/jobs', icon: Briefcase },
        { label: 'Companies', href: '/companies', icon: Building2 },
        { label: 'My Job Posts', href: '/jobs/my-posts', icon: ClipboardList },
        { label: 'Spotlight', href: '/spotlight', icon: Star },
        { label: 'Payments', href: '/payments', icon: CreditCard },
        { label: 'Pricing', href: '/pricing', icon: Tag },
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
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
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
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-accent transition-colors text-left">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
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
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              className="md:hidden p-2 -ml-2 rounded-2xl hover:bg-accent shrink-0" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center min-w-0">
               {(() => {
                  if (pathname === '/jobs') return <h1 className="text-sm sm:text-xl font-black tracking-tight truncate max-w-[140px] sm:max-w-none">Job <span className="text-primary">Board</span></h1>;
                  if (pathname === '/developers') return <h1 className="text-sm sm:text-xl font-black tracking-tight truncate max-w-[140px] sm:max-w-none">Talent <span className="text-primary">Directory</span></h1>;
                  if (pathname === '/companies') return <h1 className="text-sm sm:text-xl font-black tracking-tight truncate max-w-[140px] sm:max-w-none">Ecosystem <span className="text-primary">Directory</span></h1>;
                  if (pathname === '/notifications') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Notifications</h1>;
                  if (pathname === '/profile/me') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">My Profile</h1>;
                  if (pathname.startsWith('/settings')) return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Settings</h1>;
                  if (pathname === '/spotlight') return <h1 className="text-sm sm:text-xl font-black tracking-tight truncate max-w-[140px] sm:max-w-none">Talent <span className="text-primary">Spotlight</span></h1>;
                  if (pathname === '/payments') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Financial Ledger</h1>;
                  if (pathname === '/jobs/my-applications') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">My Applications</h1>;
                  if (pathname === '/jobs/my-posts') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Job Management</h1>;
                  if (pathname.startsWith('/developers/')) return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Talent Profile</h1>;
                  if (pathname.startsWith('/jobs/')) return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Job Details</h1>;
                  if (pathname === '/verify') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Verification Center</h1>;
                  if (pathname === '/pricing') return <h1 className="text-sm sm:text-xl font-black tracking-tight text-primary truncate max-w-[140px] sm:max-w-none">Pricing</h1>;
                  return null;
               })()}
            </div>
          </div>
 
          <Suspense fallback={<div className="hidden lg:flex w-[240px] mx-4 h-9" />}>
            <GlobalSearchBar />
          </Suspense>
 
          <div className="flex items-center gap-3">
            <ThemeToggle />
            

 
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
 
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

  // Sync with URL when search params change externally
  useEffect(() => {
    setLocalVal(searchParams.get('search') || '');
  }, [searchParams]);

  // Debounce the router push URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get('search') || '';
      if (localVal.trim() === currentParam) return;
      
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (localVal.trim()) {
        params.set('search', localVal.trim());
      } else {
        params.delete('search');
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [localVal, pathname, router, searchParams]);

  const isInbox = /^\/jobs\/[^\/]+\/applications$/.test(pathname || '');

  if (pathname !== '/jobs' && pathname !== '/developers' && pathname !== '/companies' && pathname !== '/jobs/my-posts' && pathname !== '/jobs/my-applications' && !isInbox) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalVal(e.target.value);
  };

  return (
    <div className="hidden lg:flex relative animate-in fade-in duration-200 w-[240px] mx-4 shrink-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input 
        placeholder={
          pathname === '/jobs' ? "Search jobs..." : 
          pathname === '/developers' ? "Search talent..." : 
          isInbox ? "Search applicants..." :
          pathname === '/jobs/my-posts' ? "Search my posts..." :
          pathname === '/jobs/my-applications' ? "Search applications..." :
          "Search companies..."
        } 
        className="pl-9 h-9 rounded-xl bg-muted/30 border border-border/60 text-xs font-medium focus-visible:ring-primary/20 transition-all shadow-none"
        value={localVal}
        onChange={handleChange}
      />
    </div>
  );
}

