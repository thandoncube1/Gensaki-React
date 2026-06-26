// src/main.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WebLandingPage from './pages/WebLandingPage';
import AuthView, { type AuthMode } from './pages/AuthViews';
import GISTIndexView from './pages/GISTIndex';

function App() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');

  if (selectedItem === 'GISTIndex' || selectedItem === 'Benchmark') {
    return <GISTIndexView onSelectItem={(item) => {
      if (item === 'Home' || item === null) setSelectedItem(null);
      else if (item === 'AuthViews') { setAuthMode('signIn'); setSelectedItem('AuthViews'); }
      else setSelectedItem(item);
    }} />;
  }

  if (selectedItem === 'AuthViews') {
    return (
      <AuthView
        initialMode={authMode}
        onSelectItem={(item) => {
          // 'Home' or null → back to landing
          if (item === 'Home' || item === null) {
            setSelectedItem(null);
          } else {
            setSelectedItem(item);
          }
        }}
      />
    );
  }

  return (
    <WebLandingPage
      selectedItem={selectedItem}
      onSelectItem={(item) => {
        // Nav "Sign in" sends 'AuthViews' → default to signIn mode
        if (item === 'AuthViews') { setAuthMode('signIn'); setSelectedItem('AuthViews'); }
        // Future: CTAButtons can send 'SignUp' to open sign-up directly
        else if (item === 'SignUp') { setAuthMode('signUp'); setSelectedItem('AuthViews'); }
        else setSelectedItem(item);
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
