import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import About from './pages/public/About.jsx'
import Home from './pages/public/Home.jsx'
import Locations from './pages/public/Locations.jsx'
import Events from './pages/public/Events.jsx'
import Auth from './pages/customer/Auth.jsx'
import Dashboard from './pages/customer/Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App
