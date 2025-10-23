import React from 'react';

function CalcKey({ label, onClick, className, ariaLabel, dataTag }) {
  return (
    <button
      type="button"
      className={`key ${className ? className : ''}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
      data-easytag={dataTag}
    >
      {label}
    </button>
  );
}

export default CalcKey;
