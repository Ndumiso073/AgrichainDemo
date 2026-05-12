// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing        from './pages/Landing'
import Login          from './pages/Login'
import Register       from './pages/Register'
import OTPVerify      from './pages/OTPVerify'
import Unauthorized   from './pages/Unauthorized'
import FarmerDashboard  from './pages/FarmerDashboard'
import RegisterHarvest  from './pages/RegisterHarvest'
import QRViewer         from './pages/QRViewer'
import BuyerScanner     from './pages/BuyerScanner'
import BuyerOrders      from './pages/BuyerOrders'  // ADD THIS IMPORT
import VerifyResult     from './pages/VerifyResult'
import AdminDashboard   from './pages/AdminDashboard'
import UserManagement   from './pages/UserManagement'
import ForgotPassword from './pages/ForgotPassword'
import Resetpassword  from './pages/Resetpassword'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/"            element={<Landing />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/verify-otp"  element={<OTPVerify />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<Resetpassword />} />

          {/* Farmer-only routes */}
          <Route path="/farmer" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/register-harvest" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <RegisterHarvest />
            </ProtectedRoute>
          } />
          <Route path="/qr-viewer" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <QRViewer />
            </ProtectedRoute>
          } />

          {/* Buyer-only routes */}
          <Route path="/buyer" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerScanner />
            </ProtectedRoute>
          } />
          
          {/* ADD THIS: Buyer Orders Route */}
          <Route path="/buyer-orders" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerOrders />
            </ProtectedRoute>
          } />
          
          <Route path="/verify-result" element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <VerifyResult />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App