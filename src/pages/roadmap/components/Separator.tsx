import { motion } from 'framer-motion'

const Separator = () => (
  <div className="flex flex-col justify-center items-center gap-3 h-[80px] sm:h-[96px] md:h-[128px]">
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="w-2 h-2 rounded-full bg-red-500"
      style={{ boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444' }}
    />
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      className="w-2 h-2 rounded-full bg-red-500"
      style={{ boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444' }}
    />
  </div>
)

export default Separator
