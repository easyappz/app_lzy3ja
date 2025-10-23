import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function getMon0Day(date) {
  const d = date.getDay(); // 0..6, 0=Sun
  return d === 0 ? 6 : d - 1; // 0..6, 0=Mon
}

function pad2(n) {
  const s = String(n);
  if (s.length === 1) return '0' + s;
  return s;
}

function formatTime(hh, mm) {
  return pad2(hh) + ':' + pad2(mm);
}

function dayName(i) {
  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return names[i];
}

function nextTriggerTs(hh, mm, days) {
  const now = new Date();
  const nowMon = getMon0Day(now);
  if (!days || days.length === 0) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
    if (dt.getTime() > now.getTime()) return dt.getTime();
    const dt2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm, 0, 0);
    return dt2.getTime();
  }
  // Find nearest day according to days array (0..6 Mon..Sun)
  for (let k = 0; k < 14; k += 1) {
    const dayIndex = (nowMon + k) % 7;
    let found = false;
    for (let i = 0; i < days.length; i += 1) {
      if (days[i] === dayIndex) { found = true; break; }
    }
    if (found) {
      const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k, hh, mm, 0, 0);
      if (base.getTime() > now.getTime()) {
        return base.getTime();
      }
    }
  }
  // Fallback to one week later
  const later = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, hh, mm, 0, 0);
  return later.getTime();
}

