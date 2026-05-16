'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  Sun, 
  Moon, 
  Palette,
  CreditCard,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notificationService';
import NotificationPopover from '../notifications/NotificationPopover';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isEmp = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Marketplace', href: '/jobs' },
    { label: 'Talent', href: '/developers' },
    { label: 'Ecosystem', href: '/companies' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Support', href: '/contact' },
    ...(isEmp ? [{ label: 'Hiring Assist', href: '/hiring-assist' }] : []),
    ...(isAdmin ? [{ label: 'Command Center', href: '/admin/dashboard' }] : []),
  ];

  const fetchUnreadCount = async () => {
    if (isLoggedIn) {
      try {
        const response = await notificationService.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 xl:max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
               <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">KE<span className="text-primary italic">Devs</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className="rounded-xl px-4 font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (Simplified) */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" asChild className="font-black text-[11px] uppercase tracking-widest rounded-xl">
                  <Link href="/login">Auth Access</Link>
                </Button>
                <Button asChild className="rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-900 shadow-xl shadow-slate-900/10 px-6">
                  <Link href="/register">Join Grid</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationPopover unreadCount={unreadCount} onMarkAllAsRead={fetchUnreadCount}>
                   <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-50 text-slate-400 hover:text-primary">
                      <Bell className="h-5 w-5" />
                   </Button>
                </NotificationPopover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl border-2 border-primary/20 p-0 overflow-hidden hover:border-primary transition-all">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className="bg-primary text-white font-black text-xs uppercase">
                          {user?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-[2rem] p-3 border-none shadow-3xl mt-4 mr-4 bg-white" align="end">
                    <div className="p-4 mb-2">
                       <p className="text-sm font-black text-slate-900 tracking-tight">{user?.fullName}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user?.role} NODE</p>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                    
                    <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer group">
                       <Link href="/profile/me" className="flex items-center gap-3 font-bold text-xs text-slate-600 group-hover:text-primary">
                          <User className="h-4 w-4" /> Professional Profile
                       </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer group">
                       <Link href="/payments" className="flex items-center gap-3 font-bold text-xs text-slate-600 group-hover:text-primary">
                          <CreditCard className="h-4 w-4" /> Financial Ledger
                       </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer group">
                       <Link href="/verify" className="flex items-center gap-3 font-bold text-xs text-slate-600 group-hover:text-emerald-500">
                          <ShieldCheck className="h-4 w-4" /> Identity Protocol
                       </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer group">
                       <Link href="/settings/notifications" className="flex items-center gap-3 font-bold text-xs text-slate-600 group-hover:text-primary">
                          <Settings className="h-4 w-4" /> Preferences
                       </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                    
                    <DropdownMenuItem 
                       className="rounded-xl py-3 cursor-pointer group focus:bg-red-50"
                       onClick={() => logout()}
                    >
                       <div className="flex items-center gap-3 font-black text-xs text-red-500">
                          <LogOut className="h-4 w-4" /> Terminate Session
                       </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl h-10 w-10 bg-slate-50 text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Feed */}
        {isMobileMenuOpen && (
           <div className="md:hidden border-t border-slate-50 py-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
              {navItems.map((item) => (
                 <Link 
                    key={item.label} 
                    href={item.href}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                    onClick={() => setIsMobileMenuOpen(false)}
                 >
                    <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    <ChevronDown className="h-4 w-4 text-slate-300 -rotate-90" />
                 </Link>
              ))}
              {!isLoggedIn && (
                 <div className="pt-6 grid grid-cols-2 gap-4 px-4">
                    <Button asChild variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-12">
                       <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="rounded-xl font-black text-[10px] uppercase tracking-widest h-12 bg-slate-900">
                       <Link href="/register">Join</Link>
                    </Button>
                 </div>
              )}
           </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
