import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Answer = {
  id: string
  content: string
  authorName: string
  createdAt: string
  votes: number
  isAccepted: boolean
  userVote: 1 | -1 | 0
}

export type Question = {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
  tags: string[]
  votes: number
  answersCount: number
  answers: Answer[]
  userVote: 1 | -1 | 0
}

interface ForumStore {
  questions: Question[]
  addQuestion: (title: string, content: string, tags: string[]) => void
  addAnswer: (questionId: string, content: string) => void
  voteQuestion: (questionId: string, value: 1 | -1) => void
  voteAnswer: (questionId: string, answerId: string, value: 1 | -1) => void
  acceptAnswer: (questionId: string, answerId: string) => void
}

const initialQuestions: Question[] = [
  {
    id: '1',
    title: 'How do I implement Row Level Security in Supabase with Next.js?',
    content: '<p>I am building a Next.js App Router application and I want to secure my database using Supabase RLS. What is the standard approach to pass the user session to Postgres?</p>',
    authorName: 'alice_dev',
    createdAt: new Date().toISOString(),
    tags: ['supabase', 'nextjs', 'security'],
    votes: 12,
    answersCount: 1,
    userVote: 0,
    answers: [
      {
        id: 'a1',
        content: '<p>You need to use the <code>@supabase/ssr</code> package to create a server client.</p>',
        authorName: 'bob_builder',
        createdAt: new Date().toISOString(),
        votes: 8,
        isAccepted: true,
        userVote: 0,
      }
    ]
  }
]

export const useForumStore = create<ForumStore>()(
  persist(
    (set) => ({
      questions: initialQuestions,
      addQuestion: (title, content, tags) => set((state) => ({
        questions: [
          {
            id: Date.now().toString(),
            title,
            content,
            authorName: 'current_user',
            createdAt: new Date().toISOString(),
            tags,
            votes: 0,
            answersCount: 0,
            answers: [],
            userVote: 0
          },
          ...state.questions
        ]
      })),
      addAnswer: (questionId, content) => set((state) => ({
        questions: state.questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answersCount: q.answersCount + 1,
              answers: [
                ...q.answers,
                {
                  id: Date.now().toString(),
                  content,
                  authorName: 'current_user',
                  createdAt: new Date().toISOString(),
                  votes: 0,
                  isAccepted: false,
                  userVote: 0
                }
              ]
            }
          }
          return q
        })
      })),
      voteQuestion: (questionId, value) => set((state) => ({
        questions: state.questions.map(q => {
          if (q.id === questionId) {
            const newValue = q.userVote === value ? 0 : value
            const diff = newValue - q.userVote
            return { ...q, votes: q.votes + diff, userVote: newValue as 1 | -1 | 0 }
          }
          return q
        })
      })),
      voteAnswer: (questionId, answerId, value) => set((state) => ({
        questions: state.questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: q.answers.map(a => {
                if (a.id === answerId) {
                  const newValue = a.userVote === value ? 0 : value
                  const diff = newValue - a.userVote
                  return { ...a, votes: a.votes + diff, userVote: newValue as 1 | -1 | 0 }
                }
                return a
              })
            }
          }
          return q
        })
      })),
      acceptAnswer: (questionId, answerId) => set((state) => ({
        questions: state.questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: q.answers.map(a => ({
                ...a,
                isAccepted: a.id === answerId ? !a.isAccepted : false
              }))
            }
          }
          return q
        })
      })),
    }),
    {
      name: 'forum-storage',
    }
  )
)
