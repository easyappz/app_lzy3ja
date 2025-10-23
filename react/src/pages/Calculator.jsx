import React from 'react';

function Calculator() {
  const buttons = [
    'C', '±', '%', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '−',
    '1', '2', '3', '+',
    '0', ',', '='
  ];

  return (
    <section className="page page-calculator" data-easytag="id1-react/src/pages/Calculator.jsx">
      <div className="calc" data-easytag="id2-react/src/pages/Calculator.jsx">
        <div className="calc-display" data-easytag="id3-react/src/pages/Calculator.jsx" aria-live="polite">0</div>
        <div className="calc-keypad" data-easytag="id4-react/src/pages/Calculator.jsx">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              type="button"
              className={`key ${['÷','×','−','+','=', '%'].includes(b) ? 'key-accent' : ''} ${b === '0' ? 'key-zero' : ''}`}
              data-easytag={`id${5 + idx}-react/src/pages/Calculator.jsx`}
              aria-label={`key-${b}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Calculator;
