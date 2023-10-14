import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/login_inscription/LoginForm';
import RegisterForm from './components/login_inscription/RegisterForm';
import ResetPasswordForm from './components/login_inscription/ResetPasswordForm';
import HomeComponent from './components/HomeComponent';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/authContext';
import Documentation from './components/Documentation';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  
  if (isLoading) {
    return <div>Chargement...</div>;
  }

 
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterForm />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" /> : <ResetPasswordForm />} />
      <Route path="/" element={isAuthenticated ? <HomeComponent /> : <Navigate to="/login" />} />
      <Route path="/docs" element={isAuthenticated ? <Documentation /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {


  return (
    <AuthProvider>
      <Header />
      <Router>
        
          <AppRoutes />
        
      </Router>
    </AuthProvider>
  );
}

export default App;
