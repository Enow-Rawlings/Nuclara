import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { PageSpinner } from './components/ui/PageSpinner'
import { RequireAdminAuth } from './components/layout/RequireAdminAuth'

// Auth
const LoginPage = lazy(() => import('./pages/LoginPage'))

// Dashboard
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

// Products
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'))
const ProductNewPage = lazy(() => import('./pages/products/ProductNewPage'))
const ProductEditPage = lazy(() => import('./pages/products/ProductEditPage'))

// Categories
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))

// Inventory
const InventoryPage = lazy(() => import('./pages/InventoryPage'))

// Orders
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/orders/OrderDetailPage'))

// Customers
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'))
const CustomerDetailPage = lazy(() => import('./pages/customers/CustomerDetailPage'))

// Content & SEO
const ContentPage = lazy(() => import('./pages/ContentPage'))
const SeoPage = lazy(() => import('./pages/SeoPage'))

// Support
const LiveChatPage = lazy(() => import('./pages/LiveChatPage'))

// Analytics
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// Settings
const StoreSettingsPage = lazy(() => import('./pages/settings/StoreSettingsPage'))
const ShippingSettingsPage = lazy(() => import('./pages/settings/ShippingSettingsPage'))
const UsersSettingsPage = lazy(() => import('./pages/settings/UsersSettingsPage'))
const IntegrationsPage = lazy(() => import('./pages/settings/IntegrationsPage'))

// Blog
const AdminBlogPage = lazy(() => import('./pages/blog/BlogPage'))
const BlogEditPage = lazy(() => import('./pages/blog/BlogEditPage'))

// Audit
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))

// Profile
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

export function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public — login only */}
        <Route path="/login" element={<LoginPage />} />

        {/* All admin routes require authentication */}
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Products */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductNewPage />} />
            <Route path="/products/:id" element={<ProductEditPage />} />

            {/* Categories */}
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryPage />} />

            {/* Orders */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />

            {/* Content & SEO */}
            <Route path="/content" element={<ContentPage />} />
            <Route path="/seo" element={<SeoPage />} />

            {/* Blog */}
            <Route path="/blog" element={<AdminBlogPage />} />
            <Route path="/blog/new" element={<BlogEditPage />} />
            <Route path="/blog/:id/edit" element={<BlogEditPage />} />

            {/* Support */}
            <Route path="/live-chat" element={<LiveChatPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Settings */}
            <Route path="/settings/store" element={<StoreSettingsPage />} />
            <Route path="/settings/shipping" element={<ShippingSettingsPage />} />
            <Route path="/settings/users" element={<UsersSettingsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />

            {/* Audit & Profile */}
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Catch-all inside admin */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
