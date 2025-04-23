import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import Logo from '../assets/images/logo.png';
import listIcon from '../assets/images/List.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <Link to="/">
            <img src={Logo} className={styles.logo} alt="구독매니아 로고" />
          </Link>
          <nav className={styles.navLinks}>
            {isLoggedIn ? (
              <>
                <Link to="/" onClick={handleLogout} className={styles.navLink}>
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
      <div className={styles.lineContainer}>
        <div className={styles.line}>
          <div ref={menuRef} className={styles.menuWrapper}>
            <button 
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img src={listIcon} alt="메뉴" className={styles.menuIcon} />
              <span>메뉴</span>
            </button>
            {isMenuOpen && (
              <div className={styles.menuDropdown}
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Link to="/platforms" className={styles.menuItem}>전체</Link>
                <Link to="/platforms?categoryId=1" className={styles.menuItem}>문화</Link>
                <Link to="/platforms?categoryId=2" className={styles.menuItem}>도서</Link> 
                <Link to="/platforms?categoryId=3" className={styles.menuItem}>교육</Link>
                <Link to="/platforms?categoryId=4" className={styles.menuItem}>음악</Link>
                <Link to="/platforms?categoryId=5" className={styles.menuItem}>쇼핑</Link>
                <Link to="/platforms?categoryId=6" className={styles.menuItem}>배달</Link>
                <Link to="/platforms?categoryId=7" className={styles.menuItem}>기타</Link>
                {
                  isLoggedIn ? (
                    <>
                      <div className={styles.menuDivider}></div>
                      <Link to="/subscription" className={`${styles.menuItem} ${styles.menuItemGray}`}>
                        구독 등록
                      </Link>
                      <Link to="/mypage" className={`${styles.menuItem} ${styles.menuItemGray}`}>마이페이지</Link>
                    </>
                  ) : null
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
