'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Code2,
  Briefcase,
  Users,
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  Globe,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/Navbar';
import { JobsSection } from '@/components/landing/JobsSection';
import { SpotlightSection } from '@/components/landing/SpotlightSection';
import { DevelopersSection } from '@/components/landing/DevelopersSection';
import { AboutSection, ContactSection } from '@/components/landing/StaticSections';

// ── Static data ───────────────────────────────────────────────────────────

const STATS = [
  { label: 'Developers', value: '2,400+' },
  { label: 'Companies', value: '180+' },
  { label: 'Jobs Posted', value: '950+' },
  { label: 'Successful Hires', value: '340+' },
];

const TESTIMONIALS = [
  {
    name: 'Brian Otieno',
    role: 'Senior Frontend Developer',
    company: 'Safaricom',
    avatar: 'BO',
    quote:
      'KEDevs Connect helped me land my dream role in under 3 weeks. The curated job board is miles ahead of anything else in Kenya.',
  },
  {
    name: 'Amina Waweru',
    role: 'CTO',
    company: 'Twende Mobility',
    avatar: 'AW',
    quote:
      'We\'ve hired 4 senior engineers through KEDevs. The quality of candidates is exceptional — these are serious developers.',
  },
  {
    name: 'Kevin Mwangi',
    role: 'Full Stack Developer',
    company: 'Freelance',
    avatar: 'KM',
    quote:
      'The spotlight feature got me 12 interview requests in a single week. The ROI is incredible.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: 'KES 0',
    period: '',
    description: 'Get started immediately',
    features: [
      'Developer profile',
      'Browse job listings',
      'Forum participation',
      'Basic job alerts',
    ],
    cta: 'Get started free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Annual Member',
    price: 'KES 1,200',
    period: '/year',
    description: 'For serious developers',
    features: [
      'Everything in Free',
      'Apply to jobs',
      'Verified badge eligibility',
      'Priority in search results',
      'Spotlight eligibility',
    ],
    cta: 'Join now',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Pro Employer',
    price: 'KES 5,000',
    period: '/year',
    description: 'For hiring teams',
    features: [
      'Unlimited job posts',
      'Advanced developer filters',
      'Direct contact requests (10/day)',
      'Saved developer searches',
      'Priority support',
    ],
    cta: 'Start hiring',
    href: '/register?role=EMPLOYER',
    highlight: false,
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f5] text-[#2F3E46]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 bg-[#2F3E46] relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#52796F]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#84A98C]/15 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#354F52] rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-[#52796F]/20 text-[#84A98C] border border-[#52796F]/30 px-4 py-1.5 text-sm">
            <Globe className="w-3.5 h-3.5 mr-2" />
            Kenya&apos;s #1 Developer Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-tight text-balance">
            Where Kenyan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84A98C] via-[#52796F] to-[#84A98C] bg-[length:200%_auto] animate-gradient">
              developers
            </span>{' '}
            thrive
          </h1>

          <p className="text-xl md:text-2xl text-[#CAD2C5]/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Build your professional profile, discover curated tech jobs, and connect with Kenya&apos;s top employers — all in one platform built for the local ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#52796F] hover:bg-[#354F52] text-white px-10 h-14 text-lg font-bold shadow-2xl shadow-[#52796F]/40 transition-all duration-300 hover:scale-105 group"
              >
                Sign Up as Developer
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-[#CAD2C5]/20 text-[#CAD2C5] hover:bg-white/10 hover:text-white h-14 text-lg px-10 font-semibold"
              >
                Post a Job
                <Briefcase className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-[#CAD2C5]/40 font-medium">
            {['No hidden fees', 'M-Pesa integrated', 'Verified talent'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#84A98C]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-[#354F52] py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center group">
              <p className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{value}</p>
              <p className="text-[#84A98C] text-sm font-semibold uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Jobs Section ─────────────────────────────────────────────────── */}
      <JobsSection />

      {/* ── Spotlight Section ────────────────────────────────────────────── */}
      <SpotlightSection />

      {/* ── Developers Section ───────────────────────────────────────────── */}
      <DevelopersSection />

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 bg-[#f4f6f5] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border border-[#52796F]/20">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Simple pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2F3E46] mb-6">Built for everyone</h2>
            <p className="text-[#84A98C] text-lg">M-Pesa payments. No credit card needed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map(({ name, price, period, description, features, cta, href, highlight }) => (
              <div
                key={name}
                className={`rounded-[32px] p-8 border-2 transition-all duration-500 flex flex-col ${
                  highlight
                    ? 'bg-[#2F3E46] border-[#52796F] shadow-2xl shadow-[#52796F]/20 md:scale-110 z-10'
                    : 'bg-white border-[#CAD2C5]/40 hover:border-[#52796F]/30 hover:shadow-xl'
                }`}
              >
                {highlight && (
                  <Badge className="mb-6 bg-[#52796F] text-white border-0 text-xs self-start">
                    Recommended
                  </Badge>
                )}
                <h3 className={`font-bold text-2xl mb-2 ${highlight ? 'text-white' : 'text-[#2F3E46]'}`}>
                  {name}
                </h3>
                <p className={`text-sm mb-8 leading-relaxed ${highlight ? 'text-[#CAD2C5]/60' : 'text-[#84A98C]'}`}>
                  {description}
                </p>
                <div className="mb-8">
                  <span className={`text-4xl font-bold ${highlight ? 'text-white' : 'text-[#2F3E46]'}`}>
                    {price}
                  </span>
                  {period && (
                    <span className={`text-sm ml-1 ${highlight ? 'text-[#CAD2C5]/50' : 'text-[#84A98C]'}`}>
                      {period}
                    </span>
                  )}
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlight ? 'text-[#84A98C]' : 'text-[#52796F]'}`} />
                      <span className={highlight ? 'text-[#CAD2C5]/80' : 'text-[#2F3E46]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href}>
                  <Button
                    className={`w-full h-14 font-bold rounded-2xl text-lg transition-all duration-300 group ${
                      highlight
                        ? 'bg-[#52796F] hover:bg-[#84A98C] text-white shadow-xl shadow-[#52796F]/30'
                        : 'bg-[#f4f6f5] hover:bg-[#CAD2C5] text-[#2F3E46] border border-[#CAD2C5]'
                    }`}
                  >
                    {cta}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">Success Stories</h2>
            <p className="text-[#84A98C] text-lg">Join thousands of developers thriving in our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, company, avatar, quote }) => (
              <div
                key={name}
                className="bg-[#f4f6f5] rounded-3xl p-8 border border-[#CAD2C5]/30 hover:shadow-2xl hover:shadow-[#52796F]/5 transition-all duration-500 group"
              >
                <div className="mb-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500 inline-block mr-1" />
                  ))}
                </div>
                <p className="text-[#2F3E46] leading-relaxed mb-10 italic text-lg">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-[#CAD2C5]/50">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[#2F3E46]">{name}</p>
                    <p className="text-[#84A98C] text-sm">{role} @ {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Static Content (About & Contact) ─────────────────────────────── */}
      <AboutSection />
      <ContactSection />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a2428] border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-white font-bold text-xl">KEDevs Connect</span>
              </Link>
              <p className="text-[#84A98C] max-w-sm leading-relaxed mb-8">
                The premier platform for Kenyan developers to showcase talent, find curated jobs, and build professional networks.
              </p>
              <div className="flex gap-4">
                 {/* Social icons placeholders */}
                 <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" />
                 <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" />
                 <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-[#84A98C]">
                <li><a href="#jobs" className="hover:text-white transition-colors">Find Jobs</a></li>
                <li><a href="#developers" className="hover:text-white transition-colors">Browse Talent</a></li>
                <li><a href="#spotlight" className="hover:text-white transition-colors">Developer Spotlight</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-[#84A98C]">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#84A98C]/50 text-xs">
              © {new Date().getFullYear()} KEDevs Connect. Built with ❤️ for Kenya&apos;s tech ecosystem.
            </p>
            <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-[#84A98C]/30">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
