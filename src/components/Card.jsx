import React from 'react';
import styles from '../styles/Card.module.css';

const Card = ({ children, className, onClick }) => {
    return (
        <div 
            className={`${styles.card} ${className || ''} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card; 