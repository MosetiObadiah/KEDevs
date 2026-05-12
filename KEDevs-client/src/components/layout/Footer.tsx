'use client';
import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Connecting Kenya's elite tech talent with the world's most innovative companies. Built for developers, by developers.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {[
                { label: 'Browse Jobs', href: '/jobs' },
                { label: 'Developer Directory', href: '/developers' },
                { label: 'Company Board', href: '/companies' },
                { label: 'Success Stories', href: '/spotlight' }
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Pricing', 'Verification Guide', 'Career Advice', 'Community Forum'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest jobs and tech news from Kenya.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email Address" className="bg-muted/50 border-transparent focus-visible:bg-background" />
              <Button size="sm">Join</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KEDevs Connect. All rights reserved. Made in Nairobi.
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '#' }
            ].map(item => (
              <Link key={item.label} href={item.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
