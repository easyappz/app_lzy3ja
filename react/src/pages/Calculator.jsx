import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CalcKey from '../components/CalcKey';

function replaceAllChar(value, fromChar, toChar) {
  const parts = value.split(fromChar);
  return parts.join(toChar);
}

function trimDecimalZeros(value) {
  // Works for plain decimals (not for scientific notation); no regex used
  if (value.indexOf('e') >= 0 || value.indexOf('E') >= 0) {
    return value;
  }
  if (value.indexOf('.') === -1) return value;
  let out = value;
  while (out.length > 0 && out[out.length - 1] === '0') {
    out = out.slice(0, out.length - 1);
  }
  if (out.length > 0 && out[out.length - 1] === '.') {
    out = out.slice(0, out.length - 1);
  }
  return out;
}

function formatNumber(n) {
  if (!isFinite(n)) {
    return '∞';
  }
  const abs = Math.abs(n);
  let s;
  if (abs >= 1e12 || (abs !== 0 && abs < 1e-6)) {
    // Use toPrecision for very large/small numbers
    s = n.toPrecision(12);
  } else {
    // Use toFixed then trim zeros
    s = Number(n).toPrecision(15);
  }
  // Convert to normal decimal where possible
  const num = Number(s);
  if (isFinite(num)) {
    s = num.toString();
  }
  s = trimDecimalZeros(s);
  s = replaceAllChar(s, '.', ',');
  return s;
}

function toNumberFromDisplay(display) {
  const normalized = replaceAllChar(display, ',', '.');
  const n = Number(normalized);
  if (Number.isNaN(n)) return 0;
  return n;
}

function compute(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? Infinity : a / b;
  return b;
}

