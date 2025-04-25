import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { instance } from '../api/axiosInstance';
import styles from '../styles/SubscriptionRegisterPage.module.css';

const PlatformSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // 카테고리 목록 조회
    const { data: categories = [] } = useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const res = await instance.get('/categories');
        return res.data.data;
      }
    });

    // 플랫폼 검색 쿼리
    const { data: platformData = { data: [], pageInfo: { totalPages: 0 } }, isLoading } = useQuery({
      queryKey: ['platforms', searchTerm, selectedCategory],
      queryFn: async () => {
        const params = {
          page: 1,
          size: 50
        };
        if (searchTerm) params.keyword = searchTerm;
        if (selectedCategory) params.categoryId = selectedCategory;
        
        const queryString = new URLSearchParams(params).toString();
        const response = await instance.get(`/platforms?${queryString}`);
        return response.data;
      }
    });
  
    const platforms = platformData.data;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>구독한 플랫폼 찾기</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <span role="img" aria-label="검색"></span>
            </button>
          </div>
          
          <div className={styles.categoryGrid}>
            <div 
              className={`${styles.categoryCard} ${selectedCategory === null ? styles.active : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className={styles.categoryCircle}>전체</div>
              <p className={styles.categoryName}>전체</p>
            </div>
            
            {categories?.map(category => (
              <div
                key={category.categoryId}
                className={`${styles.categoryCard} ${selectedCategory === category.categoryId ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.categoryId)}
              >
                <div className={styles.categoryCircle}>{
                      <img 
                          src={`${instance.defaults.baseURL}${category.categoryImage}`} 
                          alt={category.categoryName} 
                          className={styles.categoryImage}
                      />}
                </div>
                <p className={styles.categoryName}>{category.categoryName}</p>
              </div>
            ))}
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.platformList}>
            {isLoading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : platforms?.length === 0 ? (
              <div className={styles.noResults}>검색 결과가 없습니다.</div>
            ) : (
              platforms?.map(platform => (
                <div 
                  key={platform.platformId} 
                  className={styles.platformItem}
                  onClick={() => onSelect(platform)}
                >
                  <img 
                    src={`${instance.defaults.baseURL}${platform.platformImage}`} 
                    alt={platform.platformName} 
                    className={styles.platformImage}
                  />
                  <div className={styles.platformInfo}>
                    <h3 className={styles.platformName}>{platform.platformName}</h3>
                    <p className={styles.platformCategory}>{platform.categoryName}</p>
                  </div>
                  <button 
                    className={styles.selectButton}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      onSelect(platform);
                    }}
                  >
                    선택
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
};

export default PlatformSearchModal; 