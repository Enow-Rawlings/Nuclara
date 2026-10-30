import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { StorefrontLayout } from './components/layout/StorefrontLayout'
import { PageSpinner } from './components/ui/PageSpinner'

// Lazy-loaded pages — code splitting per route
const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const OrderRequestPage = lazy(() => import('./pages/OrderRequestPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const ShippingPage = lazy(() => import('./pages/ShippingPage'))
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const CookiesPage = lazy(() => import('./pages/CookiesPage'))
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const UnavailablePage = lazy(() => import('./pages/UnavailablePage'))

export function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-request" element={<OrderRequestPage />} />
          <Route path="/order-confirmation/:reference" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/account/register" element={<RegisterPage />} />
          <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/account/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/unavailable" element={<UnavailablePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
