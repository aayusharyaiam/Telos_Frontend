import { motion } from 'framer-motion'

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function PageHeader({ title, subtitle, actions, chips }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="min-w-0 flex-1">
        <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink-900 dark:text-inverse-on-surface">
            {title}
          </h1>
          {chips}
        </motion.div>
        {subtitle ? (
          <motion.p variants={staggerItem} className="mt-2 font-body-md text-body-md text-ink-600 dark:text-outline">
            {subtitle}
          </motion.p>
        ) : null}
      </div>
      {actions ? (
        <motion.div variants={staggerItem} className="flex flex-wrap gap-2 lg:shrink-0">
          {actions}
        </motion.div>
      ) : null}
    </motion.div>
  )
}
