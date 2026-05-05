'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '#jobs', label: 'Jobs' },
  { href: '#developers', label: 'Developers' },
  { href: '#spotlight', label: 'Spotlight' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavItems = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <div className={cn('flex items-center gap-8', className)}>
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onClick}
          className="text-[#CAD2C5]/70 hover:text-white text-sm font-medium transition-colors duration-200"
        >
          {link.label}
        </a>
      ))}
    </div>
  );

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 h-20 flex items-center',
        isScrolled
          ? 'bg-[#2F3E46]/95 backdrop-blur-md border-b border-[#354F52] shadow-xl'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl leading-none">KEDevs</span>
            <span className="text-[#84A98C] text-[10px] font-semibold tracking-widest uppercase">Connect</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          <NavItems />
          <div className="h-6 w-px bg-[#CAD2C5]/10" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#CAD2C5] hover:text-white hover:bg-white/5 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#52796F] hover:bg-[#84A98C] text-white px-6 shadow-lg shadow-[#52796F]/20 transition-all duration-200 hover:scale-105 active:scale-95">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger className="p-2 text-[#CAD2C5] hover:bg-white/5 rounded-xl transition-colors">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#2F3E46] border-[#354F52] text-white p-0">
              <SheetHeader className="p-6 border-b border-[#354F52]">
                <SheetTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#84A98C]" />
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-[#CAD2C5] hover:text-white text-lg font-medium py-2 border-b border-[#354F52]/50"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-[#CAD2C5]/20 text-[#CAD2C5] hover:bg-white/5">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-[#52796F] hover:bg-[#84A98C] text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
