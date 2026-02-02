import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Docs from '@/pages/Docs'
import Roadmap from '@/pages/roadmap'
import WhitepaperPage from '@/pages/Whitepaper'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:slug" element={<Docs />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/whitepaper" element={<WhitepaperPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
