import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { AnswerForm } from './AnswerForm'
import { CommentForm } from './CommentForm'
import { VoteButtons } from './VoteButtons'

export const dynamic = 'force-dynamic'

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch question
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      description,
      created_at,
      accepted_answer_id,
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
    .eq('id', id)
    .single()

  const question = questionData as any

  if (questionError || !question) {
    notFound()
  }

  // Fetch answers with comments and votes
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      id,
      content,
      created_at,
      profiles (
        username,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        profiles ( username )
      ),
      votes (
        user_id,
        value
      )
    `)
    .eq('question_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Question Header */}
      <div className="mb-6 border-b border-[var(--color-outline-variant)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-2">{question.title}</h1>
        <div className="flex items-center gap-4 text-sm text-[var(--color-on-surface-variant)]">
          <span>Asked {formatDistanceToNow(new Date(question.created_at))} ago</span>
          <span>by <span className="font-medium text-[var(--color-primary)]">@{question.profiles?.username}</span></span>
        </div>
      </div>

      {/* Question Body */}
      <div className="bg-[var(--color-surface-container-low)] rounded-lg p-6 border border-[var(--color-outline-variant)] mb-8 prose prose-sm sm:prose-base max-w-none text-[var(--color-on-surface)]" dangerouslySetInnerHTML={{ __html: question.description }} />

      {/* Tags */}
      <div className="flex gap-2 mb-8">
        {question.question_tags.map((qt: any) => (
          <span key={qt.tags.name} className="px-2 py-1 bg-[var(--color-surface-dim)] text-[var(--color-primary)] text-sm rounded font-mono">
            #{qt.tags.name}
          </span>
        ))}
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-on-surface)]">{answers?.length || 0} Answers</h2>
        
        <div className="space-y-6">
          {answers?.map((answer: any) => {
            const score = answer.votes.reduce((acc: number, v: any) => acc + v.value, 0)
            const userVote = user ? answer.votes.find((v: any) => v.user_id === user.id)?.value || 0 : 0

            return (
              <div key={answer.id} className={`flex gap-4 p-6 rounded-lg border ${question.accepted_answer_id === answer.id ? 'border-[var(--color-tertiary)] bg-[var(--color-tertiary)]/5' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]'}`}>
                {/* Voting Column */}
                <div className="flex-shrink-0 w-12">
                  <VoteButtons 
                    answerId={answer.id} 
                    questionId={question.id} 
                    initialScore={score} 
                    userVote={userVote} 
                  />
                </div>
                
                {/* Answer Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-[var(--color-on-surface-variant)]">
                      Answered by <span className="font-medium text-[var(--color-primary)]">@{answer.profiles?.username}</span> {formatDistanceToNow(new Date(answer.created_at))} ago
                    </div>
                    {question.accepted_answer_id === answer.id && (
                      <span className="px-2 py-1 bg-[var(--color-tertiary)] text-white text-xs font-bold rounded">
                        Accepted
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm sm:prose-base max-w-none text-[var(--color-on-surface)] mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />
                  
                  {/* Comments Section */}
                  <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]">
                    {answer.comments?.map((comment: any) => (
                      <div key={comment.id} className="py-2 border-b border-[var(--color-outline-variant)]/50 last:border-0 text-sm">
                        <span className="text-[var(--color-on-surface)]">{comment.content}</span>
                        <span className="text-[var(--color-on-surface-variant)] ml-2">
                          – <span className="text-[var(--color-primary)]">@{comment.profiles?.username}</span> {formatDistanceToNow(new Date(comment.created_at))} ago
                        </span>
                      </div>
                    ))}
                    
                    {user && <CommentForm answerId={answer.id} questionId={question.id} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your Answer */}
      {user ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-[var(--color-on-surface)]">Your Answer</h2>
          <AnswerForm questionId={question.id} />
        </div>
      ) : (
        <div className="mt-8 p-6 bg-[var(--color-surface-container-low)] rounded-lg border border-[var(--color-outline-variant)] text-center">
          <p className="text-[var(--color-on-surface-variant)] mb-4">You must be logged in to answer this question.</p>
          <a href="/login" className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium hover:bg-[var(--color-primary-container)]">
            Log in
          </a>
        </div>
      )}
    </div>
  )
}
