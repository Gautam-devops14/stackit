'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { voteAnswer } from './actions'

interface VoteButtonsProps {
  answerId: string
  questionId: string
  initialScore: number
  userVote: number
}

export function VoteButtons({ answerId, questionId, initialScore, userVote }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (value: number) => {
    setIsVoting(true)
    try {
      // Toggle vote off if clicking the same button
      const finalValue = userVote === value ? 0 : value
      await voteAnswer(answerId, finalValue, questionId)
    } catch (err: any) {
      alert(err.message || 'Error voting')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`p-1 rounded hover:bg-[var(--color-surface-dim)] transition-colors ${userVote === 1 ? 'text-[var(--color-tertiary)]' : 'text-[var(--color-on-surface-variant)]'}`}
      >
        <ArrowUp size={24} />
      </button>
      
      <span className="font-semibold text-[var(--color-on-surface)] text-lg">
        {initialScore}
      </span>
      
      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`p-1 rounded hover:bg-[var(--color-surface-dim)] transition-colors ${userVote === -1 ? 'text-[var(--color-error)]' : 'text-[var(--color-on-surface-variant)]'}`}
      >
        <ArrowDown size={24} />
      </button>
    </div>
  )
}
