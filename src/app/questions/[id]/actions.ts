'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAnswer(questionId: string, content: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('You must be logged in to answer a question.')
  }

  const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single()
  if (profile?.is_banned) {
    throw new Error('Your account is banned.')
  }

  const { error } = await supabase
    .from('answers')
    .insert({
      question_id: questionId,
      content,
      author_id: user.id
    })

  if (error) {
    console.error('Error adding answer:', error)
    throw new Error('Failed to post answer.')
  }

  // Notify question author
  const { data: question } = await supabase
    .from('questions')
    .select('author_id')
    .eq('id', questionId)
    .single()

  if (question && question.author_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: question.author_id,
      actor_id: user.id,
      type: 'ANSWER',
      question_id: questionId
    })
  }

  revalidatePath(`/questions/${questionId}`)
}

export async function acceptAnswer(questionId: string, answerId: string) {
  const supabase = await createClient()

  // Verify the current user owns the question
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: question } = await supabase
    .from('questions')
    .select('author_id')
    .eq('id', questionId)
    .single()

  if (question?.author_id !== user.id) {
    throw new Error('Only the author can accept an answer')
  }

  const { error } = await supabase
    .from('questions')
    .update({ accepted_answer_id: answerId })
    .eq('id', questionId)

  if (error) {
    throw new Error('Failed to accept answer')
  }

  revalidatePath(`/questions/${questionId}`)
}

export async function voteAnswer(answerId: string, value: number, questionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .single()

  if (profile?.is_banned) {
    throw new Error('Your account is banned.')
  }

  if (value !== 1 && value !== -1 && value !== 0) {
    throw new Error('Invalid vote value')
  }

  if (value === 0) {
    // Remove vote
    await supabase.from('votes').delete().match({ user_id: user.id, answer_id: answerId })
  } else {
    // Upsert vote
    await supabase.from('votes').upsert(
      { user_id: user.id, answer_id: answerId, vote_type: value },
      { onConflict: 'user_id, answer_id' }
    )
  }

  revalidatePath(`/questions/${questionId}`)
}

export async function addComment(answerId: string, content: string, questionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single()
  if (profile?.is_banned) {
    throw new Error('Your account is banned.')
  }

  if (!content.trim() || content.length > 500) {
    throw new Error('Comment must be between 1 and 500 characters')
  }

  const { error } = await supabase.from('comments').insert({
    answer_id: answerId,
    author_id: user.id,
    content
  })

  if (error) {
    throw new Error('Failed to post comment')
  }

  // Parse mentions from content: @username
  const mentionRegex = /@(\w+)/g;
  let match;
  const mentionedUsernames = new Set<string>();
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentionedUsernames.add(match[1]);
  }

  if (mentionedUsernames.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', Array.from(mentionedUsernames))

    if (profiles) {
      for (const profile of profiles) {
        if (profile.id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: profile.id,
            actor_id: user.id,
            type: 'MENTION',
            question_id: questionId
          })
        }
      }
    }
  }

  revalidatePath(`/questions/${questionId}`)
}
