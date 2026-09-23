import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Libraries from './pages/Libraries'
import Footer from './components/Footer'  

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libraries" element={<Libraries />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App