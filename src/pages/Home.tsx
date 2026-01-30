import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import HowItWorks from '@/components/sections/HowItWorks'
import CodeSnippet from '@/components/sections/CodeSnippet'
import Tokenomics from '@/components/sections/Tokenomics'
import Whitepaper from '@/components/sections/Whitepaper'
import SDK from '@/components/sections/SDK'

const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <CodeSnippet />
      <Tokenomics />
      <SDK />
      <Whitepaper />
    </div>
  )
}

export default Home
