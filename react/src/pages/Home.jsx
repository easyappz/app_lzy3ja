import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="page page-home" data-easytag="id1-react/src/pages/Home.jsx">
      <div className="tiles-grid" data-easytag="id2-react/src/pages/Home.jsx">
        <Link to="/calculator" className="tile" data-easytag="id3-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id4-react/src/pages/Home.jsx">🧮</span>
          <h2 className="tile-title" data-easytag="id5-react/src/pages/Home.jsx">Калькулятор</h2>
          <p className="tile-desc" data-easytag="id6-react/src/pages/Home.jsx">Быстрые вычисления с удобной раскладкой.</p>
        </Link>
        <Link to="/alarm" className="tile" data-easytag="id7-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id8-react/src/pages/Home.jsx">⏰</span>
          <h2 className="tile-title" data-easytag="id9-react/src/pages/Home.jsx">Будильник</h2>
          <p className="tile-desc" data-easytag="id10-react/src/pages/Home.jsx">Создавайте напоминания и просыпайтесь вовремя.</p>
        </Link>
        <Link to="/timer" className="tile" data-easytag="id11-react/src/pages/Home.jsx">
          <span className="tile-icon" aria-hidden="true" data-easytag="id12-react/src/pages/Home.jsx">⏱️</span>
          <h2 className="tile-title" data-easytag="id13-react/src/pages/Home.jsx">Таймер</h2>
          <p className="tile-desc" data-easytag="id14-react/src/pages/Home.jsx">Отсчитывайте время для задач и отдыха.</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;
