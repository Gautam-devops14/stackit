'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { login, signup } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex flex-1 items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to StackIt</h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Sign in to ask questions and share knowledge.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm placeholder-[var(--color-on-surface-variant)] focus:z-10 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm placeholder-[var(--color-on-surface-variant)] focus:z-10 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-[var(--color-error)]">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              formAction={login}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-[var(--color-primary)] py-2 px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-container)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
            >
              Log in
            </button>
            <button
              formAction={signup}
              className="group relative flex w-full justify-center rounded-md border border-[var(--color-outline-variant)] bg-transparent py-2 px-4 text-sm font-medium hover:bg-[var(--color-surface-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
