import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Docs from '@/pages/Docs'
import Roadmap from '@/pages/roadmap'
import Testnet from '@/pages/Testnet'
import WhitepaperPage from '@/pages/Whitepaper'
import NotFound from '@/pages/NotFound'

const AppLayout = lazy(() => import('@/components/app/AppLayout'))

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
            <Route path="/docs/:slug" element={<Docs />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/testnet" element={<Testnet />} />
            <Route path="/whitepaper" element={<WhitepaperPage />} />
            <Route path="/app" element={<AppLayout />} />
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
