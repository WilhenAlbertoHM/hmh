import { Beaker } from "lucide-react";
import HeaderAuth from "@/components/header-auth";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Health Mapping Hub",
  description: "app with Next.js and Supabase",
};

const montserrat = Montserrat({
    subsets: ["latin"],
    preload: true,
  }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check authentication status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Determine the "Find Trials" link based on auth status
  const findTrialsLink = user ? "/dashboard" : "/";
  
  return (
    <html lang="en">
      <body className={`${montserrat.className}`}>
        <div className="min-h-screen flex flex-col antialiased bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(137,196,244,0.7)_100%)]">
          <header className="sticky top-0 z-3 w-full border-b bg-background/95 flex justify-evenly backdrop-blur supports-[backdrop-filter]:bg-background/90 px-4">
            <div className="container mx-auto px-4 flex h-16 items-center">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold">
                <Beaker className="h-8 w-8 text-blue-600" />
                <span className="text-lg">Health Mapping Hub</span>
              </Link>
              <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                <Link href={findTrialsLink} className="text-md font-medium hover:underline underline-offset-8">Find Trials</Link>
                <Link href="/contact" className="text-md font-medium hover:underline underline-offset-8">Contact</Link>
                <HeaderAuth />
              </nav>
            </div>
          </header>
          
          <main className="flex flex-1 justify-center items-center">
            <div>
              { children }
            </div>
          </main>
          
          <footer className="border-t py-4 bg-white">
            <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Health Mapping Hub</span>
              </div>
              <p className="text-center text-sm text-muted-foreground md:text-left">
                &copy; Health Mapping Hub, 2025. All rights reserved.
              </p>
              <nav className="flex gap-4 sm:gap-6">
                <Link href="/terms" className="text-md font-medium hover:underline underline-offset-8 transition-colors">Terms</Link>
                <Link href="/privacy" className="text-md font-medium hover:underline underline-offset-8 transition-colors">Privacy</Link>
                <Link href="/contact" className="text-md font-medium hover:underline underline-offset-8 transition-colors">Contact</Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}