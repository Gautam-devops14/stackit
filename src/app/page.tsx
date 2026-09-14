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
    <div className="flex flex-col lg:flex-row gap-space-lg w-full">
      <div className="flex-1 flex flex-col gap-space-md">
        
        {/* Header Area */}
        <div className="flex items-center justify-between px-space-md py-space-xs bg-[var(--color-surface-container-low)] rounded-lg">
          <span className="font-label-sm text-sm text-[var(--color-on-surface-variant)]">Showing {displayQuestions.length} questions</span>
          <Link href="/ask" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium text-sm hover:bg-[var(--color-primary-container)] transition-colors">
            Ask Question
          </Link>
        </div>

        {/* Question Feed */}
        <div className="flex flex-col gap-space-sm">
          {displayQuestions.map((q: any) => (
            <Link href={`/questions/${q.id}`} key={q.id}>
              <article className="group relative flex flex-col sm:flex-row items-start gap-space-md p-space-md bg-[var(--color-surface-container-low)] rounded-lg hover:bg-[var(--color-surface-container)] transition-all cursor-pointer border border-[var(--color-outline-variant)]">
                
                {/* Stats */}
                <div className="flex sm:flex-col gap-2 min-w-[60px]">
                  <div className="flex items-center sm:flex-col justify-center w-14 sm:w-12 py-1 bg-[var(--color-surface)] rounded text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]">
                    <ArrowUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">0</span>
                  </div>
                  <div className={`flex items-center sm:flex-col justify-center w-auto sm:w-12 px-2 sm:px-0 py-1 rounded ${q.answers[0].count > 0 ? 'bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)]' : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]'} font-medium`}>
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{q.answers[0].count}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-space-xs">
                  <h3 className="text-lg font-semibold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {q.title}
                  </h3>
                  
                  <div className="flex items-center gap-space-sm mt-1 flex-wrap">
                    {q.question_tags.map((qt: any) => (
                      <span key={qt.tags.name} className="px-2 py-0.5 rounded bg-[var(--color-surface-dim)] text-[var(--color-primary)] text-xs font-mono transition-colors">
                        #{qt.tags.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-space-xs mt-2 text-xs text-[var(--color-on-surface-variant)]">
                    <span>asked {formatDistanceToNow(new Date(q.created_at))} ago</span>
                    <span>by</span>
                    <span className="font-medium text-[var(--color-primary)]">@{q.profiles?.username}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {displayQuestions.length === 0 && (
            <div className="p-12 text-center text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-low)] rounded-lg border border-[var(--color-outline-variant)]">
              No questions yet. Be the first to ask!
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-space-md">
        <div className="p-space-md bg-[var(--color-surface-container-low)] rounded-lg border border-[var(--color-outline-variant)] flex flex-col gap-space-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-[var(--color-on-surface)] font-semibold">Trending Tags</h2>
          </div>
          <div className="flex flex-col gap-1">
            {['nextjs', 'supabase', 'react', 'tailwind'].map(tag => (
              <div key={tag} className="flex items-center justify-between px-space-sm py-1.5 rounded-md hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer group">
                <span className="font-mono text-xs text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">#{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
