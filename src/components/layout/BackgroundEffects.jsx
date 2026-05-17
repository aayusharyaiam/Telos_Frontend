import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function BackgroundEffects() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [-20, 20])
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [-20, 20])

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          x: backgroundX,
          y: backgroundY,
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          x: useTransform(mouseX, [0, window.innerWidth], [20, -20]),
          y: useTransform(mouseY, [0, window.innerHeight], [20, -20]),
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      <FloatingParticles />
      
      <GridPattern />
    </div>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: particle.id % 3 === 0 
              ? 'rgba(79, 70, 229, 0.4)' 
              : particle.id % 3 === 1 
              ? 'rgba(16, 185, 129, 0.3)' 
              : 'rgba(245, 158, 11, 0.3)',
            boxShadow: particle.id % 3 === 0 
              ? '0 0 10px rgba(79, 70, 229, 0.3)' 
              : particle.id % 3 === 1 
              ? '0 0 10px rgba(16, 185, 129, 0.3)' 
              : '0 0 10px rgba(245, 158, 11, 0.3)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(particle.id) * 30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

function GridPattern() {
  return (
    <svg 
      className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern 
          id="grid" 
          width="60" 
          height="60" 
          patternUnits="userSpaceOnUse"
        >
          <path 
            d="M 60 0 L 0 0 0 60" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5"
            className="text-ink-900 dark:text-white"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

export function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.015] z-[1000]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

export function Vignette() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{
        background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 100%)',
      }}
    />
  )
}