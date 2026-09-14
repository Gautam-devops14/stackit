import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { deleteQuestion, toggleBanUser, createAnnouncement } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-[var(--color-error)]">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  // Fetch recent questions for moderation
  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, created_at, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch users for banning
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, is_banned, role')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Content Moderation */}
        <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg border border-[var(--color-outline-variant)]">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">Recent Questions</h2>
          <div className="space-y-4">
            {questions?.map((q: any) => (
              <div key={q.id} className="flex justify-between items-center p-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded">
                <div className="min-w-0 pr-4">
                  <a href={`/questions/${q.id}`} className="font-semibold text-sm truncate text-[var(--color-on-surface)] hover:text-[var(--color-primary)] hover:underline block">
                    {q.title}
                  </a>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">by @{q.profiles?.username} - {formatDistanceToNow(new Date(q.created_at))} ago</p>
                </div>
                <form action={async () => {
                  'use server'
                  await deleteQuestion(q.id)
                }}>
                  <button className="px-3 py-1 bg-[var(--color-error)] text-white text-xs font-medium rounded hover:opacity-90">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* User Management */}
          <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg border border-[var(--color-outline-variant)]">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">User Management</h2>
            <div className="space-y-4">
              {users?.map((u: any) => (
                <div key={u.id} className="flex justify-between items-center p-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded">
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-on-surface)]">@{u.username}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">Role: {u.role}</p>
                  </div>
                  {u.role !== 'ADMIN' && (
                    <form action={async () => {
                      'use server'
                      await toggleBanUser(u.id, u.is_banned)
                    }}>
                      <button className={`px-3 py-1 text-xs font-medium rounded ${u.is_banned ? 'bg-[var(--color-surface-dim)] text-[var(--color-on-surface)]' : 'bg-[var(--color-error)] text-white'} hover:opacity-90`}>
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-[var(--color-surface-container-low)] p-6 rounded-lg border border-[var(--color-outline-variant)]">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">Send Announcement</h2>
            <form action={async (formData) => {
              'use server'
              const title = formData.get('title') as string
              const content = formData.get('content') as string
              await createAnnouncement(title, content)
            }} className="space-y-4">
              <input
                name="title"
                placeholder="Announcement Title"
                required
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none text-[var(--color-on-surface)]"
              />
              <textarea
                name="content"
                placeholder="Message..."
                required
                rows={3}
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded px-3 py-2 focus:border-[var(--color-primary)] focus:outline-none text-[var(--color-on-surface)]"
              />
              <button className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded hover:bg-[var(--color-primary-container)]">
                Publish
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
