import React from 'react';

function ToggleSwitch({ checked, onChange, ariaLabel, dataTag }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="btn"
      style={{
        background: checked ? 'linear-gradient(180deg, #2dd46f, #20b25c)' : '#2b2f36',
        padding: '8px 14px',
        borderRadius: '14px'
      }}
      data-easytag={dataTag}
    >
      {checked ? 'Вкл' : 'Выкл'}
    </button>
  );
}

export default ToggleSwitch;
