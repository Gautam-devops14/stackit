'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock Notifications
  const unreadCount = 2
  const notifications = [
    { id: 1, text: "bob_builder answered your question.", read: false },
    { id: 2, text: "charlie_db accepted your answer.", read: false },
    { id: 3, text: "Your question received 10 upvotes.", read: true },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none z-50">
          <div className="p-3 border-b border-gray-100 font-semibold text-gray-900">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 text-sm border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}>
                <p className={`text-gray-800 ${!n.read ? 'font-medium' : ''}`}>{n.text}</p>
                <span className="text-xs text-gray-500 mt-1 block">2 hours ago</span>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-gray-100">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Mark all as read</button>
          </div>
        </div>
      )}
    </div>
  )
}
