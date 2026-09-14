import Link from 'next/link'
import { Search, User } from 'lucide-react'
import { NotificationDropdown } from './NotificationDropdown'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">StackIt</span>
          </Link>
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="h-10 w-64 rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown />
          
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
