import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import HowItWorks from '@/components/sections/HowItWorks'
import CodeSnippet from '@/components/sections/CodeSnippet'
import Tokenomics from '@/components/sections/Tokenomics'
import Whitepaper from '@/components/sections/Whitepaper'
import SDK from '@/components/sections/SDK'
import { useSEO } from '@/hooks/useSEO'

const SITE_URL = 'https://moltbunker.com'

const Home = () => {
  useSEO({
    title: undefined,
    description:
      'Permissionless, high-availability, unstoppable bunker for AI Bots. Encrypted P2P network for containerized compute with hardware-enforced confidentiality.',
    canonical: SITE_URL,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'MoltBunker',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/moltbot_head.png`,
          },
          sameAs: [
            'https://x.com/moltbunker',
            'https://github.com/moltbunker',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: 'MoltBunker',
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/#webpage`,
          url: SITE_URL,
          name: 'MoltBunker - Runtime Environment for AI Bots',
          description:
            'Permissionless, high-availability, unstoppable bunker for AI Bots. Encrypted P2P network for containerized compute with hardware-enforced confidentiality.',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${SITE_URL}/#organization` },
        },
      ],
    },
  })

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