function Alarm() {
  const [alarms, setAlarms] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [panelData, setPanelData] = useState({ time: '07:00', label: 'Будильник', days: [] });
  const [ringingId, setRingingId] = useState(null);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/sounds/alarm-default.mp3');
    audio.loop = true;
    audioRef.current = audio;
  }, []);

  const requestAudio = useCallback(async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioReady(true);
    } catch (e) {
      // Best effort: try WebAudio short unlock by creating a silent context
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        setAudioReady(true);
      } catch (_) {}
    }
  }, []);

  const stopAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (_) {}
  }, []);

  const playAudioLoop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {
        // Fallback to WebAudio buzzer
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.05;
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 5000);
        } catch (_) {}
      });
    }
  }, []);

  const schedule = useCallback((alarm) => {
    const id = alarm.id;
    const [hhStr, mmStr] = alarm.time.split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    const ts = nextTriggerTs(hh, mm, alarm.days);
    const delay = ts - Date.now();
    const to = window.setTimeout(() => {
      setRingingId(id);
      playAudioLoop();
      // If not repeating, disable automatically
      setAlarms((prev) => prev.map(a => {
        if (a.id === id) {
          const repeating = a.days && a.days.length > 0;
          return { ...a, enabled: repeating ? true : false, nextAt: repeating ? nextTriggerTs(hh, mm, a.days) : null, timeoutId: null };
        }
        return a;
      }));
      // For repeating, schedule next immediately after trigger
      setTimeout(() => {
        setAlarms((prev) => {
          const current = prev.find(a => a.id === id);
          if (!current) return prev;
          if (current.days && current.days.length > 0 && current.enabled) {
            const next = nextTriggerTs(hh, mm, current.days);
            const d = next - Date.now();
            const nt = window.setTimeout(() => {
              setRingingId(id);
              playAudioLoop();
            }, d);
            return prev.map(a => a.id === id ? { ...a, nextAt: next, timeoutId: nt } : a);
          }
          return prev;
        });
      }, 0);
    }, delay);

    setAlarms((prev) => prev.map(a => a.id === id ? { ...a, nextAt: ts, timeoutId: to } : a));
  }, [playAudioLoop]);

  const toggleAlarm = useCallback((id, enabled) => {
    setAlarms((prev) => {
      const next = prev.map((a) => {
        if (a.id !== id) return a;
        // clear existing
        if (a.timeoutId) {
          window.clearTimeout(a.timeoutId);
        }
        if (!enabled) {
          return { ...a, enabled: false, nextAt: null, timeoutId: null };
        }
        const temp = { ...a, enabled: true, timeoutId: null };
        return temp;
      });
      // After state update, schedule
      const alarm = next.find(a => a.id === id);
      if (alarm && enabled) {
        schedule(alarm);
      }
      return next;
    });
  }, [schedule]);

  const removeAlarm = useCallback((id) => {
    setAlarms((prev) => {
      const a = prev.find(x => x.id === id);
      if (a && a.timeoutId) window.clearTimeout(a.timeoutId);
      return prev.filter(x => x.id !== id);
    });
  }, []);

  useEffect(() => () => {
    // cleanup timeouts on unmount
    setAlarms((prev) => {
      prev.forEach(a => { if (a.timeoutId) window.clearTimeout(a.timeoutId); });
      return prev;
    });
    stopAudio();
  }, [stopAudio]);

  const openPanel = useCallback(() => {
    setPanelData({ time: '07:00', label: 'Будильник', days: [] });
    setShowPanel(true);
  }, []);

  const savePanel = useCallback(() => {
    const id = Date.now();
    const newAlarm = { id, time: panelData.time, label: panelData.label || 'Будильник', days: panelData.days || [], enabled: true, nextAt: null, timeoutId: null };
    setAlarms((prev) => [...prev, newAlarm]);
    setShowPanel(false);
    // schedule new one
    setTimeout(() => schedule(newAlarm), 0);
  }, [panelData, schedule]);

  const stopRinging = useCallback(() => {
    stopAudio();
    setRingingId(null);
  }, [stopAudio]);

  const banner = useMemo(() => {
    if (audioReady) return null;
    return (
      <div className="card" style={{ marginBottom: 12 }} data-easytag="id1b-react/src/pages/Alarm.jsx">
        <p style={{ margin: 0, marginBottom: 8 }} data-easytag="id1c-react/src/pages/Alarm.jsx">Чтобы звук работал в фоне, держите вкладку активной. Нажмите, чтобы включить звук.</p>
        <button className="btn" onClick={requestAudio} aria-label="Включить звук" data-easytag="id1d-react/src/pages/Alarm.jsx">Включить звук</button>
      </div>
    );
  }, [audioReady, requestAudio]);

  return (
    <div className="page" data-easytag="id2-react/src/pages/Alarm.jsx">
      {banner}
      <ul className="alarm-list" aria-label="Список будильников" data-easytag="id3-react/src/pages/Alarm.jsx">
        {alarms.length === 0 && (
          <li className="alarm-empty" data-easytag="id4-react/src/pages/Alarm.jsx">Будильников нет</li>
        )}
        {alarms.map((a) => (
          <li key={a.id} className="card" style={{ marginBottom: 10 }} data-easytag="id5-react/src/pages/Alarm.jsx">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }} data-easytag="id6-react/src/pages/Alarm.jsx">
              <div style={{ display: 'flex', flexDirection: 'column' }} data-easytag="id7-react/src/pages/Alarm.jsx">
                <span style={{ fontSize: 24, lineHeight: 1.2 }} aria-label="Время" data-easytag="id8-react/src/pages/Alarm.jsx">{a.time}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 13 }} aria-label="Метка" data-easytag="id9-react/src/pages/Alarm.jsx">{a.label}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 13 }} aria-label="Повтор" data-easytag="id10-react/src/pages/Alarm.jsx">
                  {(a.days && a.days.length > 0) ? a.days.map(dayName).join(', ') : 'Однократно'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-easytag="id11-react/src/pages/Alarm.jsx">
                <button className="btn btn-secondary" onClick={() => removeAlarm(a.id)} aria-label="Удалить" data-easytag="id12-react/src/pages/Alarm.jsx">Удалить</button>
                <button className="btn" onClick={() => toggleAlarm(a.id, !a.enabled)} aria-label={a.enabled ? 'Выключить' : 'Включить'} data-easytag="id13-react/src/pages/Alarm.jsx">{a.enabled ? 'Выкл' : 'Вкл'}</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="fab-wrap" data-easytag="id14-react/src/pages/Alarm.jsx">
        <button className="btn btn-primary fab" onClick={openPanel} aria-label="Добавить будильник" data-easytag="id15-react/src/pages/Alarm.jsx">Добавить</button>
      </div>

      {showPanel && (
        <div role="dialog" aria-modal="true" className="card" style={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 50 }} data-easytag="id16-react/src/pages/Alarm.jsx">
          <div style={{ display: 'grid', gap: 12 }} data-easytag="id17-react/src/pages/Alarm.jsx">
            <label className="field" data-easytag="id18-react/src/pages/Alarm.jsx">
              <span className="field-label" data-easytag="id19-react/src/pages/Alarm.jsx">Время</span>
              <input type="time" className="input" value={panelData.time}
                onChange={(e) => setPanelData({ ...panelData, time: e.target.value })}
                aria-label="Время будильника"
                data-easytag="id20-react/src/pages/Alarm.jsx" />
            </label>

            <div className="field" data-easytag="id21-react/src/pages/Alarm.jsx">
              <span className="field-label" data-easytag="id22-react/src/pages/Alarm.jsx">Повтор</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }} data-easytag="id23-react/src/pages/Alarm.jsx">
                {[0,1,2,3,4,5,6].map((d) => {
                  const on = (panelData.days || []).indexOf(d) >= 0;
                  return (
                    <button key={d} type="button" className="btn btn-secondary" aria-pressed={on}
                      onClick={() => {
                        const list = panelData.days || [];
                        const idx = list.indexOf(d);
                        let next = list.slice();
                        if (idx >= 0) next.splice(idx, 1); else next.push(d);
                        next.sort((a, b) => a - b);
                        setPanelData({ ...panelData, days: next });
                      }}
                      aria-label={dayName(d)}
                      data-easytag={`id24-${d}-react/src/pages/Alarm.jsx`}
                    >{dayName(d)}</button>
                  );
                })}
              </div>
            </div>

            <label className="field" data-easytag="id25-react/src/pages/Alarm.jsx">
              <span className="field-label" data-easytag="id26-react/src/pages/Alarm.jsx">Метка</span>
              <input type="text" className="input" value={panelData.label}
                onChange={(e) => setPanelData({ ...panelData, label: e.target.value })}
                placeholder="Будильник"
                aria-label="Метка будильника"
                data-easytag="id27-react/src/pages/Alarm.jsx" />
            </label>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} data-easytag="id28-react/src/pages/Alarm.jsx">
              <button className="btn btn-secondary" onClick={() => setShowPanel(false)} aria-label="Отмена" data-easytag="id29-react/src/pages/Alarm.jsx">Отмена</button>
              <button className="btn btn-primary" onClick={savePanel} aria-label="Сохранить" data-easytag="id30-react/src/pages/Alarm.jsx">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {ringingId !== null && (
        <div role="dialog" aria-modal="true" className="card" style={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 60, borderColor: 'var(--danger)' }} data-easytag="id31-react/src/pages/Alarm.jsx">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }} data-easytag="id32-react/src/pages/Alarm.jsx">
            <div data-easytag="id33-react/src/pages/Alarm.jsx">
              <div style={{ fontSize: 18, marginBottom: 4 }} data-easytag="id34-react/src/pages/Alarm.jsx">Будильник</div>
              <div style={{ color: 'var(--text-dim)' }} data-easytag="id35-react/src/pages/Alarm.jsx">Звенит...</div>
            </div>
            <button className="btn" style={{ background: 'var(--danger)' }} onClick={stopRinging} aria-label="Остановить" data-easytag="id36-react/src/pages/Alarm.jsx">Остановить</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alarm;
