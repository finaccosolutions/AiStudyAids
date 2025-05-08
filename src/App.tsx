import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import QuizPage from './pages/QuizPage';
import ApiSettingsPage from './pages/ApiSettingsPage';

function App() {
  const { loadUser, isLoggedIn } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route 
            path="quiz" 
            element={
              isLoggedIn ? <QuizPage /> : <Navigate to="/auth" replace />
            } 
          />
          <Route 
            path="api-settings" 
            element={
              isLoggedIn ? <ApiSettingsPage /> : <Navigate to="/auth" replace />
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;