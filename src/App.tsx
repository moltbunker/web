import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Docs from '@/pages/Docs'
import WhitepaperPage from '@/pages/Whitepaper'
import NotFound from '@/pages/NotFound'

const Blog = lazy(() => import('@/pages/Blog'))
const Roadmap = lazy(() => import('@/pages/roadmap'))
const AppLayout = lazy(() => import('@/components/app/AppLayout'))
const Overview = lazy(() => import('@/pages/app/Overview'))
const Deploy = lazy(() => import('@/pages/app/Deploy'))
const Containers = lazy(() => import('@/pages/app/Containers'))
const ContainerDetail = lazy(() => import('@/pages/app/ContainerDetail'))
const Nodes = lazy(() => import('@/pages/app/Nodes'))
const Billing = lazy(() => import('@/pages/app/Billing'))
const Provider = lazy(() => import('@/pages/app/Provider'))
const Settings = lazy(() => import('@/pages/app/Settings'))
const Molts = lazy(() => import('@/pages/app/Molts'))
const MoltDetail = lazy(() => import('@/pages/app/MoltDetail'))
const Crawl = lazy(() => import('@/pages/app/Crawl'))
const CrawlDetail = lazy(() => import('@/pages/app/CrawlDetail'))
const Agents = lazy(() => import('@/pages/app/Agents'))
const AgentDetail = lazy(() => import('@/pages/app/AgentDetail'))
const Registry = lazy(() => import('@/pages/app/Registry'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const isApp = location.pathname.startsWith('/app')

  return (
    <div className="min-h-screen flex flex-col">
      {!isApp && <Header />}
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/*" element={<Docs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/*" element={<Blog />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/whitepaper" element={<WhitepaperPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Overview />} />
              <Route path="deploy" element={<Deploy />} />
              <Route path="containers" element={<Containers />} />
              <Route path="containers/:id" element={<ContainerDetail />} />
              <Route path="molts" element={<Molts />} />
              <Route path="molts/:id" element={<MoltDetail />} />
              <Route path="crawl" element={<Crawl />} />
              <Route path="crawl/:id" element={<CrawlDetail />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/:id" element={<AgentDetail />} />
              <Route path="registry" element={<Registry />} />
              <Route path="nodes" element={<Nodes />} />
              <Route path="billing" element={<Billing />} />
              <Route path="provider" element={<Provider />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isApp && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
