import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="nav-brand">Swach</div>
          <div className="nav-links">
            {localStorage.getItem('access_token') && (
              <>
                <button className="nav-btn">Model</button>
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_id');
                    window.location.href = '/login';
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
