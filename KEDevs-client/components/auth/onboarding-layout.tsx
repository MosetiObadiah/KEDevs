'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  title: string;
  subtitle: string;
  leftTitle: string;
  leftDescription: string;
  benefits: string[];
  children: React.ReactNode;
  progress: number;
}

export function OnboardingLayout({
  title,
  subtitle,
  leftTitle,
  leftDescription,
  benefits,
  children,
  progress
}: OnboardingLayoutProps) {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '??';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-sage/20 z-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-teal"
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Left Side: Brand & Benefits */}
      <div className="w-full md:w-[40%] bg-deep p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-forest/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center font-black text-white text-xl shadow-lg">
              K
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">KEDevs</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {leftTitle}
            </h1>
            <p className="text-sage/80 text-lg mb-12 max-w-sm">
              {leftDescription}
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-sage"
                >
                  <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal" />
                  </div>
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12 pt-12 border-t border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center font-bold text-sage shadow-inner border border-white/10">
            {initials}
          </div>
          <div>
            <p className="text-white font-medium">{user?.fullName}</p>
            <p className="text-sage/60 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="w-full md:w-[60%] bg-white dark:bg-[#1a2428] flex flex-col overflow-y-auto relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-8 z-10">
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="p-2 rounded-full hover:bg-sage/20 transition-colors text-deep dark:text-sage"
          >
            <svg xmlns="http://www.w3.org/2001/XMLSchema-instance" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
        </div>

        <div className="max-w-3xl mx-auto w-full py-20 px-8 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-deep dark:text-sage mb-2">{title}</h2>
            <p className="text-fern text-lg">{subtitle}</p>
          </motion.div>

          {children}
        </div>
      </div>
    </div>
  );
}
