'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { useForumStore } from '@/lib/store'
import { RichTextEditor } from '@/components/forum/RichTextEditor'
import { ArrowUp, Check } from 'lucide-react'

export default function QuestionDetail() {
  const params = useParams()
  const questionId = params.id as string
  
  const question = useForumStore(state => state.questions.find(q => q.id === questionId))
  const { addAnswer, voteQuestion, voteAnswer, acceptAnswer } = useForumStore()
  
  const [newAnswer, setNewAnswer] = useState('')

  if (!question) {
    return <div className="p-12 text-center text-on-surface">Question not found.</div>
  }

  const handlePostAnswer = () => {
    if (!newAnswer.trim()) return
    addAnswer(questionId, newAnswer)
    setNewAnswer('')
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-space-xl">
      
      {/* Question Header & Body */}
      <div className="flex flex-col sm:flex-row items-start gap-space-lg p-space-lg bg-surface-container-low rounded-lg">
        {/* Voting Sidebar */}
        <div className="flex sm:flex-col items-center gap-2 min-w-[60px] pt-1">
          <button 
            onClick={() => voteQuestion(questionId, 1)}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${question.userVote === 1 ? 'bg-primary/20 text-primary' : 'bg-surface-container hover:bg-surface-container-high text-outline'}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="font-body-lg font-bold text-on-surface">{question.votes}</span>
          <button 
            onClick={() => voteQuestion(questionId, -1)}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${question.userVote === -1 ? 'bg-error/20 text-error' : 'bg-surface-container hover:bg-surface-container-high text-outline'}`}
          >
            <ArrowUp className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-space-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">{question.title}</h1>
            <div className="flex items-center gap-space-sm mt-2 text-label-sm text-outline">
              <span>Asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
              <span>by <span className="font-medium text-primary">@{question.authorName}</span></span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-on-surface" dangerouslySetInnerHTML={{ __html: question.content }} />

          <div className="flex items-center gap-space-sm flex-wrap mt-2">
            {question.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-surface-container-highest font-code-inline text-on-surface-variant">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {/* Sort by accepted first, then votes */}
        {[...question.answers]
          .sort((a, b) => Number(b.isAccepted) - Number(a.isAccepted) || b.votes - a.votes)
          .map(answer => (
          <div key={answer.id} className={`flex flex-col sm:flex-row items-start gap-space-lg p-space-lg rounded-lg border transition-colors ${answer.isAccepted ? 'bg-secondary-fixed-dim/5 border-secondary/30' : 'bg-surface-container-low border-transparent'}`}>
            
            {/* Answer Voting & Accept */}
            <div className="flex sm:flex-col items-center gap-2 min-w-[60px] pt-1">
              <button 
                onClick={() => voteAnswer(questionId, answer.id, 1)}
                className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${answer.userVote === 1 ? 'bg-primary/20 text-primary' : 'bg-surface-container hover:bg-surface-container-high text-outline'}`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="font-body-lg font-bold text-on-surface">{answer.votes}</span>
              <button 
                onClick={() => voteAnswer(questionId, answer.id, -1)}
                className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${answer.userVote === -1 ? 'bg-error/20 text-error' : 'bg-surface-container hover:bg-surface-container-high text-outline'}`}
              >
                <ArrowUp className="w-5 h-5 rotate-180" />
              </button>

              <button 
                onClick={() => acceptAnswer(questionId, answer.id)}
                className={`mt-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${answer.isAccepted ? 'bg-secondary text-surface-container-lowest' : 'bg-surface-container text-outline hover:text-secondary'}`}
                title={answer.isAccepted ? "Accepted Answer" : "Mark as Accepted"}
              >
                <Check className="w-6 h-6" />
              </button>
            </div>

            {/* Answer Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-space-md">
              <div className="prose prose-invert max-w-none text-on-surface" dangerouslySetInnerHTML={{ __html: answer.content }} />
              
              <div className="flex justify-end mt-4">
                <div className="px-space-md py-space-sm bg-surface-container rounded-md text-right">
                  <div className="text-label-sm text-outline">answered {formatDistanceToNow(new Date(answer.createdAt))} ago</div>
                  <div className="font-medium text-primary">@{answer.authorName}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Your Answer */}
      <div className="bg-surface-container-low p-space-lg rounded-lg flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Your Answer</h2>
        <div className="bg-surface-container border border-outline rounded-md overflow-hidden focus-within:border-primary transition-colors text-on-surface">
          <RichTextEditor content={newAnswer} onChange={setNewAnswer} minHeight="200px" />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handlePostAnswer}
            className="px-6 py-2.5 bg-primary text-on-surface font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Post Your Answer
          </button>
        </div>
      </div>
    </div>
  )
}
