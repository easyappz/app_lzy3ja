import React from 'react';

function Alarm() {
  return (
    <section className="page page-alarm" data-easytag="id1-react/src/pages/Alarm.jsx">
      <div className="card" data-easytag="id2-react/src/pages/Alarm.jsx">
        <ul className="alarm-list" data-easytag="id3-react/src/pages/Alarm.jsx">
          <li className="alarm-empty" data-easytag="id4-react/src/pages/Alarm.jsx">Список будильников пуст</li>
        </ul>
      </div>
      <div className="fab-wrap" data-easytag="id5-react/src/pages/Alarm.jsx">
        <button type="button" className="btn btn-primary fab" data-easytag="id6-react/src/pages/Alarm.jsx" aria-label="Добавить будильник">
          + Добавить
        </button>
      </div>
    </section>
  );
}

export default Alarm;
