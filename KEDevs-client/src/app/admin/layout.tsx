'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Flag, 
  Sparkles, 
  BarChart3, 
  History, 
  Settings, 
  Menu, 
  LogOut, 
  ExternalLink,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { text: 'User Management', icon: Users, path: '/admin/users' },
  { text: 'Verification Queue', icon: ShieldCheck, path: '/admin/verification' },
  { text: 'Flagged Content', icon: Flag, path: '/admin/flags' },
  { text: 'Spotlight', icon: Sparkles, path: '/admin/spotlight' },
  { text: 'Platform Reports', icon: BarChart3, path: '/admin/reports' },
  { text: 'Audit Log', icon: History, path: '/admin/audit' },
  { text: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <div className="p-6 flex items-center justify-between">
         <div className={cn("flex items-center gap-3 transition-all", collapsed && "opacity-0 invisible w-0")}>
            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white font-black">K</div>
            <span className="font-black text-xl tracking-tight text-white uppercase">Admin</span>
         </div>
         <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
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
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-primary")} />
              {!collapsed && <span className="font-bold text-sm">{item.text}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
         <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 px-4 h-12 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black"
            onClick={logout}
         >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
         </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block transition-all duration-500 sticky top-0 h-screen z-50",
        collapsed ? "w-24" : "w-[280px]"
      )}>
        <SidebarContent />
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
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Header */}
         <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {menuItems.find(item => item.path === pathname)?.text || 'Platform Control'}
               </h1>
            </div>

            <div className="flex items-center gap-6">
               <div className="hidden lg:flex items-center gap-2 px-4 h-10 bg-slate-100 rounded-xl text-slate-500 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
                  <Search className="h-4 w-4" />
                  <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-xs font-bold w-48" />
               </div>

               <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-xl relative">
                     <Bell className="h-5 w-5" />
                     <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6 bg-slate-200" />
                  
                  <Button variant="outline" className="rounded-xl font-black gap-2 h-10 border-slate-200" asChild>
                     <Link href="/">
                        <ExternalLink className="h-4 w-4" />
                        Live Site
                     </Link>
                  </Button>

                  <Avatar className="h-10 w-10 rounded-xl border-2 border-primary/10">
                     <AvatarImage src={user?.avatarUrl} />
                     <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                        {user?.fullName?.charAt(0)}
                     </AvatarFallback>
                  </Avatar>
               </div>
            </div>
         </header>

         <main className="p-8 animate-in fade-in duration-500">
            {children}
         </main>
      </div>
    </div>
  );
}
