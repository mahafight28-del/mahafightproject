import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { RequireAuth } from '../components/RequireAuth'
import AppLayout from '../components/AppLayout'
import Loading from '../components/Loading'

const Login = lazy(() => import('../pages/Login/Login'))
const ForgotPassword = lazy(() => import('../pages/Login/ForgotPassword'))
const Registration = lazy(() => import('../pages/Dealers/Registration'))
const FranchiseRegistration = lazy(() => import('../pages/Franchises/Registration'))
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'))

// Public Pages
const ProductCatalog = lazy(() => import('../pages/Public/ProductCatalog'))
const PublicProductDetail = lazy(() => import('../pages/Public/ProductDetail'))
const Cart = lazy(() => import('../pages/Public/Cart'))

// Customer Pages
const CustomerLogin = lazy(() => import('../pages/Customer/CustomerLogin'))
const CustomerRegister = lazy(() => import('../pages/Customer/CustomerRegister'))
const Checkout = lazy(() => import('../pages/Customer/Checkout'))
const OrderSuccess = lazy(() => import('../pages/Customer/OrderSuccess'))
const MyOrders = lazy(() => import('../pages/Customer/MyOrders'))
const DealersList = lazy(() => import('../pages/Dealers/DealersList'))
const DealerDetail = lazy(() => import('../pages/Dealers/DealerDetail'))
const DealerForm = lazy(() => import('../pages/Dealers/DealerForm'))
const DealerDashboard = lazy(() => import('../pages/Dealers/DealerDashboard'))
const KycUpload = lazy(() => import('../pages/Dealers/KycUpload'))
const FranchiseList = lazy(() => import('../pages/Franchises/FranchiseList'))
const FranchiseDetail = lazy(() => import('../pages/Franchises/FranchiseDetail'))
const FranchiseForm = lazy(() => import('../pages/Franchises/FranchiseForm'))

const ProductsList = lazy(() => import('../pages/Products/ProductsList'))
const ProductDetail = lazy(() => import('../pages/Products/ProductDetail'))
const ProductForm = lazy(() => import('../pages/Products/ProductForm'))
const ProductManagement = lazy(() => import('../pages/Admin/ProductManagement'))
const InvoicesList = lazy(() => import('../pages/Invoices/InvoicesList'))
const InvoiceDetail = lazy(() => import('../pages/Invoices/InvoiceDetail'))
const InvoiceForm = lazy(() => import('../pages/Invoices/InvoiceForm'))
const SalesList = lazy(() => import('../pages/Sales/SalesList'))
const SaleDetail = lazy(() => import('../pages/Sales/SaleDetail'))
const SaleForm = lazy(() => import('../pages/Sales/SaleForm'))
const Billing = lazy(() => import('../pages/Billing/Billing'))
const ScanBilling = lazy(() => import('../pages/POS/ScanBilling'))
const UsersList = lazy(() => import('../pages/Users/UsersList'))
const UserDetail = lazy(() => import('../pages/Users/UserDetail'))
const UserForm = lazy(() => import('../pages/Users/UserForm'))
const CommissionsList = lazy(() => import('../pages/Commissions/CommissionsList'))
const CommissionDetail = lazy(() => import('../pages/Commissions/CommissionDetail'))
const CommissionForm = lazy(() => import('../pages/Commissions/CommissionForm'))
const Reports = lazy(() => import('../pages/Admin/Reports'))
const DealerApprovals = lazy(() => import('../pages/Admin/DealerApprovals'))
const CommissionReport = lazy(() => import('../pages/Admin/CommissionReport'))

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/products/:id" element={<PublicProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Customer Auth Routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            
            {/* Customer Protected Routes */}
            <Route element={<RequireAuth roles={["Customer"]} />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            </Route>
            
            {/* Admin/Dealer Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/register-franchise" element={<FranchiseRegistration />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/admin" element={<NavigateToAppropriateHome />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dealers" element={<DealersList />} />
                <Route path="/dealers/dashboard" element={<DealerDashboard />} />
                <Route path="/dealers/kyc" element={<KycUpload />} />
                <Route path="/dealers/new" element={<DealerForm />} />
                <Route path="/dealers/:id" element={<DealerDetail />} />
                <Route path="/dealers/:id/edit" element={<DealerForm />} />

                <Route path="/franchises" element={<FranchiseList />} />
                <Route path="/franchises/new" element={<FranchiseForm />} />
                <Route path="/franchises/:id" element={<FranchiseDetail />} />
                <Route path="/franchises/:id/edit" element={<FranchiseForm />} />

                <Route path="/products" element={<ProductsList />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />

                <Route path="/invoices" element={<InvoicesList />} />
                <Route path="/invoices/new" element={<InvoiceForm />} />
                <Route path="/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

                <Route path="/sales" element={<SalesList />} />
                <Route path="/sales/new" element={<SaleForm />} />
                <Route path="/sales/:id" element={<SaleDetail />} />
                <Route path="/sales/:id/edit" element={<SaleForm />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/pos" element={<ScanBilling />} />

                <Route path="/commissions" element={<CommissionsList />} />
                <Route path="/commissions/new" element={<CommissionForm />} />
                <Route path="/commissions/:id" element={<CommissionDetail />} />
                <Route path="/commissions/:id/edit" element={<CommissionForm />} />

                <Route element={<RequireAuth roles={["Admin"]} />}>
                  <Route path="/users" element={<UsersList />} />
                  <Route path="/users/new" element={<UserForm />} />
                  <Route path="/admin/dealer-approvals" element={<DealerApprovals />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/reports/commissions" element={<CommissionReport />} />
                  <Route path="/reports" element={<Reports />} />
                </Route>
                
                {/* User profile accessible to all authenticated users */}
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/users/:id/edit" element={<UserForm />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

const NavigateToAppropriateHome: React.FC = () => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}
