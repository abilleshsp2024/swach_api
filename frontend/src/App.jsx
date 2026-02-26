import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import './App.css';

function MainLayout() {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="nav-brand">Swach</div>
        <div className="nav-links">
          {!hideNav && localStorage.getItem('access_token') && (
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
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
