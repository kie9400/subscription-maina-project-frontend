import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import Logo from '../assets/images/logo.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isLoggedIn, isAdmin, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerWrapper}>
        <Link to="/">
          <img src={Logo} className={styles.logo} alt="구독매니아 로고" />
        </Link>
        <nav className={styles.navLinks}>
          {isLoggedIn ? (
            <>
              <Link to="/" onClick={logout} className={styles.navLink}>
                로그아웃
              </Link>
              {isAdmin ? (
                <Link to="/admin" className={styles.navLink}>
                  관리자페이지
                </Link>
              ) : (
                <Link to="/mypage" className={styles.navLink}>
                  마이페이지
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                로그인
              </Link>
              <Link to="/signup" className={styles.navLink}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
