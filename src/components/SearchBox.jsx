import React, { useState } from 'react';
import styles from '../styles/SearchBox.module.css';

const SearchBox = ({ onSearch, initialKeyword = '', placeholder = '검색하세요' }) => {
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      <button onClick={handleSubmit} className={styles.searchButton}>
        검색
      </button>
    </div>
  );
};

export default SearchBox; 