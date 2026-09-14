
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] antialiased flex flex-col`}>
        {latestAnnouncement && (
          <div className="bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] px-4 py-2 text-center text-sm font-medium z-[60] relative">
            <strong>{latestAnnouncement.title}:</strong> {latestAnnouncement.content}
          </div>
        )}
        <header className="sticky top-0 left-0 right-0 w-full z-50 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-outline-variant)]/30"><div className="h-16 max-w-7xl mx-auto px-[var(--spacing-gutter-desktop)] flex items-center justify-between gap-[var(--spacing-space-md)]"><div className="flex items-center gap-[var(--spacing-space-lg)] shrink-0"><a className="flex items-center gap-[var(--spacing-space-sm)] group" data-path="questions" href="/"><span className="font-heading text-xl text-[var(--color-primary)] font-bold tracking-tight">StackIt</span></a></div><div className="flex-1 max-w-md mx-[var(--spacing-space-sm)] hidden sm:block"></div><div className="flex items-center gap-[var(--spacing-space-md)] shrink-0"><a className="inline-flex items-center gap-[var(--spacing-space-xs)] bg-[var(--color-primary)] text-white font-sans text-sm font-medium px-[var(--spacing-space-md)] py-[var(--spacing-space-xs)] rounded-lg hover:bg-[var(--color-primary-container)] transition-all shadow-sm" data-path="ask-question" href="/ask"><span className="material-symbols-outlined text-[18px]">add</span><span className="hidden sm:inline">Ask Question</span></a>
        
        <NotificationBell />

        <a className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" data-path="users" href="/login"><div className="w-8 h-8 rounded-full bg-[var(--color-surface-dim)] border border-[var(--color-outline-variant)]/50 flex items-center justify-center text-xs font-bold">U</div></a></div></div></header>
        <main className="max-w-7xl mx-auto px-gutter-desktop pt-space-xl min-h-[80vh]">
          {children}
        </main>
        <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 py-space-xl mt-space-xl"><div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-label-sm text-label-sm"><div className="flex items-center gap-space-md"><span className="text-on-surface font-headline-sm text-headline-sm font-semibold">PromptDev</span><span>© 2025 High-velocity knowledge exchange for developers.</span></div><div className="flex items-center gap-space-lg"><a className="hover:text-on-surface transition-colors" data-path="questions" href="#">Questions</a><a className="hover:text-on-surface transition-colors" data-path="tags" href="#">Tags</a><a className="hover:text-on-surface transition-colors" data-path="leaderboard" href="#">Leaderboard</a><span className="inline-flex items-center gap-1 text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>Systems Normal</span></div></div></footer>
      </body>
    </html>
  );
}
