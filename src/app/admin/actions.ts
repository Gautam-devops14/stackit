'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkIsAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'ADMIN'
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()
  if (!(await checkIsAdmin(supabase))) throw new Error('Unauthorized')

  await supabase.from('questions').delete().eq('id', questionId)
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function toggleBanUser(userId: string, currentStatus: boolean) {
  const supabase = await createClient()
  if (!(await checkIsAdmin(supabase))) throw new Error('Unauthorized')

  await supabase
    .from('profiles')
    .update({ is_banned: !currentStatus })
    .eq('id', userId)
    
  revalidatePath('/admin')
}

export async function createAnnouncement(title: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await checkIsAdmin(supabase))) throw new Error('Unauthorized')

  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required')
  }

  await supabase.from('announcements').insert({
    author_id: user.id,
    title,
    content
  })

  revalidatePath('/')
  revalidatePath('/admin')
}
