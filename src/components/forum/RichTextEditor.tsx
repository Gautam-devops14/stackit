'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Code } from 'lucide-react'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ content, onChange, minHeight = '150px' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base focus:outline-none max-w-none p-4`,
        style: `min-height: ${minHeight};`,
      },
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
          type="button"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
          type="button"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>
      
      <EditorContent editor={editor} className="cursor-text" />
    </div>
  )
}
