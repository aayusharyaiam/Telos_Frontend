import { useEffect, useRef, useState, useCallback } from 'react'

export function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (!hasAnimated) setHasAnimated(true)
        } else if (!options.once) {
          setIsInView(false)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        ...options,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [options.once, options.threshold, options.rootMargin, hasAnimated])

  return [ref, isInView, hasAnimated]
}

export function useParallax(speed = 0.5) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const rate = rect.top * speed
      setOffset(rate)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return [ref, offset]
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return { position, isHovering }
}

export function useTilt(maxAngle = 15) {
  const ref = useRef(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)
    
    const rotateX = -deltaY * maxAngle
    const rotateY = deltaX * maxAngle
    
    setRotation({ x: rotateX, y: rotateY })
  }, [maxAngle])

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 })
  }, [])

  return [ref, rotation, handleMouseMove, handleMouseLeave]
}

export function useTypewriter(text, speed = 50, startDelay = 0) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)

    const startTimeout = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsComplete(true)
        }
      }, speed)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay])

  return { displayText, isComplete }
}

export function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let startTime = null
    let animationFrame = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(start + (end - start) * easeOut))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setIsComplete(true)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [end, duration, start])

  return { count, isComplete }
}

export function useIntersectionObserver(callback, options = {}) {
  const targetRef = useRef(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(callback)
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [callback, options.threshold, options.rootMargin])

  return targetRef
}

export function useStaggeredAnimation(itemCount, delay = 50) {
  const [visibleItems, setVisibleItems] = useState([])

  useEffect(() => {
    const timers = []
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i])
      }, i * delay)
      timers.push(timer)
    }

    return () => timers.forEach(clearTimeout)
  }, [itemCount, delay])

  return visibleItems
}