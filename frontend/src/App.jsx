import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'
import Navbar from './components/navbar/Navbar'
import Libraries from './pages/public/Libraries'
import Footer from './components/footer/Footer'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libraries" element={<Libraries />} />
      </Routes>

      <Footer/>    
    </BrowserRouter>
  )
}

export default App