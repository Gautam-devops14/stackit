'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'ANSWER' | 'COMMENT' | 'MENTION'
  read: boolean
  question_id: string
  actor: { username: string }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        read,
        question_id,
        actor:actor_id ( username )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data as any)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 45 seconds as requested in the PRD decisions
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setIsOpen(false)
  }

  const getMessage = (n: Notification) => {
    const name = n.actor?.username || 'Someone'
    switch (n.type) {
      case 'ANSWER': return `${name} answered your question`
      case 'COMMENT': return `${name} commented on your answer`
      case 'MENTION': return `${name} mentioned you`
      default: return `New interaction from ${name}`
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications() // refresh when opened
        }}
        className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-error)] ring-2 ring-[var(--color-surface)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-[var(--color-outline-variant)] font-semibold text-sm">
            Notifications ({unreadCount})
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={`/questions/${n.question_id}`}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`block p-4 text-sm border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-dim)] transition-colors ${!n.read ? 'bg-[var(--color-surface-dim)]/50' : ''}`}
                >
                  <p className={!n.read ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'}>
                    {getMessage(n)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
