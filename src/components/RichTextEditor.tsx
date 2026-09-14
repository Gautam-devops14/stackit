'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { createClient } from '@/lib/supabase/client'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png, image/jpeg, image/jpg, image/gif, image/webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Limit size to 5MB
      if (file.size > 5242880) {
        alert('Image must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('post_images')
        .upload(fileName, file)

      if (error) {
        alert('Failed to upload image')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post_images')
        .getPublicUrl(data.path)

      editor.chain().focus().setImage({ src: publicUrl }).run()
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container">
      <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('bold') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('italic') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('strike') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        
        <div className="w-px h-6 bg-outline-variant mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('bulletList') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('orderedList') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-outline-variant mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>

        <div className="w-px h-6 bg-outline-variant mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-surface-dim ${
            editor.isActive('link') ? 'bg-surface-dim text-primary' : ''
          }`}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </button>
        <button
          type="button"
          onClick={handleImageUpload}
          className="p-2 rounded hover:bg-surface-dim"
          title="Upload Image"
        >
          <ImageIcon size={18} />
        </button>
      </div>
      
      <div className="bg-surface rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
