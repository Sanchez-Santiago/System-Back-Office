import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import AppContent from './App';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Dar tiempo para que el AuthContext se inicialice
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🚀 App: Estado de inicialización:', isInitializing);
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 animate-pulse"></div>
          <p className="text-gray-600">Iniciando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AppContent />
    </div>
  );
}

export default App;