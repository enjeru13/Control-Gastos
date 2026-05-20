import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
