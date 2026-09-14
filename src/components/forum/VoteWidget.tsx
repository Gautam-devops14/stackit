'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface VoteWidgetProps {
  initialVotes: number
  initialUserVote?: 1 | -1 | 0
  onVote?: (value: 1 | -1 | 0) => void
}

export function VoteWidget({ initialVotes, initialUserVote = 0, onVote }: VoteWidgetProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState(initialUserVote)

  const handleVote = (value: 1 | -1) => {
    // Optimistic UI update logic
    let newValue = userVote === value ? 0 : value
    
    // Calculate difference
    const diff = newValue - userVote
    setVotes(votes + diff)
    setUserVote(newValue as 1 | -1 | 0)
    
    if (onVote) {
      onVote(newValue as 1 | -1 | 0)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        onClick={() => handleVote(1)}
        className={`rounded-full p-1 transition-colors ${userVote === 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100 hover:text-blue-600'}`}
      >
        <ChevronUp className="h-8 w-8" />
      </button>
      <span className="text-xl font-semibold text-gray-700">{votes}</span>
      <button 
        onClick={() => handleVote(-1)}
        className={`rounded-full p-1 transition-colors ${userVote === -1 ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'}`}
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </div>
  )
}
