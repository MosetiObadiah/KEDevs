// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "KEDevs - Kenya's Developer Community",
  description: "Find Kenyan tech talent and opportunity. Browse jobs, showcase skills, and connect with developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <GoogleAuthProvider>
                <TooltipProvider>
                  <RouteGuard>
                    <AppLayout>
                      {children}
                    </AppLayout>
                  </RouteGuard>
                  <Toaster richColors position="top-right" />
                </TooltipProvider>
              </GoogleAuthProvider>
            </NotificationProvider>
          </AuthProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}

