import React from 'react';
import styles from '../styles/Button.module.css';

const Button = ({ 
  children,              // 버튼 안에 들어갈 내용
  variant = 'primary',   // 버튼 스타일: primary / secondary / outline
  size = 'medium',       // 버튼 크기: small / medium / large
  fullWidth = false,     // 버튼이 가로로 꽉 차게 만들지 여부
  onClick,               // 버튼 클릭 시 실행할 함수
  type = 'button',       // 버튼 타입: submit / button / reset
  disabled = false       // 비활성화 상태 여부
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : ''
  ].join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button; 