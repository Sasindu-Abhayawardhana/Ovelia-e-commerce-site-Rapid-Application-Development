import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout }       from '@/components/layout/Layout'
import { AdminLayout }  from '@/components/layout/AdminLayout'
import { AuthGuard }    from '@/components/auth/AuthGuard'
import { AdminGuard }   from '@/components/auth/AdminGuard'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { Skeleton }     from '@/components/ui/Skeleton'

// Lazy load all pages for code-splitting
const HomePage              = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const CatalogPage           = lazy(() => import('@/pages/CatalogPage').then(m => ({ default: m.CatalogPage })))
const ProductDetailPage     = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })))
const CartPage              = lazy(() => import('@/pages/CartPage').then(m => ({ default: m.CartPage })))
const CheckoutPage          = lazy(() => import('@/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })))
const WishlistPage          = lazy(() => import('@/pages/WishlistPage').then(m => ({ default: m.WishlistPage })))
const LoginPage             = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage             = lazy(() => import('@/pages/auth/SignupPage').then(m => ({ default: m.SignupPage })))
const ForgotPasswordPage    = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const AccountPage           = lazy(() => import('@/pages/account/AccountPage').then(m => ({ default: m.AccountPage })))
const OrderHistoryPage      = lazy(() => import('@/pages/account/OrderHistoryPage').then(m => ({ default: m.OrderHistoryPage })))
const OrderDetailPage       = lazy(() => import('@/pages/account/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))
const ProfilePage           = lazy(() => import('@/pages/account/ProfilePage').then(m => ({ default: m.ProfilePage })))
const NotFoundPage          = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

// Admin pages
const AdminDashboard        = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminProductsPage     = lazy(() => import('@/pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })))
const AdminProductFormPage  = lazy(() => import('@/pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })))
const AdminOrdersPage       = lazy(() => import('@/pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })))
const AdminOrderDetailPage  = lazy(() => import('@/pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })))
const AdminCustomersPage    = lazy(() => import('@/pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })))
const AdminPromoCodesPage   = lazy(() => import('@/pages/admin/AdminPromoCodesPage').then(m => ({ default: m.AdminPromoCodesPage })))
const AdminReviewsPage      = lazy(() => import('@/pages/admin/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })))
const AdminSettingsPage     = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })))

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="space-y-3 w-64">
      <Skeleton className="h-6 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
)

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(s => s.initialize)
  const setUserId  = useCartStore(s => s.setUserId)
  const user       = useAuthStore(s => s.user)
  const syncCart   = useCartStore(s => s.syncFromFirestore)
  const setWishUID = useWishlistStore(s => s.setUserId)
  const syncWish   = useWishlistStore(s => s.syncFromFirestore)

  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  useEffect(() => {
    if (user) {
      setUserId(user.uid)
      setWishUID(user.uid)
      syncCart(user.uid)
      syncWish(user.uid)
    } else {
      setUserId(null)
      setWishUID(null)
    }
  }, [user, user?.uid, setUserId, setWishUID, syncCart, syncWish])

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2C2C2C',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#C17F5A', secondary: '#fff' } },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/"              element={<HomePage />} />
              <Route path="/shop"          element={<CatalogPage />} />
              <Route path="/shop/:slug"    element={<ProductDetailPage />} />
              <Route path="/cart"          element={<CartPage />} />
              <Route path="/wishlist"      element={<WishlistPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/signup"        element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

              {/* Protected customer routes */}
              <Route path="/checkout" element={
                <AuthGuard><CheckoutPage /></AuthGuard>
              } />
              <Route path="/account" element={
                <AuthGuard><AccountPage /></AuthGuard>
              }>
                <Route path="orders"        element={<OrderHistoryPage />} />
                <Route path="orders/:id"    element={<OrderDetailPage />} />
                <Route path="profile"       element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={
              <AdminGuard><AdminLayout /></AdminGuard>
            }>
              <Route index                              element={<AdminDashboard />} />
              <Route path="products"                   element={<AdminProductsPage />} />
              <Route path="products/:id"               element={<AdminProductFormPage />} />
              <Route path="orders"                     element={<AdminOrdersPage />} />
              <Route path="orders/:id"                 element={<AdminOrderDetailPage />} />
              <Route path="customers"                  element={<AdminCustomersPage />} />
              <Route path="promo-codes"               element={<AdminPromoCodesPage />} />
              <Route path="reviews"                   element={<AdminReviewsPage />} />
              <Route path="settings"                  element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthInitializer>
    </BrowserRouter>
  )
}
