import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import BookingList from './components/BookingList'
import BookingForm from './components/BookingForm'
import DateBookings from './components/DateBookings'
import UserBookings from './components/UserBookings'
import VidInput from './components/VidInput'
import { BookingProvider } from './context/BookingContext'
import './App.css'

function Navigation({ currentVid, setCurrentVid }) {
  const location = useLocation()
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-tower-broadcast me-2"></i>
          IVAO ATC Booking System
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <i className="fas fa-list me-1"></i>
                All Bookings
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/date-search' ? 'active' : ''}`} 
                to="/date-search"
              >
                <i className="fas fa-calendar me-1"></i>
                Search by Date
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/book' ? 'active' : ''}`} 
                to="/book"
              >
                <i className="fas fa-plus me-1"></i>
                New Booking
              </Link>
            </li>
            {currentVid && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`} 
                  to="/my-bookings"
                >
                  <i className="fas fa-user me-1"></i>
                  My Bookings
                </Link>
              </li>
            )}
          </ul>
          
          <VidInput currentVid={currentVid} setCurrentVid={setCurrentVid} />
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5><i className="fas fa-tower-broadcast me-2"></i>IVAO ATC Booking</h5>
            <p className="text-muted">
              Sistema de agendamento de posições ATC para a rede IVAO.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-muted mb-0">
              Desenvolvido para o teste técnico da IVAO Web Team
            </p>
            <small className="text-muted">
              Frontend Entry Exercise - Pietro
            </small>
          </div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const [currentVid, setCurrentVid] = useState(() => {
    return localStorage.getItem('ivao_vid') || ''
  })

  useEffect(() => {
    if (currentVid) {
      localStorage.setItem('ivao_vid', currentVid)
    } else {
      localStorage.removeItem('ivao_vid')
    }
  }, [currentVid])

  return (
    <BookingProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navigation currentVid={currentVid} setCurrentVid={setCurrentVid} />
          
          <main className="flex-grow-1">
            <div className="container my-4">
              <Routes>
                <Route path="/" element={<BookingList />} />
                <Route path="/date-search" element={<DateBookings />} />
                <Route 
                  path="/book" 
                  element={<BookingForm currentVid={currentVid} />} 
                />
                <Route 
                  path="/my-bookings" 
                  element={<UserBookings currentVid={currentVid} />} 
                />
              </Routes>
            </div>
          </main>
          
          <Footer />
        </div>
      </Router>
    </BookingProvider>
  )
}

export default App