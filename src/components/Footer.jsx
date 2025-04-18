import React from 'react';
import style from '../styles/Footer.module.css';
import Logo from '../assets/images/logo.png';

const Footer = () => {
    return (
        <footer className={style.footer}>
            <div className={style.footerContent}>
                <div className={style.logoSection}>
                    <img src={Logo} className={style.logo} />
                </div>
                <div className={style.copyrightSection}>
                     © 2025 Subs Mania. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;