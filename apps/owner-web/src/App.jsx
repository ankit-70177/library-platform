import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Auth from './pages/authentication/Auth.jsx'
import OwnerDashboard from './pages/dashboard/OwnerDashboard.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/apply" element={<Auth initialMode="apply" />} />

        {/* Protected Owner Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
