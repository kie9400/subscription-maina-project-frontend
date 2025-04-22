import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Dropdown.module.css';

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder = '선택해주세요',
  error,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div 
        className={`${styles.dropdown} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.selected}>
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}></span>
      </div>
      {isOpen && !disabled && (
        <ul className={styles.options}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Dropdown; 