import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowUp, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient()
  const { username } = await params

  // 1. Fetch user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role, created_at')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // 2. Fetch user's questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, created_at, answers(count)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 3. Fetch user's answers (with related questions)
  const { data: answers } = await supabase
    .from('answers')
    .select('id, content, created_at, questions(id, title), votes(value)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate simple stats
  const questionsCount = questions?.length || 0
  const answersCount = answers?.length || 0
  let upvotesReceived = 0
  answers?.forEach(ans => {
    const sum = ans.votes.reduce((acc: number, v: any) => acc + v.value, 0)
    if (sum > 0) upvotesReceived += sum
  })

  return (
    <div className="w-full relative pb-space-xl">
      
      {/* Profile Hero Card */}
      <div className="mt-space-md w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg md:p-space-xl flex flex-col gap-space-lg border border-outline-variant/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
          {/* Left: Avatar & Bio Meta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md bg-surface-container border border-outline-variant/50 flex items-center justify-center text-4xl font-bold text-on-surface">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-sm">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{profile.username}</h1>
                <span className="font-body-md text-body-md text-on-surface-variant font-label-code">@{profile.username}</span>
                {profile.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary text-label-badge font-label-badge shadow-sm">
                    <span className="material-symbols-outlined text-xs">shield</span> Admin
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
                Community member passionate about software development and learning.
              </p>
              <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm mt-2">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-outline">calendar_month</span>
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md border-t border-outline-variant/30">
          <div className="flex flex-col p-space-md bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm mb-1">
              <span>Questions Asked</span>
              <span className="material-symbols-outlined text-primary-container text-lg">help_outline</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">{questionsCount}</span>
            </div>
          </div>
          <div className="flex flex-col p-space-md bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm mb-1">
              <span>Answers Given</span>
              <span className="material-symbols-outlined text-tertiary-container text-lg">forum</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">{answersCount}</span>
            </div>
          </div>
          <div className="flex flex-col p-space-md bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm mb-1">
              <span>Upvotes Received</span>
              <span className="material-symbols-outlined text-secondary text-lg">thumb_up</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">{upvotesReceived}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-space-xl grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Recent Questions */}
        <div className="flex flex-col gap-space-md">
          <h2 className="text-xl font-bold text-on-surface">Recent Questions</h2>
          <div className="flex flex-col gap-space-sm">
            {questions?.length === 0 ? (
              <div className="p-space-lg text-center text-on-surface-variant bg-surface-container-low rounded-lg border border-outline-variant/30">
                Has not asked any questions yet.
              </div>
            ) : (
              questions?.map((q: any) => (
                <Link href={`/questions/${q.id}`} key={q.id}>
                  <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-outline-variant/40 hover:border-outline-variant transition-colors flex justify-between items-center group">
                    <div className="min-w-0 pr-4 flex-1">
                      <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{q.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">{formatDistanceToNow(new Date(q.created_at))} ago</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-sm font-medium text-on-surface-variant bg-surface-container-low px-2 py-1 rounded border border-outline-variant/30">
                      <MessageSquare className="w-4 h-4" /> {q.answers[0]?.count || 0}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Answers */}
        <div className="flex flex-col gap-space-md">
          <h2 className="text-xl font-bold text-on-surface">Recent Answers</h2>
          <div className="flex flex-col gap-space-sm">
            {answers?.length === 0 ? (
              <div className="p-space-lg text-center text-on-surface-variant bg-surface-container-low rounded-lg border border-outline-variant/30">
                Has not answered any questions yet.
              </div>
            ) : (
              answers?.map((ans: any) => (
                <Link href={`/questions/${ans.questions.id}`} key={ans.id}>
                  <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-outline-variant/40 hover:border-outline-variant transition-colors group">
                    <div className="text-sm font-medium text-on-surface-variant mb-2 line-clamp-1">
                      On: <span className="text-primary">{ans.questions.title}</span>
                    </div>
                    <div className="text-sm text-on-surface line-clamp-2" dangerouslySetInnerHTML={{ __html: ans.content }} />
                    <p className="text-xs text-on-surface-variant mt-2">{formatDistanceToNow(new Date(ans.created_at))} ago</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
