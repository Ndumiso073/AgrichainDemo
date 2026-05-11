// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing        from './pages/Landing'
import Login          from './pages/Login'
import OTPVerify      from './pages/OTPVerify'
import Unauthorized   from './pages/Unauthorized'
import FarmerDashboard  from './pages/FarmerDashboard'
import RegisterHarvest  from './pages/RegisterHarvest'
import QRViewer         from './pages/QRViewer'
import BuyerScanner     from './pages/BuyerScanner'
import VerifyResult     from './pages/VerifyResult'
import AdminDashboard   from './pages/AdminDashboard'
import UserManagement   from './pages/UserManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/"            element={<Landing />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/verify-otp"  element={<OTPVerify />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

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