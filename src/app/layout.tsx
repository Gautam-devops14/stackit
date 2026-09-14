
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptDev - Q&A Forum",
  description: "A minimal Q&A forum platform.",
};

import { NotificationBell } from '@/components/NotificationBell'
import { createClient } from '@/lib/supabase/server'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: latestAnnouncement } = await supabase
    .from('announcements')
    .select('title, content')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
        {latestAnnouncement && (
          <div className="bg-tertiary text-on-tertiary px-4 py-2 text-center text-sm font-medium z-[60] relative">
            <strong>{latestAnnouncement.title}:</strong> {latestAnnouncement.content}
          </div>
        )}
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 max-w-7xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-lg shrink-0">
              <a className="flex items-center gap-space-sm focus:outline-none" data-path="home" href="/">
                <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">Stack<span className="text-primary-container">It</span></span>
              </a>
              <nav className="hidden md:flex items-center gap-space-xs">
                <a className="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-button text-label-button transition-colors hover:bg-surface-container hover:text-on-surface" href="/">Home</a>
                <a className="px-space-md py-space-xs rounded-lg text-on-surface-variant font-label-button text-label-button transition-colors hover:bg-surface-container hover:text-on-surface" href="/admin">Admin Ops</a>
              </nav>
            </div>
            
            <div className="flex-1 max-w-xl mx-auto hidden sm:block">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">search</span>
                <input className="w-full pl-10 pr-16 py-space-xs bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search questions..." type="text"/>
              </div>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <a className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-primary-container text-on-primary font-label-button text-label-button rounded-lg shadow-sm hover:bg-primary transition-colors focus:outline-none" href="/ask">
                <span className="material-symbols-outlined text-lg">add</span><span className="hidden lg:inline">Ask Question</span>
              </a>
              
              <NotificationBell />

              <div className="flex items-center gap-space-xs pl-space-xs">
                <a className="flex items-center gap-space-xs p-0.5 rounded-full hover:ring-2 hover:ring-outline-variant focus:outline-none transition-all" href="/login">
                  <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-on-surface">U</div>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-24 pb-12 bg-background max-w-7xl mx-auto px-margin-mobile lg:px-margin min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        
        <footer className="w-full bg-surface-container-low mt-space-xl shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">StackIt</span>
                <span className="text-body-sm font-body-sm">© 2026 StackIt Community.</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