const ops = ['÷', '×', '-', '+'];

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastOp, setLastOp] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);

  const pressDigit = useCallback((d) => {
    setDisplay((prev) => {
      if (!isTyping) {
        setIsTyping(true);
        return String(d);
      }
      if (prev === '0') return String(d);
      return prev + String(d);
    });
  }, [isTyping]);

  const pressComma = useCallback(() => {
    setDisplay((prev) => {
      if (!isTyping) {
        setIsTyping(true);
        return '0,';
      }
      if (prev.indexOf(',') === -1) return prev + ',';
      return prev;
    });
  }, [isTyping]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setIsTyping(false);
    setLastOp(null);
    setLastOperand(null);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    setIsTyping(false);
  }, []);

  const negate = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0') return '0';
      const n = -toNumberFromDisplay(prev);
      return formatNumber(n);
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay((prev) => {
      const current = toNumberFromDisplay(prev);
      if (acc !== null && op) {
        const v = acc * (current / 100);
        setIsTyping(false);
        return formatNumber(v);
      }
      const v = current / 100;
      setIsTyping(false);
      return formatNumber(v);
    });
  }, [acc, op]);

  const pressOperator = useCallback((nextOp) => {
    setDisplay((prev) => {
      const current = toNumberFromDisplay(prev);
      if (acc === null) {
        setAcc(current);
      } else if (op && isTyping) {
        const result = compute(acc, current, op);
        setAcc(result);
        const disp = formatNumber(result);
        setIsTyping(false);
        setOp(nextOp);
        return disp;
      }
      setIsTyping(false);
      setOp(nextOp);
      return formatNumber(acc === null ? current : acc);
    });
  }, [acc, op, isTyping]);

  const equals = useCallback(() => {
    setDisplay((prev) => {
      let a = acc;
      let b;
      if (op !== null) {
        b = isTyping ? toNumberFromDisplay(prev) : (lastOperand !== null ? lastOperand : toNumberFromDisplay(prev));
        if (a === null) a = 0;
        const result = compute(a, b, op);
        setAcc(result);
        setLastOp(op);
        setLastOperand(b);
        setOp(null);
        setIsTyping(false);
        return formatNumber(result);
      }
      if (lastOp !== null && lastOperand !== null) {
        a = toNumberFromDisplay(prev);
        b = lastOperand;
        const result = compute(a, b, lastOp);
        setAcc(result);
        setIsTyping(false);
        return formatNumber(result);
      }
      return prev;
    });
  }, [acc, op, isTyping, lastOp, lastOperand]);

  const backspace = useCallback(() => {
    setDisplay((prev) => {
      if (!isTyping) return prev;
      if (prev.length <= 1) return '0';
      const next = prev.slice(0, prev.length - 1);
      if (next === '-' || next === '' || next === '-0') return '0';
      return next;
    });
  }, [isTyping]);

  const clearLabel = useMemo(() => {
    if (isTyping && display !== '0') return 'C';
    if (!isTyping && (display !== '0' || acc !== null || op !== null)) return 'C';
    return 'AC';
  }, [display, isTyping, acc, op]);

  const handleClear = useCallback(() => {
    if (clearLabel === 'AC') clearAll();
    else clearEntry();
  }, [clearLabel, clearAll, clearEntry]);

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key;
      if (key >= '0' && key <= '9') {
        e.preventDefault();
        pressDigit(key);
        return;
      }
      if (key === ',' || key === '.') {
        e.preventDefault();
        pressComma();
        return;
      }
      if (key === '+') { e.preventDefault(); pressOperator('+'); return; }
      if (key === '-') { e.preventDefault(); pressOperator('-'); return; }
      if (key === '*') { e.preventDefault(); pressOperator('×'); return; }
      if (key === '/') { e.preventDefault(); pressOperator('÷'); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); equals(); return; }
      if (key === 'Backspace') { e.preventDefault(); backspace(); return; }
      if (key === 'Escape') { e.preventDefault(); clearAll(); return; }
      if (key === '%') { e.preventDefault(); percent(); return; }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pressDigit, pressComma, pressOperator, equals, backspace, clearAll, percent]);

  const fontSize = useMemo(() => {
    const len = display.length;
    if (len <= 8) return 42;
    if (len <= 12) return 32;
    if (len <= 18) return 24;
    return 20;
  }, [display]);

  return (
    <div className="page calc" data-easytag="id1-react/src/pages/Calculator.jsx">
      <div className="calc-display" style={{ fontSize: fontSize + 'px' }} aria-live="polite" data-easytag="id2-react/src/pages/Calculator.jsx">{display}</div>
      <div className="calc-keypad" data-easytag="id3-react/src/pages/Calculator.jsx">
        <CalcKey label={clearLabel} ariaLabel={clearLabel} onClick={handleClear} className="" dataTag="id4-react/src/pages/Calculator.jsx" />
        <CalcKey label="±" onClick={negate} ariaLabel="Сменить знак" className="" dataTag="id5-react/src/pages/Calculator.jsx" />
        <CalcKey label="%" onClick={percent} ariaLabel="Процент" className="" dataTag="id6-react/src/pages/Calculator.jsx" />
        <CalcKey label="÷" onClick={() => pressOperator('÷')} ariaLabel="Деление" className="key-accent" dataTag="id7-react/src/pages/Calculator.jsx" />

        <CalcKey label="7" onClick={() => pressDigit(7)} ariaLabel="7" className="" dataTag="id8-react/src/pages/Calculator.jsx" />
        <CalcKey label="8" onClick={() => pressDigit(8)} ariaLabel="8" className="" dataTag="id9-react/src/pages/Calculator.jsx" />
        <CalcKey label="9" onClick={() => pressDigit(9)} ariaLabel="9" className="" dataTag="id10-react/src/pages/Calculator.jsx" />
        <CalcKey label="×" onClick={() => pressOperator('×')} ariaLabel="Умножение" className="key-accent" dataTag="id11-react/src/pages/Calculator.jsx" />

        <CalcKey label="4" onClick={() => pressDigit(4)} ariaLabel="4" className="" dataTag="id12-react/src/pages/Calculator.jsx" />
        <CalcKey label="5" onClick={() => pressDigit(5)} ariaLabel="5" className="" dataTag="id13-react/src/pages/Calculator.jsx" />
        <CalcKey label="6" onClick={() => pressDigit(6)} ariaLabel="6" className="" dataTag="id14-react/src/pages/Calculator.jsx" />
        <CalcKey label="-" onClick={() => pressOperator('-')} ariaLabel="Вычитание" className="key-accent" dataTag="id15-react/src/pages/Calculator.jsx" />

        <CalcKey label="1" onClick={() => pressDigit(1)} ariaLabel="1" className="" dataTag="id16-react/src/pages/Calculator.jsx" />
        <CalcKey label="2" onClick={() => pressDigit(2)} ariaLabel="2" className="" dataTag="id17-react/src/pages/Calculator.jsx" />
        <CalcKey label="3" onClick={() => pressDigit(3)} ariaLabel="3" className="" dataTag="id18-react/src/pages/Calculator.jsx" />
        <CalcKey label="+" onClick={() => pressOperator('+')} ariaLabel="Сложение" className="key-accent" dataTag="id19-react/src/pages/Calculator.jsx" />

        <CalcKey label="0" onClick={() => pressDigit(0)} ariaLabel="0" className="key-zero" dataTag="id20-react/src/pages/Calculator.jsx" />
        <CalcKey label="," onClick={pressComma} ariaLabel="Запятая" className="" dataTag="id21-react/src/pages/Calculator.jsx" />
        <CalcKey label="=" onClick={equals} ariaLabel="Равно" className="key-accent" dataTag="id22-react/src/pages/Calculator.jsx" />
      </div>
    </div>
  );
}

export default Calculator;
