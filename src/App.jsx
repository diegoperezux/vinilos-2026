import { useState, useEffect, useCallback, useRef } from 'react';
import { vinyls } from './data/vinyls';
import { playVinylOpen } from './utils/sounds';
import Shelf from './components/Shelf';
import NowPlaying from './components/NowPlaying';
import VinylCard from './components/VinylCard';
import './App.css';

const CLOSE_ANIMATION_MS = 250;

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function App() {
  const [selectedVinyl, setSelectedVinyl] = useState(null);
  const [cardKey, setCardKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const closeTimerRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedVinyl(null);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, []);

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="shelf-title">Mi repisa musical</h1>
            <p className="sidebar-about">
            Lo que escucho mientras trabajo, camino o simplemente existo en este 2026.
            </p>
          </div>
          <footer className="site-footer">
            <NowPlaying />
            <div className="site-footer-bottom">
              <div className="site-footer-info">
                <span className="site-footer-name">Diego Perez</span>
                <p className="site-footer-madein">Made in 2026</p>

              </div>
              <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                {isDark ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </footer>
        </aside>

        <main className="shelf-wrapper">
          <Shelf vinyls={vinyls} onSelectVinyl={(vinyl) => {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
            setIsClosing(false);
            playVinylOpen();
            setSelectedVinyl(vinyl);
            setCardKey(k => k + 1);
          }} />
        </main>
      </div>

      <footer className="mobile-footer" style={{ display: 'none' }}>
        <NowPlaying />
        <div className="site-footer-bottom">
          <div className="site-footer-info">
            <span className="site-footer-name">Diego Perez</span>
            <p className="site-footer-madein">Made in 2026</p>

          </div>
          <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </footer>

      {selectedVinyl && (
        <VinylCard
          key={cardKey}
          vinyl={selectedVinyl}
          onClose={handleClose}
          isClosing={isClosing}
        />
      )}
    </div>
  );
}

export default App;
