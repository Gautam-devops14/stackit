'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/RichTextEditor'
import { TagAutocomplete } from '@/components/TagAutocomplete'
import { askQuestion } from './actions'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!title.trim()) throw new Error('Title is required')
      if (!description.trim() || description === '<p></p>') throw new Error('Description is required')
      if (tags.length === 0) throw new Error('At least one tag is required')

      await askQuestion(title, description, tags)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-lg bg-[var(--color-surface-container-low)] p-space-xl rounded-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-[var(--color-on-surface)]">Ask a public question</h1>
        <p className="mt-2 text-[var(--color-on-surface-variant)]">Be specific and imagine you're asking a question to another person.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <label className="font-medium text-[var(--color-on-surface)]">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-space-md py-2 bg-[var(--color-surface-container)] border border-[var(--color-outline)] rounded-md text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder="e.g. Is there an R object oriented programming guide?"
            required
          />
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-medium text-[var(--color-on-surface)]">Body</label>
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline)] rounded-md overflow-hidden focus-within:border-[var(--color-primary)] transition-colors text-[var(--color-on-surface)]">
             <RichTextEditor value={description} onChange={setDescription} />
          </div>
        </div>

        <div className="flex flex-col gap-space-xs">
          <label className="font-medium text-[var(--color-on-surface)]">Tags</label>
          <TagAutocomplete selectedTags={tags} onChange={setTags} />
        </div>

        {error && (
          <div className="p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <div className="pt-space-md flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-md hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Your Question'}
          </button>
        </div>
      </form>
    </div>
  )
}
