import { useState, useEffect, useRef } from 'react';
import Vinyl from './Vinyl';

function colsForWidth(w) {
  if (w < 300) return 1;
  if (w < 480) return 2;
  if (w < 680) return 3;
  return 4;
}

function Shelf({ vinyls, onSelectVinyl }) {
  const [slotsPerRow, setSlotsPerRow] = useState(4);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSlotsPerRow(colsForWidth(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const displayed = vinyls.slice(0, 12);
  const rows = [];
  for (let i = 0; i < displayed.length; i += slotsPerRow) {
    rows.push(displayed.slice(i, i + slotsPerRow));
  }

  return (
    <div className="shelf-page">
      <div className="shelf-container" ref={containerRef}>
        {rows.map((rowVinyls, rowIndex) => (
          <div key={rowIndex} className="shelf-row">
            <div className="shelf-slots" style={{ '--cols': slotsPerRow }}>
              {rowVinyls.map((vinyl, i) => (
                <Vinyl key={i} vinyl={vinyl} onClick={onSelectVinyl} />
              ))}
            </div>
            <div className="shelf-plank" aria-hidden>
              <div className="shelf-plank-top" />
              <div className="shelf-plank-face">
                <div className="shelf-plank-line" />
              </div>
              <div className="shelf-plank-shadow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shelf;
