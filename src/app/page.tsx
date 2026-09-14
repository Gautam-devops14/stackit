import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ArrowUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch questions, author details, and associated tags
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      profiles (
        username,
        avatar_url
      ),
      question_tags (
        tags (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Ideally we would also count answers and votes. 
  // For MVP, we fetch answers count in a second query or a SQL function, 
  // but let's do a simple count query per question or a joined query if possible.
  // Given standard PostgREST, we can do: `answers (count)` in select if we have foreign keys set up right.

  const { data: questionsWithCounts } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      profiles (
        username,
        avatar_url
      ),
      question_tags (
        tags (
          name
        )
      ),
      answers:answers!answers_question_id_fkey(count)
    `)
    .order('created_at', { ascending: false })

  const displayQuestions = questionsWithCounts || []

  return (
    <div className="flex flex-col lg:flex-row gap-space-xl w-full">
      <div className="flex-1 flex flex-col gap-space-md">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Top Questions</h1>
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-lg self-start sm:self-auto border border-outline-variant/50">
            <button className="px-space-md py-space-xs rounded-md bg-surface text-on-surface font-label-button text-label-button shadow-sm focus:outline-none ring-1 ring-outline-variant/30">Interesting</button>
            <button className="px-space-md py-space-xs rounded-md text-on-surface-variant font-label-button text-label-button hover:bg-surface-container focus:outline-none transition-colors">Bounties</button>
            <button className="px-space-md py-space-xs rounded-md text-on-surface-variant font-label-button text-label-button hover:bg-surface-container focus:outline-none transition-colors">Hot</button>
          </div>
        </div>

        {/* Question Feed */}
        <div className="flex flex-col gap-space-sm">
          {displayQuestions.map((q: any) => (
            <Link href={`/questions/${q.id}`} key={q.id} className="block group">
              <article className="relative flex flex-col sm:flex-row items-start gap-space-md p-space-md bg-surface-container-lowest rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all cursor-pointer border border-outline-variant/40 hover:border-outline-variant">
                
                {/* Stats */}
                <div className="flex sm:flex-col gap-space-sm min-w-[72px] shrink-0">
                  <div className="flex items-center sm:flex-col justify-center w-14 sm:w-16 py-1.5 bg-surface-container-lowest rounded-md text-on-surface border border-outline-variant/60 shadow-sm">
                    <ArrowUp className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-semibold text-sm">0</span>
                  </div>
                  <div className={`flex items-center sm:flex-col justify-center w-auto sm:w-16 px-2 sm:px-0 py-1.5 rounded-md ${q.answers[0].count > 0 ? 'bg-tertiary-container/10 text-tertiary border border-tertiary/20' : 'bg-surface-container-low text-on-surface-variant border border-transparent'} font-medium`}>
                    <MessageSquare className="w-4 h-4 mb-0.5" />
                    <span className="text-sm">{q.answers[0].count}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {q.title}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mt-3">
                    <div className="flex items-center gap-space-sm flex-wrap">
                      {q.question_tags.map((qt: any) => (
                        <span key={qt.tags.name} className="px-2 py-0.5 rounded bg-surface-dim text-primary text-xs font-mono transition-colors">
                          #{qt.tags.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-space-xs text-xs text-on-surface-variant shrink-0">
                      <span>asked {formatDistanceToNow(new Date(q.created_at))} ago</span>
                      <span>by</span>
                      <Link href={`/users/${q.profiles?.username}`} className="font-medium text-primary hover:underline">@{q.profiles?.username}</Link>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {displayQuestions.length === 0 && (
            <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-lg border border-outline-variant">
              No questions yet. Be the first to ask!
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-space-md">
        <div className="p-space-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col gap-space-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-on-surface font-semibold">Trending Tags</h2>
          </div>
          <div className="flex flex-col gap-1">
            {['nextjs', 'supabase', 'react', 'tailwind'].map(tag => (
              <div key={tag} className="flex items-center justify-between px-space-sm py-1.5 rounded-md hover:bg-surface-container transition-colors cursor-pointer group">
                <span className="font-mono text-xs text-on-surface group-hover:text-primary transition-colors">#{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
