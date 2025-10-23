import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page" data-easytag="id1-react/src/pages/Home.jsx">
      <div className="tiles-grid" data-easytag="id2-react/src/pages/Home.jsx">
        <Link to="/calculator" className="tile" aria-label="Открыть Калькулятор" data-easytag="id3-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id4-react/src/pages/Home.jsx">🧮</span>
          <h2 className="tile-title" data-easytag="id5-react/src/pages/Home.jsx">Калькулятор</h2>
          <p className="tile-desc" data-easytag="id6-react/src/pages/Home.jsx">Быстрые расчёты в стиле iPhone</p>
        </Link>

        <Link to="/alarm" className="tile" aria-label="Открыть Будильник" data-easytag="id7-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id8-react/src/pages/Home.jsx">⏰</span>
          <h2 className="tile-title" data-easytag="id9-react/src/pages/Home.jsx">Будильник</h2>
          <p className="tile-desc" data-easytag="id10-react/src/pages/Home.jsx">Создавайте и управляйте будильниками</p>
        </Link>

        <Link to="/timer" className="tile" aria-label="Открыть Таймер" data-easytag="id11-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id12-react/src/pages/Home.jsx">⏱️</span>
          <h2 className="tile-title" data-easytag="id13-react/src/pages/Home.jsx">Таймер</h2>
          <p className="tile-desc" data-easytag="id14-react/src/pages/Home.jsx">Обратный отсчёт с паузой</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
