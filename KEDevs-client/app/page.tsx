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

export const metadata: Metadata = {
  title: 'KEDevs Connect — Kenya\'s Premier Developer Community',
  description:
    'Connect with top Kenyan developers and employers. Find jobs, showcase your skills, and grow your tech career with KEDevs Connect.',
};

// ── Static data ───────────────────────────────────────────────────────────

const STATS = [
  { label: 'Developers', value: '2,400+' },
  { label: 'Companies', value: '180+' },
  { label: 'Jobs Posted', value: '950+' },
  { label: 'Successful Hires', value: '340+' },
];

const FEATURES = [
  {
    icon: Code2,
    title: 'Developer Profiles',
    description:
      'Showcase your skills, projects, certifications, and open-source contributions to top employers.',
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
  {
    icon: Briefcase,
    title: 'Curated Job Board',
    description:
      'Browse vetted tech roles with upvoting, filtering by stack, work type, and experience level.',
    color: 'text-fern',
    bg: 'bg-fern/10',
  },
  {
    icon: Users,
    title: 'Employer Directory',
    description:
      'Connect directly with hiring managers at Kenya\'s top tech companies and startups.',
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
  {
    icon: MessageSquare,
    title: 'Forum Discussions',
    description:
      'Threaded discussions on every job post. Ask questions, share insights, and build reputation.',
    color: 'text-fern',
    bg: 'bg-fern/10',
  },
  {
    icon: Star,
    title: 'Developer Spotlight',
    description:
      'Get featured on the homepage and reach thousands of recruiters actively looking for talent.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Badges',
    description:
      'Stand out with a verified badge. Employers know you\'re a trusted, validated developer.',
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
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
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#2F3E46]/90 backdrop-blur-md border-b border-[#354F52]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-white font-bold text-lg">KEDevs Connect</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#CAD2C5]/70 hover:text-[#CAD2C5] text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-[#CAD2C5]/70 hover:text-[#CAD2C5] text-sm transition-colors">Pricing</a>
            <a href="#testimonials" className="text-[#CAD2C5]/70 hover:text-[#CAD2C5] text-sm transition-colors">Stories</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#CAD2C5] hover:text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-[#52796F] hover:bg-[#354F52] text-white shadow-lg shadow-[#52796F]/30 transition-all duration-200">
                Join free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#2F3E46] to-[#354F52] relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#52796F]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#84A98C]/15 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#354F52] rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-[#52796F]/20 text-[#84A98C] border border-[#52796F]/30 px-4 py-1.5 text-sm">
            <Globe className="w-3.5 h-3.5 mr-2" />
            Kenya&apos;s #1 Developer Platform
          </Badge>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] text-balance">
            Where Kenyan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84A98C] to-[#52796F]">
              developers
            </span>{' '}
            thrive
          </h1>

          <p className="text-xl text-[#CAD2C5]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build your professional profile, discover curated tech jobs, and connect with Kenya&apos;s top employers — all in one platform built for the local ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#52796F] hover:bg-[#354F52] text-white px-8 h-12 text-base font-semibold shadow-xl shadow-[#52796F]/30 transition-all duration-200 hover:scale-105 group"
              >
                Start for free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register?role=EMPLOYER">
              <Button
                variant="outline"
                size="lg"
                className="border-[#CAD2C5]/30 text-[#CAD2C5] hover:bg-white/10 hover:text-white h-12 text-base px-8"
              >
                I&apos;m hiring
                <Briefcase className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Floating trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[#CAD2C5]/50">
            {['No setup fee', 'Free to join', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#84A98C]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-[#354F52] py-10 border-y border-[#2F3E46]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-[#84A98C] text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-[#f4f6f5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border border-[#52796F]/20">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Platform features
            </Badge>
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">
              Everything you need to grow
            </h2>
            <p className="text-[#84A98C] text-lg max-w-xl mx-auto">
              Built specifically for the Kenyan tech ecosystem — not a generic job board.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-[#CAD2C5]/40 hover:border-[#52796F]/40 hover:shadow-lg hover:shadow-[#52796F]/5 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-[#2F3E46] mb-2">{title}</h3>
                <p className="text-[#84A98C] text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Spotlight CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2F3E46] to-[#354F52] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#52796F]/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Get in the Spotlight
          </h2>
          <p className="text-[#CAD2C5]/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Featured developers get seen by hundreds of hiring managers every week. Book your spot and watch the interview requests roll in.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold px-8 h-12 shadow-xl shadow-yellow-500/30 transition-all hover:scale-105">
              Apply for Spotlight
              <Star className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6 bg-[#f4f6f5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">Loved by the community</h2>
            <p className="text-[#84A98C]">Real stories from developers and employers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, company, avatar, quote }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-6 border border-[#CAD2C5]/40 hover:shadow-lg hover:shadow-[#52796F]/5 transition-all duration-300"
              >
                <p className="text-[#2F3E46] leading-relaxed mb-6 text-sm">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#CAD2C5]/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center text-white text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2F3E46] text-sm">{name}</p>
                    <p className="text-[#84A98C] text-xs">{role} · {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-[#354F52]/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border border-[#52796F]/20">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Simple pricing
            </Badge>
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-4">Pay once, grow forever</h2>
            <p className="text-[#84A98C]">M-Pesa payments. No credit card needed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, description, features, cta, href, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
                  highlight
                    ? 'bg-[#2F3E46] border-[#52796F] shadow-2xl shadow-[#52796F]/20 scale-105'
                    : 'bg-white border-[#CAD2C5]/40 hover:border-[#52796F]/30 hover:shadow-lg'
                }`}
              >
                {highlight && (
                  <Badge className="mb-4 bg-[#52796F] text-white border-0 text-xs">
                    Most popular
                  </Badge>
                )}
                <h3 className={`font-bold text-lg mb-1 ${highlight ? 'text-white' : 'text-[#2F3E46]'}`}>
                  {name}
                </h3>
                <p className={`text-sm mb-4 ${highlight ? 'text-[#CAD2C5]/60' : 'text-[#84A98C]'}`}>
                  {description}
                </p>
                <div className="mb-6">
                  <span className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-[#2F3E46]'}`}>
                    {price}
                  </span>
                  {period && (
                    <span className={`text-sm ${highlight ? 'text-[#CAD2C5]/50' : 'text-[#84A98C]'}`}>
                      {period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlight ? 'text-[#84A98C]' : 'text-[#52796F]'}`} />
                      <span className={highlight ? 'text-[#CAD2C5]/80' : 'text-[#2F3E46]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href}>
                  <Button
                    className={`w-full h-10 font-semibold transition-all duration-200 group ${
                      highlight
                        ? 'bg-[#52796F] hover:bg-[#84A98C] text-white shadow-lg shadow-[#52796F]/30'
                        : 'bg-[#f4f6f5] hover:bg-[#CAD2C5] text-[#2F3E46] border border-[#CAD2C5]'
                    }`}
                  >
                    {cta}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#2F3E46] to-[#354F52] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to level up your career?
          </h2>
          <p className="text-[#CAD2C5]/70 mb-10 text-lg">
            Join 2,400+ Kenyan developers already building their future on KEDevs Connect.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#52796F] hover:bg-[#84A98C] text-white px-10 h-14 text-lg font-bold shadow-2xl shadow-[#52796F]/30 transition-all duration-200 hover:scale-105 group"
            >
              Create your free account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a2428] border-t border-[#2F3E46] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#52796F] to-[#354F52] flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-white font-semibold">KEDevs Connect</span>
            </div>
            <div className="flex gap-8 text-sm text-[#84A98C]">
              <a href="#features" className="hover:text-[#CAD2C5] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#CAD2C5] transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-[#CAD2C5] transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-[#CAD2C5] transition-colors">Register</Link>
            </div>
            <p className="text-[#84A98C]/50 text-xs">
              © {new Date().getFullYear()} KEDevs Connect. Built in Kenya 🇰🇪
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
