import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import SearchBox from '../components/SearchBox';
import styles from '../styles/PlatformListPage.module.css';

const PlatformListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get('/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('카테고리 목록 조회 실패:', error);
      }
    };
    fetchCategories();
  }, []);

  // URL 파라미터 처리
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    const category = searchParams.get('categoryId');
    const keyword = searchParams.get('keyword') || '';
    const sort = searchParams.get('sort') || '';

    setCurrentPage(Number(page));
    setSelectedCategory(category ? Number(category) : null);
    setSearchKeyword(keyword);
    setSortBy(sort);
  }, [searchParams]);

  // 플랫폼 목록 가져오기
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const params = {
          page: currentPage,
          size: 12
        };

        if (searchKeyword) params.keyword = searchKeyword;
        if (sortBy) params.sort = sortBy;
        if (selectedCategory) params.categoryId = selectedCategory;

        const queryString = new URLSearchParams(params).toString();
        const response = await instance.get(`/platforms?${queryString}`);
        
        setPlatforms(response.data.data);
        setTotalPages(response.data.pageInfo.totalPages);
      } catch (error) {
        console.error('플랫폼 목록 조회 실패:', error);
      }
    };

    fetchPlatforms();
  }, [currentPage, selectedCategory, sortBy, searchKeyword]);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    updateSearchParams({ keyword, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateSearchParams({ page: newPage });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateSearchParams({ sort: newSort, page: 1 });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateSearchParams({ categoryId, page: 1 });
  };

  const updateSearchParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const updatedParams = {
      ...currentParams,
      ...newParams
    };

    // 빈 값이나 기본값은 URL에서 제거
    Object.keys(updatedParams).forEach(key => {
      if (!updatedParams[key] || 
          (key === 'page' && updatedParams[key] === '1') ||
          (key === 'size' && updatedParams[key] === '12')) {
        delete updatedParams[key];
      }
    });

    setSearchParams(updatedParams);
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return '전체';
    const category = categories.find(cat => cat.categoryId === selectedCategory);
    return category ? category.categoryName : '전체';
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>플랫폼 서비스</h1>
      
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>별점</h3>
            <div className={styles.ratingFilters}>
              {[5,4,3,2,1].map((rating) => (
                <label key={rating} className={styles.ratingLabel}>
                  <input
                    type="checkbox"
                    checked={selectedRating === String(rating)}
                    onChange={() => setSelectedRating(String(rating))}
                  />
                  <span className={styles.stars}>{'★'.repeat(rating) + '☆'.repeat(5-rating)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>카테고리</h3>
            <div className={styles.categoryFilters}>
              <label className={styles.categoryLabel}>
                <input
                  type="radio"
                  name="category"
                  checked={!selectedCategory}
                  onChange={() => handleCategoryChange(null)}
                />
                전체
              </label>
              {categories.map((category) => (
                <label key={category.categoryId} className={styles.categoryLabel}>
                  <input
                    type="radio"
                    name="category"
                    value={category.categoryId}
                    checked={selectedCategory === category.categoryId}
                    onChange={(e) => handleCategoryChange(Number(e.target.value))}
                  />
                  {category.categoryName}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.topBar}>
            <h2 className={styles.categoryTitle}>{getSelectedCategoryName()}</h2>
            <div className={styles.controls}>
              <SearchBox 
                onSearch={handleSearch}
                initialKeyword={searchKeyword}
                placeholder="플랫폼 검색"
              />
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className={styles.sortSelect}
              >
                <option value="">정렬 기준</option>
                <option value="review">리뷰순</option>
                <option value="rating">평점순</option>
              </select>
            </div>
          </div>

          <div className={styles.platformGrid}>
            {platforms.map((platform) => (
              <div key={platform.platformId} className={styles.platformCard}>
                <img 
                  src={`${instance.defaults.baseURL}${platform.platformImage}`}
                  alt={platform.platformName} 
                  className={styles.platformImage}
                />
                <h3 className={styles.platformName}>{platform.platformName}</h3>
                {platform.ratingAvg > 0 && (
                  <div className={styles.rating}>
                    평점: {platform.ratingAvg.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.activePage : ''
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformListPage;
