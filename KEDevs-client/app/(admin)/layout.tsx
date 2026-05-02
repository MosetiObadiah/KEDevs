'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/lib/auth/guards';
import { useAuth } from '@/lib/auth/hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Flag,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/flags', label: 'Flags & Reports', icon: Flag },
  { href: '/admin/spotlight', label: 'Spotlight', icon: Star },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const initials = user
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'A';

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-deep border-r border-border flex flex-col z-40">
          {/* Header */}
          <div className="p-5 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Admin Panel</p>
                <p className="text-sage/50 text-xs">KEDevs Connect</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-teal text-white shadow-lg shadow-teal/20'
                      : 'text-sage/70 hover:bg-forest hover:text-sage'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-border/30">
              <Link
                href="/feed"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sage/50 hover:text-sage transition-colors"
              >
                ← Back to App
              </Link>
            </div>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border/30">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-teal text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {user?.fullName}
                </p>
                <p className="text-sage/40 text-xs">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sage/40 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-[260px] flex-1 min-h-screen p-8 max-w-full">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
