'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2F3E46] to-[#52796F] flex items-center justify-center p-12">
                 <div className="text-white space-y-6">
                    <p className="text-4xl font-bold leading-tight">Empowering Kenya&apos;s Tech Talent</p>
                    <p className="text-white/70 text-lg">We believe that talent is universal, but opportunity is not. KEDevs Connect is here to bridge that gap.</p>
                 </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#CAD2C5] rounded-full -z-0 opacity-20 blur-3xl" />
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-[#52796F] rounded-full -z-0 opacity-10 blur-3xl" />
          </div>

          <div>
            <Badge className="mb-4 bg-[#52796F]/10 text-[#52796F] border-[#52796F]/20">
              <Info className="w-3.5 h-3.5 mr-1.5" />
              Our Mission
            </Badge>
            <h2 className="text-4xl font-bold text-[#2F3E46] mb-6">Building the Infrastructure for Kenyan Tech</h2>
            <div className="space-y-6 text-[#84A98C] text-lg leading-relaxed">
              <p>
                KEDevs Connect started with a simple idea: the Kenyan developer community is one of the most vibrant in the world, yet finding a great job or a great hire shouldn&apos;t feel like a shot in the dark.
              </p>
              <p>
                We&apos;ve built a platform that puts the developer first. By verifying skills, encouraging peer endorsements, and hosting a community-driven job board with transparent discussions, we&apos;re creating a higher standard for tech recruitment in the region.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  'Verified Professionals',
                  'Transparent Job Posts',
                  'Community Driven',
                  'M-Pesa Integrated'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#2F3E46]">
                    <div className="w-5 h-5 rounded-full bg-[#52796F]/20 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-[#52796F]" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you shortly.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-24 px-6 bg-[#f4f6f5]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#2F3E46] rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-2/5 p-12 lg:p-16 bg-[#354F52] text-white">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <p className="text-[#CAD2C5]/60 mb-12">
              Have questions about our platform or want to partner with us? We&apos;d love to hear from you.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#84A98C]">
                  <Mail className="w-6 h-6 text-[#84A98C]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Email Us</p>
                  <p className="text-[#CAD2C5]/60 text-sm">hello@kedevs.co.ke</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#84A98C]">
                  <Phone className="w-6 h-6 text-[#84A98C]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Call Us</p>
                  <p className="text-[#CAD2C5]/60 text-sm">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#84A98C]">
                  <MapPin className="w-6 h-6 text-[#84A98C]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Our Office</p>
                  <p className="text-[#CAD2C5]/60 text-sm">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-12 lg:p-16">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Full Name</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#52796F] transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Email Address</label>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#52796F] transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Subject</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#52796F] transition-colors" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Message</label>
                <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#52796F] transition-colors h-32 resize-none" placeholder="Write your message here..."></textarea>
              </div>
              <Button type="submit" className="w-full h-14 bg-[#52796F] hover:bg-[#84A98C] text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-[#52796F]/20 group">
                Send Message
                <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
