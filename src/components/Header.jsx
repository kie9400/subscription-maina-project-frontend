import React from 'react';
import styles from '../styles/Header.module.css';
import Logo from '../assets/images/logo.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerWrapper}>
        <img src={Logo} className={styles.logo} alt="구독매니아 로고" />
        <nav className={styles.navLinks}>
          <a href="/login" className={styles.navLink}>로그인</a>
          <a href="/signup" className={styles.navLink}>회원가입</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
