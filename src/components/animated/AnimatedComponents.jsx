import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, forwardRef, useState } from 'react'

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  distance = 50, 
  duration = 0.5, 
  delay = 0,
  once = true,
  className = '',
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: `${distance}px` }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [distance, once])

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedSection({ 
  children, 
  className = '',
  stagger = 0.05,
  ...props 
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const FadeIn = forwardRef(({ 
  children, 
  direction = 'up', 
  distance = 30, 
  duration = 0.4,
  delay = 0,
  className = '',
  ...props 
}, ref) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
})

FadeIn.displayName = 'FadeIn'

export const ScaleIn = forwardRef(({ 
  children, 
  scale = 0.9, 
  duration = 0.4,
  delay = 0,
  className = '',
  ...props 
}, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, scale }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
))

ScaleIn.displayName = 'ScaleIn'

export const SlideIn = forwardRef(({ 
  children, 
  direction = 'left',
  distance = 100,
  duration = 0.5,
  delay = 0,
  className = '',
  ...props 
}, ref) => {
  const offsets = {
    left: { x: -distance },
    right: { x: distance },
    up: { y: -distance },
    down: { y: distance },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
})

SlideIn.displayName = 'SlideIn'

export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 0.05,
  ...props 
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ 
  children, 
  className = '',
  y = 20,
  ...props 
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' }
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxSection({ 
  children, 
  speed = 0.5,
  className = '',
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{ y: 0 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedCard = forwardRef(({ 
  children, 
  className = '',
  hoverEffect = true,
  tiltEffect = false,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      ref={ref}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        y: hoverEffect ? (isHovered ? -4 : 0) : 0,
        scale: hoverEffect ? (isHovered ? 1.01 : 1) : 1,
      }}
      transition={{ duration: 0.2 }}
      className={className}
      style={{ 
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCard.displayName = 'AnimatedCard'

export function AnimatedList({ 
  items, 
  renderItem,
  className = '',
  staggerDelay = 0.05,
  ...props 
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      {...props}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  )
}

export const AnimatedButton = forwardRef(({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  glowEffect = false,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyles = 'relative overflow-hidden rounded-xl font-semibold transition-all duration-200'
  
  const variants = {
    primary: 'bg-primary-container text-white hover:bg-primary',
    secondary: 'bg-secondary text-white',
    ghost: 'bg-transparent text-ink-700 dark:text-inverse-on-surface hover:bg-sand-100 dark:hover:bg-dark-bg',
    glass: 'glass text-ink-900 dark:text-inverse-on-surface',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <motion.button
      ref={ref}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={glowEffect ? { 
        boxShadow: isHovered ? '0 0 20px rgba(79, 70, 229, 0.4)' : 'none' 
      } : {}}
      {...props}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-white/20"
      />
      {children}
    </motion.button>
  )
})

AnimatedButton.displayName = 'AnimatedButton'

export function AnimatedNumber({ 
  value, 
  className = '',
  duration = 2,
  ...props 
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = displayValue
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(startValue + (value - startValue) * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className} {...props}>
      {displayValue}
    </span>
  )
}

export function AnimatedProgress({ 
  value = 0, 
  className = '',
  showValue = false,
  animated = true,
  ...props 
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={animated ? { width: 0 } : { width: `${value}%` }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
        {...props}
      />
      {showValue && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-semibold"
        >
          {value}%
        </motion.span>
      )}
    </div>
  )
}

export function AnimatedModal({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  ...props 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export const AnimatedBadge = forwardRef(({ 
  children, 
  className = '',
  pulse = false,
  ...props 
}, ref) => (
  <motion.span
    ref={ref}
    className={`relative ${className}`}
    {...props}
  >
    {children}
    {pulse && (
      <motion.span
        className="absolute inset-0 rounded-full bg-current"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </motion.span>
))

AnimatedBadge.displayName = 'AnimatedBadge'

export function AnimatedSkeleton({ 
  className = '',
  variant = 'rect',
  ...props 
}) {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <motion.div
      animate={{ 
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
      className={`skeleton ${variants[variant]} ${className}`}
      style={{
        background: `linear-gradient(90deg, 
          #ebe6dc 0%, 
          #f4f1ea 50%, 
          #ebe6dc 100%)`,
        backgroundSize: '200% 100%',
      }}
      {...props}
    />
  )
}