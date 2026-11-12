import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'
import Play from './pages/Play'
import Search from './pages/Search'
import Browse from './pages/Browse'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="platform/:slug" element={<Browse kind="platform" />} />
          <Route path="genre/:slug" element={<Browse kind="genre" />} />
          <Route path="play/:id" element={<Play />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
