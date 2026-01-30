import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  className?: string
}

const CodeBlock = ({ code, showCopy = true, className = '' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Clean code block */}
      <div className="flex items-center bg-black rounded-lg border border-zinc-800 px-4 py-3">
        <pre className="flex-1 text-sm font-mono overflow-x-auto">
          <code className="text-zinc-300">{code}</code>
        </pre>
        {showCopy && (
          <motion.button
            onClick={handleCopy}
            className="ml-3 p-1.5 text-zinc-500 hover:text-white rounded transition-colors flex-shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default CodeBlock
