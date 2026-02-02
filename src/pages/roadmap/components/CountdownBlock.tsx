import { motion } from 'framer-motion'
import GlitchDigit from './GlitchDigit'

interface CountdownBlockProps {
  value: number
  label: string
  prevValue: number
}

const CountdownBlock = ({ value, label, prevValue }: CountdownBlockProps) => {
  const digits = String(value).padStart(2, '0').split('')
  const prevDigits = String(prevValue).padStart(2, '0').split('')
  const isChanging = value !== prevValue

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {/* Outer glow - using red-500 */}
        <div
          className="absolute -inset-4 rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
            filter: 'blur(15px)'
          }}
        />

        {/* Card */}
        <div className="relative bg-black/80 border border-red-500/30 rounded-xl backdrop-blur-md overflow-hidden w-[72px] h-[80px] sm:w-[88px] sm:h-[96px] md:w-[120px] md:h-[128px] flex items-center justify-center">
          {/* Scan line */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-red-500/10 to-transparent pointer-events-none"
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(239,68,68,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(239,68,68,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '4px 4px'
            }}
          />

          {/* Digits */}
          <div
            className="relative text-4xl sm:text-5xl md:text-7xl font-black text-red-500"
            style={{
              fontFamily: 'var(--font-mono)',
              textShadow: '0 0 10px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.3)'
            }}
          >
            <GlitchDigit digit={digits[0]} isChanging={isChanging && digits[0] !== prevDigits[0]} />
            <GlitchDigit digit={digits[1]} isChanging={isChanging && digits[1] !== prevDigits[1]} />
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500/60" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500/60" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500/60" />
        </div>
      </div>

      {/* Label */}
      <span className="mt-4 text-xs sm:text-sm text-red-400/70 uppercase tracking-[0.25em] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
    </div>
  )
}

export default CountdownBlock
