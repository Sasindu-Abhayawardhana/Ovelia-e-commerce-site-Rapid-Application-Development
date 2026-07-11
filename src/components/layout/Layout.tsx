import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header }    from './Header'
import { Footer }    from './Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ChatWidget } from '@/components/ui/ChatWidget'
import { useScrollTop } from '@/hooks/useScrollTop'

export function Layout() {
  useScrollTop()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  )
}
