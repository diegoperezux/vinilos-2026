import { useState, useEffect, useRef } from 'react';
import Vinyl from './Vinyl';

function colsForWidth(w) {
  if (w < 300) return 1;
  if (w < 480) return 2;
  if (w < 680) return 3;
  return 4;
}

function ShelfRow({ rowVinyls, slotsPerRow, onSelectVinyl, index }) {
  const rowRef = useRef(null);
  const [visible, setVisible] = useState(index < 3);

  useEffect(() => {
    if (index < 3) return;
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index]);

  return (
    <div
      ref={rowRef}
      className={`shelf-row${visible ? ' shelf-row--visible' : ''}`}
    >
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
  );
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

  const rows = [];
  for (let i = 0; i < vinyls.length; i += slotsPerRow) {
    rows.push(vinyls.slice(i, i + slotsPerRow));
  }

  return (
    <div className="shelf-page">
      <div className="shelf-container" ref={containerRef}>
        {rows.map((rowVinyls, rowIndex) => (
          <ShelfRow
            key={rowIndex}
            index={rowIndex}
            rowVinyls={rowVinyls}
            slotsPerRow={slotsPerRow}
            onSelectVinyl={onSelectVinyl}
          />
        ))}
      </div>
    </div>
  );
}

export default Shelf;
