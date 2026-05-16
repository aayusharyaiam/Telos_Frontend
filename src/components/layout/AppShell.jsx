import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen text-on-surface dark:text-inverse-on-surface">
      <div className="flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col md:ml-[256px]">
          <Navbar />
          <motion.main
            className="flex-1 px-[16px] md:px-6 py-6 md:py-8 max-w-[1440px] mx-auto w-full space-y-6 md:space-y-8"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
