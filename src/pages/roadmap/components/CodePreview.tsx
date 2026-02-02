import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

interface CodePreviewProps {
  code: string
  filename?: string
  typeAnimation?: boolean
}

interface TokenSpan {
  text: string
  className: string
}

const CodePreview = ({ code, filename = 'example.py', typeAnimation = false }: CodePreviewProps) => {
  const [copied, setCopied] = useState(false)
  const [displayedLength, setDisplayedLength] = useState(typeAnimation ? 0 : code.length)

  useEffect(() => {
    if (!typeAnimation) return

    let index = 0
    const interval = setInterval(() => {
      if (index <= code.length) {
        setDisplayedLength(index)
        index++
      } else {
        clearInterval(interval)
      }
    }, 12)

    return () => clearInterval(interval)
  }, [code, typeAnimation])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tokenizeLine = (line: string): TokenSpan[] => {
    const tokens: TokenSpan[] = []
    let remaining = line

    const patterns: Array<{ regex: RegExp; className: string }> = [
      { regex: /^(#.*)/, className: 'text-zinc-500' },
      { regex: /^(""".*?"""|'''.*?'''|".*?"|'.*?')/, className: 'text-red-400' },
      { regex: /^(from|import|as|def|class|return|if|else|elif|for|while|try|except|with|True|False|None|and|or|not|in|is)\b/, className: 'text-pink-400' },
      { regex: /^(self)\b/, className: 'text-pink-300' },
      { regex: /^(\d+\.?\d*)/, className: 'text-amber-400' },
      { regex: /^(\w+)(?=\()/, className: 'text-red-300' },
      { regex: /^([a-zA-Z_]\w*)/, className: 'text-zinc-300' },
      { regex: /^(\s+)/, className: '' },
      { regex: /^([^\s\w]+)/, className: 'text-zinc-400' },
    ]

    while (remaining.length > 0) {
      let matched = false
      for (const { regex, className } of patterns) {
        const match = remaining.match(regex)
        if (match) {
          tokens.push({ text: match[1], className })
          remaining = remaining.slice(match[1].length)
          matched = true
          break
        }
      }
      if (!matched) {
        tokens.push({ text: remaining[0], className: 'text-zinc-300' })
        remaining = remaining.slice(1)
      }
    }

    return tokens
  }

  const displayedCode = code.slice(0, displayedLength)
  const lines = displayedCode.split('\n')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-zinc-500 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
            {filename}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors rounded hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
        <code className="text-zinc-300">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-zinc-600 select-none w-8 text-right pr-4">
                {i + 1}
              </span>
              <span>
                {tokenizeLine(line).map((token, j) => (
                  <span key={j} className={token.className}>{token.text}</span>
                ))}
              </span>
            </div>
          ))}
          {typeAnimation && displayedLength < code.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-red-400 ml-0.5 align-middle"
            />
          )}
        </code>
      </pre>
    </motion.div>
  )
}

export default CodePreview
