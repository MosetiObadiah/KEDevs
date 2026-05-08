// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Box } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeStyleProvider } from "@/context/ThemeStyleContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ThemeStyleProvider>
            <ThemeProvider>
              <GoogleAuthProvider>
                <AuthProvider>
                  <RouteGuard>
                    <Navbar />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      {children}
                    </Box>
                    <Footer />
                  </RouteGuard>
                </AuthProvider>
              </GoogleAuthProvider>
            </ThemeProvider>
          </ThemeStyleProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
