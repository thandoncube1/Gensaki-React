// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import './index.css';
import WebLandingPage from './pages/WebLandingPage';
import AuthView from './pages/AuthViews';
import GISTIndexView from './pages/GISTIndex';
import DiligenceView from './pages/Diligence';

// ─── Route → selectedItem mapping (for nav-link highlighting) ─────────────────
const ROUTE_ITEM: Record<string, string> = {
  '/benchmark': 'Benchmark',
  '/fitscore':  'FitScore',
  '/diligence': 'Diligence',
  '/regwatch':  'RegWatch',
};

// ─── Central navigation handler ───────────────────────────────────────────────
// All pages call onSelectItem(key) — this function maps keys to routes.
// New pages just need a new key → path entry here.

function AppRoutes() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const selectedItem = ROUTE_ITEM[pathname] ?? null;

  function onSelectItem(item: string | null) {
    if (!item || item === 'Home')                         navigate('/');
    else if (item === 'Benchmark' || item === 'GISTIndex') navigate('/benchmark');
    else if (item === 'FitScore')                         navigate('/fitscore');
    else if (item === 'Diligence')                        navigate('/diligence');
    else if (item === 'RegWatch')                         navigate('/regwatch');
    else if (item === 'AuthViews')                        navigate('/signin');
    else if (item === 'SignUp')                           navigate('/signup');
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WebLandingPage
            selectedItem={selectedItem}
            onSelectItem={onSelectItem}
          />
        }
      />
      <Route
        path="/benchmark"
        element={<GISTIndexView onSelectItem={onSelectItem} />}
      />
      <Route
        path="/diligence"
        element={<DiligenceView onSelectItem={onSelectItem} />}
      />
      <Route
        path="/signin"
        element={<AuthView initialMode="signIn" onSelectItem={onSelectItem} />}
      />
      <Route
        path="/signup"
        element={<AuthView initialMode="signUp" onSelectItem={onSelectItem} />}
      />
    </Routes>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
