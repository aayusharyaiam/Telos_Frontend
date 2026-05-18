import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

const DEMO_ACCOUNTS = ['employee@telos.demo', 'manager@telos.demo', 'admin@telos.demo']

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    
    const emailLower = email.toLowerCase().trim()
    
    if (DEMO_ACCOUNTS.includes(emailLower)) {
      toast.error('This is a demo account. Please provide a real email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLower)) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, emailLower)
      toast.success(`Password reset link sent to ${emailLower}. Check your inbox.`)
      setEmail('')
      onClose()
    } catch (error) {
      console.error('Password reset error:', error)
      if (error.code === 'auth/user-not-found') {
        toast.error('This email is not registered in our system.')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.')
      } else {
        toast.error('Failed to send reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20 mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-headline-lg-mobile text-headline-lg text-ink-900 dark:text-inverse-on-surface">
                  Reset Password
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-sand-100 dark:hover:bg-dark-bg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-ink-500 dark:text-outline" />
                </button>
              </div>

              <p className="font-body-md text-body-md text-ink-600 dark:text-outline mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block font-label-bold text-label-bold text-ink-600 dark:text-outline mb-2" htmlFor="reset-email">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full px-4 py-3 bg-white dark:bg-dark-bg border border-sand-200 dark:border-outline/30 rounded-xl focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface placeholder:text-ink-500 dark:placeholder:text-outline transition-all"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface transition hover:bg-sand-50 dark:hover:bg-dark-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary-container px-4 py-3 font-label-bold text-label-bold text-white shadow-sm transition hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}