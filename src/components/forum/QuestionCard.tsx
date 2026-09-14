import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface QuestionCardProps {
  id: string
  title: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  votes: number
  answersCount: number
  tags: string[]
}

export function QuestionCard({
  id,
  title,
  authorName,
  createdAt,
  votes,
  answersCount,
  tags,
}: QuestionCardProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col items-center gap-3 min-w-[4rem]">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-900">{votes}</span>
          <span className="text-xs text-gray-500">votes</span>
        </div>
        <div className={`flex flex-col items-center rounded-lg px-2 py-1 ${answersCount > 0 ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'text-gray-500'}`}>
          <span className="text-lg font-semibold">{answersCount}</span>
          <span className="text-xs">answers</span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/q/${id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
            {title}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-500">
          <span>asked {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          <span>by</span>
          <span className="font-medium text-blue-600 hover:underline cursor-pointer">{authorName}</span>
        </div>
      </div>
    </div>
  )
}
