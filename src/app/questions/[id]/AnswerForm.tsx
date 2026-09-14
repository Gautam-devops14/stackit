'use client'

import { useState } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { addAnswer } from './actions'

export function AnswerForm({ questionId }: { questionId: string }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!content.trim() || content === '<p></p>') {
        throw new Error('Answer content cannot be empty')
      }

      await addAnswer(questionId, content)
      setContent('')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[var(--color-surface-container)] rounded-lg border border-[var(--color-outline-variant)]">
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {error && (
        <div className="p-3 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md font-medium hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Your Answer'}
        </button>
      </div>
    </form>
  )
}
