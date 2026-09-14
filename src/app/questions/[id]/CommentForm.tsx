'use client'

import { useState } from 'react'
import { addComment } from './actions'

export function CommentForm({ answerId, questionId }: { answerId: string, questionId: string }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!content.trim()) return
      await addComment(answerId, content, questionId)
      setContent('')
      setIsOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error posting comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-primary hover:underline mt-2 inline-block"
      >
        Add a comment
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your comment... use @username to mention"
        className="flex-1 text-sm bg-surface border border-outline-variant rounded px-3 py-1.5 focus:border-primary focus:outline-none"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary-container disabled:opacity-50"
      >
        Comment
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-3 py-1.5 text-on-surface-variant text-xs font-medium hover:text-on-surface"
      >
        Cancel
      </button>
    </form>
  )
}
