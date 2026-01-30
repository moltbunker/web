import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

const Card = ({ children, hover = true, className = '', ...props }: CardProps) => {
  // Filter out conflicting props
  const { onDrag, onDragEnd, onDragStart, ...motionProps } = props as any
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -2, borderColor: 'rgba(255,255,255,0.1)' } : {}}
      className={`bg-black border border-zinc-800 rounded-lg p-6 transition-all duration-300 ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

export default Card
