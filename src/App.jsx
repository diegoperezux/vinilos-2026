import { useEffect, useRef, useState } from "react";
import { monthlyAlbums } from "./data/monthlyAlbums";
import CoverFlow from "./components/CoverFlow";
import NowPlaying from "./components/NowPlaying";
import "./App.css";

function currentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function MonthIndex({ months, selectedKey, onSelect }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedKey]);

  return (
    <nav className="month-index" aria-label="Meses del año">
      {months.map((month) => {
        const isActive = month.key === selectedKey;
        return (
          <button
            key={month.key}
            ref={isActive ? activeRef : null}
            type="button"
            className={`month-index-item${isActive ? " month-index-item--active" : ""}`}
            onClick={() => onSelect(month.key)}
          >
            {month.label}
          </button>
        );
      })}
    </nav>
  );
}

function App() {
  const defaultMonthKey = monthlyAlbums.some((m) => m.key === currentMonthKey())
    ? currentMonthKey()
    : monthlyAlbums[0].key;
  const [selectedMonthKey, setSelectedMonthKey] = useState(defaultMonthKey);

  const selectedMonth =
    monthlyAlbums.find((m) => m.key === selectedMonthKey) ?? monthlyAlbums[0];

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="shelf-title">Mi Top 2026</h1>
            <p className="sidebar-about">
              Mis discos favoritos, mes a mes, durante este 2026.
            </p>
            <MonthIndex
              months={monthlyAlbums}
              selectedKey={selectedMonthKey}
              onSelect={setSelectedMonthKey}
            />
          </div>
          <footer className="site-footer">
            <NowPlaying />
            <div className="site-footer-bottom">
              <div className="site-footer-info">
                <span className="site-footer-name">Diego Perez</span>
                <p className="site-footer-madein">Made in 2026</p>
              </div>
            </div>
          </footer>
        </aside>

        <main className="shelf-wrapper">
          {selectedMonth.albums.length === 0 ? (
            <>
              <div className="month-header">
                <h2 className="month-header-title">{selectedMonth.label} 2026</h2>
              </div>
              <div className="shelf-empty-state">
                <p>Todavía no hay discos guardados para {selectedMonth.label}.</p>
              </div>
            </>
          ) : (
            <CoverFlow
              monthLabel={selectedMonth.label}
              albums={selectedMonth.albums}
            />
          )}
        </main>
      </div>

      <footer className="mobile-footer" style={{ display: "none" }}>
        <NowPlaying />
        <div className="site-footer-bottom">
          <div className="site-footer-info">
            <span className="site-footer-name">Diego Perez</span>
            <p className="site-footer-madein">Made in 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
