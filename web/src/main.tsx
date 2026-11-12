import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'
import { GameDetails, GamePlayer } from './pages/game/GamePages'
import Search from './pages/Search'
import Browse from './pages/Browse'
import Library from './pages/Library'
import NewCollection from './pages/NewCollection'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="platform/:slug" element={<Browse kind="platform" />} />
          <Route path="genre/:slug" element={<Browse kind="genre" />} />
          <Route path="library" element={<Library />} />
          <Route path="library/new" element={<NewCollection />} />
          <Route path="games/:id" element={<GameDetails />} />
          <Route path="games/:id/play" element={<GamePlayer />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
