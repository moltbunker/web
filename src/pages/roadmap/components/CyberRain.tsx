import { useRef, useEffect } from 'react'

const CyberRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = '01アイウエオカキクケコ10サシスセソタチツテト01ナニヌネノハヒフヘホ10'
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100)
    const speeds: number[] = Array(columns).fill(0).map(() => 0.5 + Math.random() * 1.5)

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * fontSize

        const brightness = Math.max(0, 1 - (y / canvas.height) * 0.5)

        // Using red-500 (#ef4444) tones
        ctx.fillStyle = `rgba(239, 68, 68, ${brightness * 0.9})`
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`
        ctx.fillText(char, i * fontSize, y)

        if (drops[i] > 0) {
          ctx.fillStyle = `rgba(220, 38, 38, ${brightness * 0.3})`
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y - fontSize)
          ctx.fillStyle = `rgba(185, 28, 28, ${brightness * 0.15})`
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y - fontSize * 2)
        }

        drops[i] += speeds[i]

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
          speeds[i] = 0.5 + Math.random() * 1.5
        }
      }
    }

    const interval = setInterval(draw, 45)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
}

export default CyberRain
