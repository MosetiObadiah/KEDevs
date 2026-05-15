'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ChevronRight, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token);
      } catch (err: any) {
        const errorMessage = err.message || 'Google Login failed.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login failed.');
      toast.error('Google Login failed.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-emerald-50 text-emerald-600 border-emerald-100 mb-4 px-3 py-1">
              WELCOME BACK
           </Badge>
           <h1 className="text-4xl font-black tracking-tight text-slate-900">Sign In</h1>
           <p className="text-slate-500 font-semibold mt-2">Access your professional dashboard</p>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-900 animate-in shake duration-300">
                   <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                   <p className="text-xs font-black">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="jane@example.com" 
                      className="pl-11 h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Password</Label>
                    <Link href="/reset-password" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="pl-11 pr-12 h-14 rounded-2xl border-slate-200 font-bold focus-visible:ring-primary/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-100" />
               </div>
               <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Or continue with</span>
               </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-slate-200 font-black gap-3 hover:bg-slate-50 transition-all"
              onClick={() => handleGoogleLogin()}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Account
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50/50 p-8 flex justify-center border-t border-slate-100">
             <p className="text-sm font-bold text-slate-500">
                Don't have an account? <Link href="/register" className="text-primary font-black hover:underline ml-1">Join Community</Link>
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      className
    )}>
      {children}
    </span>
  );
}
