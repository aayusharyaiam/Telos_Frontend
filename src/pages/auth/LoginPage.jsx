import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import useAuth from '../../hooks/useAuth'

export default function LoginPage() {
  const { appUser, signInUser } = useAuth()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (appUser) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values) => {
    setError('')
    try {
      await signInUser(values.email, values.password)
    } catch (err) {
      setError('Login failed. Check your credentials or contact Admin.')
    }
  }

  return (
    <div className="min-h-screen w-full px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.35em] text-ink-500">Telos</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink-900">
            Align every goal to purpose.
          </h1>
          <p className="mt-4 text-sm text-ink-600">
            Sign in to manage goal sheets, approvals, check-ins, and analytics
            in one connected workspace.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Employee</p>
              <p className="mt-2 text-sm font-semibold text-ink-800">employee@telos.demo</p>
              <p className="text-xs text-ink-500">Password: Demo@1234</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Manager/Admin</p>
              <p className="mt-2 text-sm font-semibold text-ink-800">manager@telos.demo</p>
              <p className="text-xs text-ink-500">Password: Demo@1234</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-ink-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white">
              <LockClosedIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Sign in</h2>
              <p className="text-xs text-ink-500">Use your Telos credentials.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Email
              <input
                type="email"
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="you@company.com"
                {...register('email', { required: true })}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Password
              <input
                type="password"
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="********"
                {...register('password', { required: true })}
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
