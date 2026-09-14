import { useState } from "react";
import { monthlyAlbums } from "./data/monthlyAlbums";
import CoverFlow from "./components/CoverFlow";
import NowPlaying from "./components/NowPlaying";
import "./App.css";

function currentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function App() {
  const defaultMonthKey = monthlyAlbums.some((m) => m.key === currentMonthKey())
    ? currentMonthKey()
    : monthlyAlbums[0].key;
  const [selectedMonthKey, setSelectedMonthKey] = useState(defaultMonthKey);

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="shelf-title">Mi Top 2026</h1>
            <p className="sidebar-about">
              Mis discos favoritos, mes a mes, durante este 2026.
            </p>
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
          <CoverFlow
            monthlyAlbums={monthlyAlbums}
            selectedMonthKey={selectedMonthKey}
            onSelectMonth={setSelectedMonthKey}
          />
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
