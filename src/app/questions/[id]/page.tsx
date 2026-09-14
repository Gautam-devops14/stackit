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
        vote_type
      )
    `)
    .eq('question_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl mx-auto py-space-xl">
      {/* Question Header */}
      <div className="mb-space-lg border-b border-outline-variant pb-space-lg">
        <h1 className="text-3xl font-bold text-on-surface mb-2">{question.title}</h1>
        <div className="flex items-center gap-space-md text-sm text-on-surface-variant">
          <span>Asked {formatDistanceToNow(new Date(question.created_at))} ago</span>
          <span>by <span className="font-medium text-primary">@{question.profiles?.username}</span></span>
        </div>
      </div>

      {/* Question Body */}
      <div className="bg-surface-container-low rounded-lg p-space-lg border border-outline-variant mb-space-xl prose prose-sm sm:prose-base max-w-none text-on-surface" dangerouslySetInnerHTML={{ __html: question.description }} />

      {/* Tags */}
      <div className="flex gap-2 mb-space-xl">
        {question.question_tags.map((qt: any) => (
          <span key={qt.tags.name} className="px-2 py-1 bg-surface-dim text-primary text-sm rounded font-mono">
            #{qt.tags.name}
          </span>
        ))}
      </div>

      {/* Answers Section */}
      <div className="mb-space-xl">
        <h2 className="text-xl font-bold mb-4 text-on-surface">{answers?.length || 0} Answers</h2>
        
        <div className="space-y-6">
          {answers?.map((answer: any) => {
            const score = answer.votes.reduce((acc: number, v: any) => acc + v.vote_type, 0)
            const userVote = user ? answer.votes.find((v: any) => v.user_id === user.id)?.vote_type || 0 : 0

            return (
              <div key={answer.id} className={`flex gap-space-md p-space-lg rounded-lg border ${question.accepted_answer_id === answer.id ? 'border-tertiary bg-tertiary/5' : 'border-outline-variant bg-surface-container-low'}`}>
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
                    <div className="text-sm text-on-surface-variant">
                      Answered by <span className="font-medium text-primary">@{answer.profiles?.username}</span> {formatDistanceToNow(new Date(answer.created_at))} ago
                    </div>
                    {question.accepted_answer_id === answer.id && (
                      <span className="px-2 py-1 bg-tertiary text-white text-xs font-bold rounded">
                        Accepted
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm sm:prose-base max-w-none text-on-surface mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />
                  
                  {/* Comments Section */}
                  <div className="mt-4 pt-4 border-t border-outline-variant">
                    {answer.comments?.map((comment: any) => (
                      <div key={comment.id} className="py-2 border-b border-outline-variant/50 last:border-0 text-sm">
                        <span className="text-on-surface">{comment.content}</span>
                        <span className="text-on-surface-variant ml-2">
                          – <span className="text-primary">@{comment.profiles?.username}</span> {formatDistanceToNow(new Date(comment.created_at))} ago
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
        <div className="mt-space-xl">
          <h2 className="text-xl font-bold mb-4 text-on-surface">Your Answer</h2>
          <AnswerForm questionId={question.id} />
        </div>
      ) : (
        <div className="mt-space-xl p-space-lg bg-surface-container-low rounded-lg border border-outline-variant text-center">
          <p className="text-on-surface-variant mb-4">You must be logged in to answer this question.</p>
          <a href="/login" className="inline-block px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-container">
            Log in
          </a>
        </div>
      )}
    </div>
  )
}
