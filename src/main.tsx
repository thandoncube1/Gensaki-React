// src/main.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WebLandingPage from './pages/WebLandingPage';

function App() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // TODO: wire selectedItem to React Router navigation
  // e.g. if (selectedItem === 'AuthViews') navigate('/auth')

  return (
    <WebLandingPage
      selectedItem={selectedItem}
      onSelectItem={setSelectedItem}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
