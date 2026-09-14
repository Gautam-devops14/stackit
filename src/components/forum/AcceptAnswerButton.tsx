'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

interface AcceptAnswerButtonProps {
  initialAccepted: boolean
  isQuestionOwner: boolean
  onToggle?: (accepted: boolean) => void
}

export function AcceptAnswerButton({ initialAccepted, isQuestionOwner, onToggle }: AcceptAnswerButtonProps) {
  const [accepted, setAccepted] = useState(initialAccepted)

  const handleClick = () => {
    if (!isQuestionOwner) return
    const newState = !accepted
    setAccepted(newState)
    if (onToggle) onToggle(newState)
  }

  if (!isQuestionOwner && !accepted) return null

  return (
    <button
      onClick={handleClick}
      disabled={!isQuestionOwner}
      className={`mt-2 rounded-full p-1.5 transition-colors ${accepted ? 'text-green-600' : 'text-gray-300 hover:text-green-600 hover:bg-green-50'}`}
      title={accepted ? "Accepted Answer" : "Mark as accepted"}
    >
      <Check className="h-6 w-6" />
    </button>
  )
}
