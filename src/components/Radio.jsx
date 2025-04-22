import React from 'react';
import styles from '../styles/Radio.module.css';

const Radio = ({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label className={styles.radioLabel}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.radioInput}
      />
      <span className={styles.radioButton}></span>
      <span className={styles.radioText}>{label}</span>
    </label>
  );
};

export default Radio; 