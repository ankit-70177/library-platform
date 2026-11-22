// import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import Footer from './components/layout/Footer.jsx'
// import Navbar from './components/layout/Navbar.jsx'
// import About from './pages/public/About.jsx'
// import Home from './pages/public/Home.jsx'
// import Locations from './pages/public/Locations.jsx'
// import Events from './pages/public/Events.jsx'
// import Auth from './pages/customer/Auth.jsx'
// import Dashboard from './pages/customer/Dashboard.jsx'

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/locations" element={<Locations />} />
//         <Route path="/events" element={<Events />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/login" element={<Auth mode="login" />} />
//         <Route path="/register" element={<Auth mode="register" />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>

//       <Footer />
//     </BrowserRouter>
//   )
// }

// export default App




import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'

import About from './pages/public/About.jsx'
import Home from './pages/public/Home.jsx'
import Locations from './pages/public/Locations.jsx'
import Events from './pages/public/Events.jsx'

import Auth from './pages/customer/Auth.jsx'
import Dashboard from './pages/customer/Dashboard.jsx'
import MembershipPlans from './pages/customer/MembershipPlans.jsx'

function AppLayout() {
  const location = useLocation()

  // Pages where Navbar and Footer should be hidden
  const hideLayout =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard')

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
      </Routes>

      {!hideLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
