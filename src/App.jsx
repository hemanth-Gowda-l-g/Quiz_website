import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Components and Context
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import Quiz from './components/Quiz';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { state } = useAuth(); // Get auth state from context
  const [quizSettings, setQuizSettings] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current page location

  const startQuiz = (type, difficulty) => {
    setQuizSettings({ type, difficulty });
    navigate('/quiz');
  };

  // Conditionally show the Navbar based on the current page
  const showNavbar = location.pathname !== "/quiz";
  
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public routes that are only accessible when logged out */}
        <Route path="/login" element={!state.isAuthenticated || !state.user? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!state.isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <UserDashboard onStartQuiz={startQuiz} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/quiz" 
          element={
            <PrivateRoute>
              {quizSettings ? <Quiz settings={quizSettings} onBackToDashboard={() => navigate('/')} /> : <Navigate to="/" />}
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              {/* Additional check to ensure only admins can access this route */}
              {state.user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
            </PrivateRoute>
          } 
        />
        {/* A catch-all route to redirect any unknown URLs to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;

