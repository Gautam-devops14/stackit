'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface TagAutocompleteProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function TagAutocomplete({ selectedTags, onChange }: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!inputValue.trim()) {
        setSuggestions([])
        return
      }

      const { data } = await supabase
        .from('tags')
        .select('id, name')
        .ilike('name', `%${inputValue}%`)
        .limit(5)

      setSuggestions(data || [])
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, supabase])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddTag = (tagName: string) => {
    const normalized = tagName.trim().toLowerCase()
    if (!normalized) return

    // Prevent duplicates in selected tags (case-insensitive check)
    if (!selectedTags.some(t => t.toLowerCase() === normalized)) {
      onChange([...selectedTags, tagName.trim()])
    }
    setInputValue('')
    setIsOpen(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[var(--color-surface-dim)] text-[var(--color-primary)] px-2 py-1 rounded text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-container)]"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. React, Nextjs (press Enter to add)"
          className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm placeholder-[var(--color-on-surface-variant)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        
        {isOpen && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.id}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-surface-dim)] text-[var(--color-on-surface)]"
                onClick={() => handleAddTag(suggestion.name)}
              >
                {suggestion.name}
              </button>
            ))}
            {!suggestions.some(s => s.name.toLowerCase() === inputValue.toLowerCase()) && (
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-surface-dim)] text-[var(--color-on-surface)]"
                onClick={() => handleAddTag(inputValue)}
              >
                Create new tag: <span className="font-semibold">"{inputValue}"</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
