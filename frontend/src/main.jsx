import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Contacts from './pages/Contacts'
import Segments from './pages/Segments'
import EmailBuilder from './pages/EmailBuilder'
import Analytics from './pages/Analytics'
import './index.css'
import LeadCapture from './pages/LeadCapture'

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/campaigns" element={<Protected><Campaigns /></Protected>} />
          <Route path="/contacts" element={<Protected><Contacts /></Protected>} />
          <Route path="/segments" element={<Protected><Segments /></Protected>} />
          <Route path="/email-builder" element={<Protected><EmailBuilder /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/capture" element={<LeadCapture />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)