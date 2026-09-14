'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function askQuestion(title: string, description: string, tags: string[]) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('You must be logged in to ask a question.')
  }

  // Check if banned
  const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single()
  if (profile?.is_banned) {
    throw new Error('Your account has been banned from asking questions.')
  }

  // 1. Insert the question
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .insert({
      title,
      description,
      author_id: user.id
    })
    .select()
    .single()

  if (questionError || !question) {
    console.error('Error creating question:', questionError)
    throw new Error('Failed to create question.')
  }

  // 2. Upsert tags and link them
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const normalized = tagName.trim().toLowerCase()
      if (!normalized) continue

      // Try to insert the tag, on conflict do nothing to avoid overwriting original case
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('normalized_name', normalized)
        .single()

      if (!tag) {
        const { data: newTag, error: tagInsertError } = await supabase
          .from('tags')
          .insert({ name: tagName, normalized_name: normalized })
          .select()
          .single()
        
        if (newTag) {
          tag = newTag
        } else {
          console.error('Error inserting tag:', tagInsertError)
          continue
        }
      }

      // Link question to tag
      if (tag) {
        await supabase
          .from('question_tags')
          .insert({
            question_id: question.id,
            tag_id: tag.id
          })
      }
    }
  }

  revalidatePath('/')
  redirect(`/questions/${question.id}`)
}
