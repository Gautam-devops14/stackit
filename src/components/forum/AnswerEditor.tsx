'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Code } from 'lucide-react'

export function AnswerEditor({ onSubmit }: { onSubmit: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none p-4',
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
      
      <div className="flex justify-end p-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => {
            onSubmit(editor.getHTML())
            editor.commands.setContent('')
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Post Answer
        </button>
      </div>
    </div>
  )
}
