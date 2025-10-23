import React from 'react';

function Timer() {
  return (
    <section className="page page-timer" data-easytag="id1-react/src/pages/Timer.jsx">
      <div className="card timer-card" data-easytag="id2-react/src/pages/Timer.jsx">
        <div className="timer-display" data-easytag="id3-react/src/pages/Timer.jsx">00:00</div>
        <div className="timer-setup" data-easytag="id4-react/src/pages/Timer.jsx">
          <label className="field" data-easytag="id5-react/src/pages/Timer.jsx">
            <span className="field-label" data-easytag="id6-react/src/pages/Timer.jsx">Минуты</span>
            <input type="number" min="0" max="599" className="input" placeholder="0" data-easytag="id7-react/src/pages/Timer.jsx" />
          </label>
          <label className="field" data-easytag="id8-react/src/pages/Timer.jsx">
            <span className="field-label" data-easytag="id9-react/src/pages/Timer.jsx">Секунды</span>
            <input type="number" min="0" max="59" className="input" placeholder="0" data-easytag="id10-react/src/pages/Timer.jsx" />
          </label>
        </div>
        <div className="timer-actions" data-easytag="id11-react/src/pages/Timer.jsx">
          <button type="button" className="btn" data-easytag="id12-react/src/pages/Timer.jsx">Старт</button>
          <button type="button" className="btn" data-easytag="id13-react/src/pages/Timer.jsx">Пауза</button>
          <button type="button" className="btn btn-secondary" data-easytag="id14-react/src/pages/Timer.jsx">Сброс</button>
        </div>
      </div>
    </section>
  );
}

export default Timer;
