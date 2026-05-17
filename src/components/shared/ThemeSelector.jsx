import { motion } from 'framer-motion'
import { useTheme, THEMES } from '../../context/ThemeContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
}

export default function ThemeSelector({ className = '' }) {
  const { theme, changeTheme, animationsEnabled, toggleAnimations, reducedMotion } = useTheme()

  const themeEntries = Object.entries(THEMES)

  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-inverse-on-surface mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themeEntries.map(([key, data]) => (
            <motion.button
              key={key}
              onClick={() => changeTheme(key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden
                ${theme === key 
                  ? 'border-primary dark:border-primary-fixed ring-2 ring-primary/20 dark:ring-primary-fixed/20' 
                  : 'border-transparent hover:border-ink-200 dark:hover:border-outline/50'
                }
              `}
            >
              <div 
                className="absolute inset-0 opacity-30"
                style={{ background: `linear-gradient(135deg, ${data.colors.surface} 0%, ${data.colors.surfaceVariant} 100%)` }}
              />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-full shadow-inner"
                  style={{ 
                    background: `conic-gradient(${data.colors.primary}, ${data.colors.secondary}, ${data.colors.accent}, ${data.colors.primary})`,
                  }}
                />
                <span className="text-xs font-semibold text-ink-700 dark:text-inverse-on-surface">
                  {data.name}
                </span>
              </div>
              
              {theme === key && (
                <motion.div
                  layoutId="selectedTheme"
                  className="absolute inset-0 border-2 border-primary dark:border-primary-fixed rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-inverse-on-surface">
          Animations
        </h3>
        
        <motion.label 
          className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-dark-surface/50 border border-sand-200 dark:border-outline/20 cursor-pointer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-inverse-on-surface">Enable Animations</p>
              <p className="text-xs text-ink-500 dark:text-outline">Smooth transitions and micro-interactions</p>
            </div>
          </div>
          <motion.div
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              animationsEnabled ? 'bg-primary' : 'bg-ink-300 dark:bg-ink-600'
            }`}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ x: animationsEnabled ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.div>
          <input 
            type="checkbox" 
            checked={animationsEnabled} 
            onChange={toggleAnimations}
            className="sr-only"
          />
        </motion.label>

        {animationsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                  {reducedMotion ? 'Reduced Motion Enabled' : 'System Prefers Reduced Motion'}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {reducedMotion 
                    ? 'Animations are being reduced to improve accessibility.'
                    : 'Consider enabling reduced motion in your system settings for a more accessible experience.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}