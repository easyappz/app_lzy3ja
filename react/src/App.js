import React, { useEffect, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Alarm from './pages/Alarm';
import Timer from './pages/Timer';
import './App.css';

const ROUTES = ['/', '/calculator', '/alarm', '/timer'];

function App() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(ROUTES);
    }
  }, [location]);

  const title = useMemo(() => {
    switch (location.pathname) {
      case '/':
        return 'Главная';
      case '/calculator':
        return 'Калькулятор';
      case '/alarm':
        return 'Будильник';
      case '/timer':
        return 'Таймер';
      default:
        return 'Приложение';
    }
  }, [location.pathname]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <ErrorBoundary>
      <div className="app" data-easytag="id1-react/src/App.js">
        <header className="app-header" data-easytag="id2-react/src/App.js">
          <h1 className="app-title" data-easytag="id3-react/src/App.js">{title}</h1>
        </header>
        <main className="app-main" data-easytag="id4-react/src/App.js">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/alarm" element={<Alarm />} />
            <Route path="/timer" element={<Timer />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
