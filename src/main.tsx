import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@coinbase/onchainkit/styles.css'
import './index.css'
import OnchainProvider from './providers/OnchainProvider'
import ApiProvider from './providers/ApiProvider'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnchainProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </OnchainProvider>
  </StrictMode>,
)
