import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import Logo from '../assets/images/logo.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerWrapper}>
        <Link to="/">
          <img src={Logo} className={styles.logo} alt="구독매니아 로고" />
        </Link>
        <nav className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>로그인</Link>
          <Link to="/signup" className={styles.navLink}>회원가입</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
