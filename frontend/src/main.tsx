import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/responsive.css'
import { AppRoutes } from './routes/AppRoutes'

function Main() {
  return <AppRoutes />
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
