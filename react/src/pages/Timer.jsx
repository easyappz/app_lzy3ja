import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function pad2(n) {
  const s = String(n);
  if (s.length === 1) return '0' + s;
  return s;
}

function Timer() {
  const [min, setMin] = useState(0);
  const [sec, setSec] = useState(10);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(10000);
  const [endAt, setEndAt] = useState(null);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/sounds/alarm-default.mp3');
    audio.loop = false;
    audioRef.current = audio;
  }, []);

  const playFinish = useCallback(() => {
    let count = 0;
    const playOnce = () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Fallback: WebAudio short beep
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.08;
          osc.type = 'square';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 400);
        } catch (_) {}
      });
    };
    playOnce();
    const id = window.setInterval(() => {
      count += 1;
      if (count >= 3) {
        window.clearInterval(id);
        return;
      }
      playOnce();
    }, 800);
  }, []);

  const totalMs = useMemo(() => clamp(min, 0, 599) * 60000 + clamp(sec, 0, 59) * 1000, [min, sec]);

  useEffect(() => {
    if (!running || paused) return;
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      const left = endAt - Date.now();
      setRemaining(left > 0 ? left : 0);
      if (left <= 0) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        setPaused(false);
        setDone(true);
        playFinish();
      }
    }, 200);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, paused, endAt, playFinish]);

  const onStart = useCallback(() => {
    if (totalMs <= 0) return;
    setDone(false);
    setRunning(true);
    setPaused(false);
    const e = Date.now() + totalMs;
    setEndAt(e);
    setRemaining(totalMs);
  }, [totalMs]);

  const onPause = useCallback(() => {
    if (!running || paused) return;
    setPaused(true);
    setRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [running, paused]);

  const onResume = useCallback(() => {
    if (running || !paused) return;
    setRunning(true);
    setPaused(false);
    const e = Date.now() + remaining;
    setEndAt(e);
  }, [running, paused, remaining]);

  const onReset = useCallback(() => {
    setRunning(false);
    setPaused(false);
    setDone(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const ms = clamp(min, 0, 599) * 60000 + clamp(sec, 0, 59) * 1000;
    setRemaining(ms);
  }, [min, sec]);

  useEffect(() => {
    setRemaining(totalMs);
  }, [totalMs]);

  const minsLeft = Math.floor(remaining / 60000);
  const secsLeft = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="page" data-easytag="id1-react/src/pages/Timer.jsx">
      <div className="card timer-card" data-easytag="id2-react/src/pages/Timer.jsx">
        <div className="timer-display" aria-live="polite" data-easytag="id3-react/src/pages/Timer.jsx">{pad2(minsLeft)}:{pad2(secsLeft)}</div>
        <div className="timer-setup" data-easytag="id4-react/src/pages/Timer.jsx">
          <div className="field" data-easytag="id5-react/src/pages/Timer.jsx">
            <span className="field-label" data-easytag="id6-react/src/pages/Timer.jsx">Минуты</span>
            <div style={{ display: 'flex', gap: 8 }} data-easytag="id7-react/src/pages/Timer.jsx">
              <button className="btn btn-secondary" aria-label="Убавить минуты" onClick={() => setMin((v) => clamp(v - 1, 0, 599))} data-easytag="id8-react/src/pages/Timer.jsx">−</button>
              <input type="number" className="input" min={0} max={599} value={min}
                onChange={(e) => setMin(clamp(Number(e.target.value), 0, 599))}
                aria-label="Минуты"
                data-easytag="id9-react/src/pages/Timer.jsx" />
              <button className="btn btn-secondary" aria-label="Прибавить минуты" onClick={() => setMin((v) => clamp(v + 1, 0, 599))} data-easytag="id10-react/src/pages/Timer.jsx">+</button>
            </div>
          </div>
          <div className="field" data-easytag="id11-react/src/pages/Timer.jsx">
            <span className="field-label" data-easytag="id12-react/src/pages/Timer.jsx">Секунды</span>
            <div style={{ display: 'flex', gap: 8 }} data-easytag="id13-react/src/pages/Timer.jsx">
              <button className="btn btn-secondary" aria-label="Убавить секунды" onClick={() => setSec((v) => clamp(v - 1, 0, 59))} data-easytag="id14-react/src/pages/Timer.jsx">−</button>
              <input type="number" className="input" min={0} max={59} value={sec}
                onChange={(e) => setSec(clamp(Number(e.target.value), 0, 59))}
                aria-label="Секунды"
                data-easytag="id15-react/src/pages/Timer.jsx" />
              <button className="btn btn-secondary" aria-label="Прибавить секунды" onClick={() => setSec((v) => clamp(v + 1, 0, 59))} data-easytag="id16-react/src/pages/Timer.jsx">+</button>
            </div>
          </div>
        </div>

        <div className="timer-actions" data-easytag="id17-react/src/pages/Timer.jsx">
          {!running && !paused && !done && (
            <button className="btn btn-primary" onClick={onStart} aria-label="Старт" data-easytag="id18-react/src/pages/Timer.jsx">Старт</button>
          )}
          {running && (
            <button className="btn btn-secondary" onClick={onPause} aria-label="Пауза" data-easytag="id19-react/src/pages/Timer.jsx">Пауза</button>
          )}
          {!running && paused && !done && (
            <button className="btn btn-primary" onClick={onResume} aria-label="Возобновить" data-easytag="id20-react/src/pages/Timer.jsx">Возобновить</button>
          )}
          {!running && !paused && !done && (
            <button className="btn btn-secondary" onClick={onReset} aria-label="Сброс" data-easytag="id21-react/src/pages/Timer.jsx">Сброс</button>
          )}
          {done && (
            <button className="btn" style={{ background: 'var(--accent)' }} onClick={() => { setDone(false); }} aria-label="ОК" data-easytag="id22-react/src/pages/Timer.jsx">ОК</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timer;
