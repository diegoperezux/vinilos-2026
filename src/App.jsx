import { useState } from "react";
import { monthlyAlbums } from "./data/monthlyAlbums";
import { currentMonthKey } from "./utils/currentMonthKey";
import CoverFlow from "./components/CoverFlow";
import NowPlaying from "./components/NowPlaying";
import "./App.css";

// The current month is always empty (you can't pick favorites for a month
// that isn't over yet), so land on the most recent past month that has
// albums instead of on today's empty one.
function defaultMonthKey(months) {
  const nowKey = currentMonthKey();
  const pastWithAlbums = months.filter(
    (m) => m.key < nowKey && m.albums.length > 0,
  );
  if (pastWithAlbums.length > 0) {
    return pastWithAlbums[pastWithAlbums.length - 1].key;
  }
  return months[0].key;
}

function App() {
  const [selectedMonthKey, setSelectedMonthKey] = useState(() =>
    defaultMonthKey(monthlyAlbums),
  );

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="shelf-title">Mi Top 2026</h1>
            <p className="sidebar-about">
              Mis discos favoritos, mes a mes, durante este 2026.
            </p>
            <a
              href="https://diegoperezux.vercel.app/"
              className="sidebar-credit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Música seleccionada por Diego Perez →
            </a>
          </div>
          <footer className="site-footer">
            <NowPlaying />
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
      </footer>
    </div>
  );
}

export default App;
