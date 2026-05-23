'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Flag, 
  Sparkles, 
  Megaphone,
  BarChart3, 
  History, 
  Settings, 
  Menu, 
  LogOut, 
  ExternalLink,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useNotification } from '@/context/NotificationContext';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { text: 'User Management', icon: Users, path: '/admin/users' },
  { text: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { text: 'Verification Queue', icon: ShieldCheck, path: '/admin/verification' },
  { text: 'Flagged Content', icon: Flag, path: '/admin/flags' },
  { text: 'Job Advertisements', icon: Megaphone, path: '/admin/job-advertisements' },
  { text: 'Spotlight', icon: Sparkles, path: '/admin/spotlight' },
  { text: 'Audit Log', icon: History, path: '/admin/audit' },
  { text: 'Settings', icon: Settings, path: '/admin/settings' },
];

interface SidebarContentProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  pathname: string;
  logout: () => void;
}

function SidebarContent({ collapsed, setCollapsed, pathname, logout }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground">
      <div className="p-6 flex items-center justify-between">
         <div className={cn("flex items-center gap-3 transition-all", collapsed && "opacity-0 invisible w-0")}>
            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white font-black">K</div>
            <span className="font-black text-xl tracking-tight uppercase">Admin</span>
         </div>
         <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-accent rounded-xl transition-colors">
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
         </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.text} 
              href={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              {!collapsed && <span className="font-medium text-sm">{item.text}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-border">
         <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 px-4 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
            onClick={logout}
         >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
         </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block transition-all duration-300 sticky top-0 h-screen z-50",
        collapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} logout={logout} />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 bg-white/80 backdrop-blur shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-none">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
              <SheetDescription>Access administrative controls and platform management.</SheetDescription>
            </SheetHeader>
            <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} logout={logout} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Header */}
         <header className="h-16 bg-card border-b border-border sticky top-0 z-40 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h1 className="text-xl font-black text-primary tracking-tight">
                  {menuItems.find(item => item.path === pathname)?.text || 'Platform Control'}
               </h1>
            </div>

            <div className="flex items-center gap-4">


               <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" asChild>
                     <Link href="/notifications">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                           <span className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-black bg-danger-500 text-white rounded-full animate-in zoom-in shadow-sm shadow-red-500/20">
                              {unreadCount > 9 ? '9+' : unreadCount}
                           </span>
                        )}
                     </Link>
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6 bg-border" />
                  
                  <Button variant="outline" size="sm" className="font-medium gap-2 h-9 border-border hover:bg-muted" asChild>
                     <Link href="/">
                        <ExternalLink className="h-4 w-4" />
                        Live Site
                     </Link>
                  </Button>

                  <Avatar className="h-9 w-9 border border-border">
                     <AvatarImage src={user?.avatarUrl} />
                     <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs uppercase">
                        {user?.fullName?.charAt(0)}
                     </AvatarFallback>
                  </Avatar>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 pt-8 pb-12 animate-in fade-in duration-500">
              {children}
            </div>
         </main>
      </div>
    </div>
  );
}
