// File: src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/DashBoard';
import ConnectionsPage from './components/ConnectionsPage';
import Profile from './components/Profile';
import AuthNavbar from './components/AuthNavbar';
import DashboardNavbar from './components/DashboardNavbar';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function Layout() {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  const isAuthRoute = ['/login', '/signup'].includes(location.pathname);
  const isDashboardRoute = ['/dashboard', '/profile', '/connections'].includes(location.pathname);

  return (
    <>
      {isAuthenticated && isDashboardRoute && <DashboardNavbar />}
      {!isAuthenticated && isAuthRoute && <AuthNavbar />}

      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/connections"
          element={
            <RequireAuth>
              <ConnectionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
