import React from 'react';
import style from '../styles/Footer.module.css';
import Logo from '../assets/images/logo3.png';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className={style.footer}>
            <div className={style.footerContent}>
                <div className={style.logoSection}>
                    <img src={Logo} className={style.logo} alt="Subs Mania Logo" />
                </div>
                <div className={style.linksSection}>
                    <Link to="/about" className={style.footerLink}>회사소개</Link>
                    <Link to="/terms" className={style.footerLink}>이용약관 및 규칙</Link>
                    <Link to="/careers" className={style.footerLink}>채용안내</Link>
                    <Link to="/customer-service" className={style.footerLink}>고객센터</Link>
                    <Link to="/privacy" className={style.footerLink}>개인정보처리방침</Link>
                </div>
                <div className={style.copyrightSection}>
                    © 2025 Subs Mania. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;