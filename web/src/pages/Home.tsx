import BrowseLibrary from './home/BrowseLibrary'
import Features from './home/Features'
import GameRows from './home/GameRows'
import Hero from './home/Hero'
import KeepInTouch from './home/KeepInTouch'
import Testimonials from './home/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <BrowseLibrary />
      <GameRows />
      <KeepInTouch />
    </>
  )
}
