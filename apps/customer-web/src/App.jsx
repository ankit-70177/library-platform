import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import ProtectedRoute from './components/owner/ProtectedRoute.jsx'

import About from './pages/public/About.jsx'
import Home from './pages/public/Home.jsx'
import Locations from './pages/public/Locations.jsx'
import Events from './pages/public/Events.jsx'

import Auth from './pages/customer/Auth.jsx'
import Dashboard from './pages/customer/Dashboard.jsx'
import MembershipPlans from './pages/customer/MembershipPlans.jsx'
import OwnerAuth from './pages/owner/OwnerAuth.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'

function AppLayout() {
  const location = useLocation()
  const hideLayout =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/owner')

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/membership-plans/:libraryId" element={<MembershipPlans />} />

        <Route path="/owner/login" element={<OwnerAuth initialMode="login" />} />
        <Route path="/owner/apply" element={<OwnerAuth initialMode="apply" />} />
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
