import { useState } from "react";
import { monthlyAlbums } from "./data/monthlyAlbums";
import { currentMonthKey } from "./utils/currentMonthKey";
import CoverFlow from "./components/CoverFlow";
import ListeningLately from "./components/ListeningLately";
import { GenreIndex, GenreResults } from "./components/GenreExplorer";
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

function Credit() {
  return (
    <p className="sidebar-credit">
      Made with love by{" "}
      <a
        href="https://diegoperezux.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Diego
      </a>
    </p>
  );
}

function App() {
  const [selectedMonthKey, setSelectedMonthKey] = useState(() =>
    defaultMonthKey(monthlyAlbums),
  );
  const [selectedGenreGroup, setSelectedGenreGroup] = useState(null);

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="shelf-title">Mi Top 2026</h1>
            <p className="sidebar-about">Mis discos favoritos, mes a mes.</p>

            <GenreIndex
              monthlyAlbums={monthlyAlbums}
              activeGroup={selectedGenreGroup}
              onSelectGroup={setSelectedGenreGroup}
            />
          </div>
          <footer className="site-footer">
            <ListeningLately />
            <Credit />
          </footer>
        </aside>

        <main className="shelf-wrapper">
          {selectedGenreGroup ? (
            <GenreResults
              monthlyAlbums={monthlyAlbums}
              group={selectedGenreGroup}
              onClose={() => setSelectedGenreGroup(null)}
            />
          ) : (
            <CoverFlow
              monthlyAlbums={monthlyAlbums}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
            />
          )}
        </main>
      </div>

      <footer className="mobile-footer" style={{ display: "none" }}>
        <ListeningLately />
        <Credit />
      </footer>
    </div>
  );
}

export default App;
