import React from 'react';
import styles from '../styles/Input.module.css';

const Input = ({
  label,                // input 위에 표시될 라벨
  type = 'text',        // input 타입 (text, password, email 등)
  placeholder,          // placeholder 텍스트
  value,               // input 값
  onChange,            // 값 변경 시 호출될 함수
  name,                // input의 name 속성
  error,               // 에러 메시지
  required = false,    // 필수 입력 여부
  disabled = false     // 비활성화 상태
}) => {
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        className={`${styles.input} ${error ? styles.error : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        disabled={disabled}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Input; 