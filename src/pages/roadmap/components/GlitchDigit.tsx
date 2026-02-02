import { useState, useEffect } from 'react'

interface GlitchDigitProps {
  digit: string
  isChanging: boolean
}

const GlitchDigit = ({ digit, isChanging }: GlitchDigitProps) => {
  const [display, setDisplay] = useState(digit)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isChanging) {
      const glitchChars = '0123456789#$%&@!?*'
      let frame = 0
      const maxFrames = 12

      const interval = setInterval(() => {
        if (frame < maxFrames - 2) {
          setDisplay(glitchChars[Math.floor(Math.random() * glitchChars.length)])
          setGlitchOffset({
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 2
          })
        } else {
          setDisplay(digit)
          setGlitchOffset({ x: 0, y: 0 })
        }
        frame++
        if (frame >= maxFrames) clearInterval(interval)
      }, 35)

      return () => clearInterval(interval)
    } else {
      setDisplay(digit)
    }
  }, [digit, isChanging])

  return (
    <span
      className="relative inline-block w-[0.65em] text-center"
      style={{
        transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
        transition: 'transform 0.05s'
      }}
    >
      {isChanging && (
        <>
          <span className="absolute inset-0 text-red-400 opacity-50 flex items-center justify-center" style={{ transform: 'translateX(-2px)' }}>
            {display}
          </span>
          <span className="absolute inset-0 text-red-600 opacity-50 flex items-center justify-center" style={{ transform: 'translateX(2px)' }}>
            {display}
          </span>
        </>
      )}
      <span className="relative">{display}</span>
    </span>
  )
}

export default GlitchDigit
