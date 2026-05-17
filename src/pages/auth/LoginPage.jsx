import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { QuestionMarkCircleIcon, UserIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import useAuth from '../../hooks/useAuth'

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const iconMap = {
  Employee: UserIcon,
  Manager: UsersIcon,
  Admin: ShieldCheckIcon,
}

const credentials = [
  { role: 'Employee', email: 'employee@telos.demo', desc: 'View goals & tasks' },
  { role: 'Manager', email: 'manager@telos.demo', desc: 'Team oversight' },
  { role: 'Admin', email: 'admin@telos.demo', desc: 'Full strategic view' },
]

export default function LoginPage() {
  const { appUser, signInUser } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [shake, setShake] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm({ defaultValues: { email: '', password: '' } })

  if (appUser) return <Navigate to="/" replace />

  const onSubmit = async (values) => {
    setIsLoggingIn(true)
    try {
      await signInUser(values.email, values.password)
    } catch {
      toast.error('Login failed. Check your credentials or contact Admin.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setIsLoggingIn(false)
    }
  }

  const fillDemo = (email) => {
    setValue('email', email)
    setValue('password', 'Demo@1234')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background dark:bg-dark-bg">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 dark:bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-secondary/15 dark:bg-secondary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 z-0" />

      {/* Left Side — Branding & Demo Cards (visible on all screens) */}
      <div className="flex flex-col justify-center flex-none lg:flex-1 px-6 pt-8 pb-4 lg:px-12 xl:px-24 lg:py-0 z-10 relative">
        <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-2xl mx-auto lg:mx-0">
          <motion.div variants={fadeSlide} className="flex items-center gap-3 mb-6 lg:mb-12">
            <img src="/logo-mark.svg" alt="Telos" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
            <span className="font-display text-headline-sm lg:text-headline-md text-ink-900 dark:text-inverse-on-surface tracking-tight">
              Telos AtomQuest
            </span>
          </motion.div>

          <motion.h1
            variants={fadeSlide}
            className="font-display text-headline-lg-mobile lg:text-display text-ink-900 dark:text-inverse-on-surface mb-3 lg:mb-6"
          >
            Align every goal to purpose.
          </motion.h1>

          <motion.p
            variants={fadeSlide}
            className="font-body-md lg:font-body-lg text-body-md lg:text-body-lg text-ink-600 dark:text-outline mb-6 lg:mb-16 leading-relaxed max-w-xl"
          >
            The executive-tech platform designed to synchronize team focus, track critical performance metrics, and drive
            strategic resources toward measurable outcomes.
          </motion.p>

          <motion.div variants={fadeSlide}>
            <h3 className="font-headline-sm lg:font-display text-headline-sm lg:text-display text-ink-900 dark:text-inverse-on-surface mb-1 lg:mb-2">
              Quick Access Demos
            </h3>
            <p className="font-caption text-caption text-ink-500 dark:text-outline mb-3 lg:mb-4">
              Click any account to fill the login form
            </p>
            {/* Horizontal scroll on mobile, grid on larger screens */}
            <div className="flex gap-3 overflow-x-auto pb-3 lg:pb-0 lg:grid lg:grid-cols-3 lg:gap-4 -mx-2 px-2 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none scrollbar-hide">
              {credentials.map((c) => {
                const Icon = iconMap[c.role]
                return (
                  <motion.button
                    key={c.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => fillDemo(c.email)}
                    className="min-w-[160px] sm:min-w-[180px] lg:min-w-0 snap-start text-left bg-white dark:bg-dark-surface backdrop-blur-md rounded-2xl p-4 sm:p-5 lg:p-5 ring-1 ring-primary/30 dark:ring-primary/40 hover:ring-primary/60 dark:hover:ring-primary/60 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-200 flex flex-col items-start gap-2.5 lg:gap-3 shrink-0"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-fixed shrink-0">
                      <Icon className="h-5 w-5 sm:h-5 sm:w-5 lg:h-[18px] lg:w-[18px]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[15px] sm:text-[16px] lg:text-[16px] font-semibold leading-tight text-ink-900 dark:text-inverse-on-surface">
                        {c.role}
                      </div>
                      <div className="font-caption text-xs sm:text-sm text-ink-600 dark:text-outline mt-1">{c.desc}</div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-6 lg:px-12 lg:py-0 z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <motion.div
            animate={shake ? { x: [0, -4, 4, -4, 0] } : { x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-dark-surface/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg ring-1 ring-glass-border dark:ring-outline/20"
          >
            <div className="mb-6 sm:mb-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container dark:bg-dark-bg mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ring-4 ring-white/50 dark:ring-dark-surface">
                <span className="text-primary dark:text-primary-fixed-dim">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
              </div>
              <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink-900 dark:text-inverse-on-surface mb-2">
                Welcome Back
              </h2>
              <p className="font-body-md text-body-md text-ink-600 dark:text-outline">
                Please enter your details to sign in.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block font-label-bold text-label-bold text-ink-600 dark:text-outline mb-2" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-ink-500 dark:text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="block w-full pl-10 sm:pl-11 pr-4 py-3 bg-white/50 dark:bg-dark-bg/50 border border-sand-200 dark:border-outline/30 rounded-xl focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface placeholder:text-ink-500 dark:placeholder:text-outline transition-all"
                    {...register('email', { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-bold text-label-bold text-ink-600 dark:text-outline mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-ink-500 dark:text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="block w-full pl-10 sm:pl-11 pr-4 py-3 bg-white/50 dark:bg-dark-bg/50 border border-sand-200 dark:border-outline/30 rounded-xl focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface placeholder:text-ink-500 dark:placeholder:text-outline transition-all"
                    {...register('password', { required: true })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-container focus:ring-primary-container border-sand-200 dark:border-outline/30 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block font-caption text-caption text-ink-600 dark:text-outline">
                    Remember me
                  </label>
                </div>
                <div className="font-caption text-caption">
                  <a href="#" className="font-bold text-primary dark:text-primary-fixed-dim hover:text-primary-fixed-dim transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm font-display text-[16px] font-semibold text-on-primary bg-primary-container hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container transition-all duration-200 disabled:opacity-60 mt-4 sm:mt-6"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in...
                  </span>
                ) : 'Sign in to Dashboard'}
              </motion.button>
            </form>

            <div className="mt-6 sm:mt-8 text-center space-y-2">
              <p className="font-caption text-caption text-ink-500 dark:text-outline">
                Secure connection via Telos Identity
              </p>
              <Link
                to="/help"
                className="inline-flex items-center gap-1 font-caption text-caption text-primary dark:text-primary-fixed-dim hover:underline"
              >
                <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
                Judge's Guide — feature overview & demo accounts
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
