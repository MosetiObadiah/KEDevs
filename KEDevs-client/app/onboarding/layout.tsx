import { AuthGuard } from '@/lib/auth/guards';

export default function OnboardingLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
