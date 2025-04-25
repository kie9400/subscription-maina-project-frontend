import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import SearchBox from '../components/SearchBox';
import styles from '../styles/PlatformListPage.module.css';
const BASE_URL = import.meta.env.VITE_S3_URL;

const PlatformListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);

  // URL 파라미터 처리
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    const category = searchParams.get('categoryId');
    const keyword = searchParams.get('keyword') || '';
    const sort = searchParams.get('sort') || '';
    const rating = searchParams.get('rating') || null;

    setCurrentPage(Number(page));
    setSelectedCategory(category ? Number(category) : null);
    setSearchKeyword(keyword);
    setSortBy(sort);
    setSelectedRating(rating);
    
    window.scrollTo(0, 0);
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    //캐시가없다면 qureyFn 실행
    queryFn: async () => {
      const res = await instance.get('/categories');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: platformData = { data: [], pageInfo: { totalPages: 0 } }, isLoading, error } = useQuery({
    queryKey: ['platforms', currentPage, selectedCategory, searchKeyword, sortBy, selectedRating],
    queryFn: async () => {
      const params = {
        page: currentPage,
        size: 12,
      };
      if (searchKeyword) params.keyword = searchKeyword;
      if (sortBy) params.sort = sortBy;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedRating) params.rating = selectedRating;

      const queryString = new URLSearchParams(params).toString();
      const res = await instance.get(`/platforms?${queryString}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const platforms = platformData.data;
  const totalPages = platformData.pageInfo.totalPages;

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
    return <div className={styles.error}>데이터를 불러오는데 실패했습니다.</div>;
  }

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

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    updateSearchParams({ rating: newRating, page: 1 });
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
      <h1 className={styles.title} onClick={() => window.location.href = '/platforms'}>플랫폼 서비스 목록</h1>
      
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
                    onChange={() => handleRatingChange(String(rating))}
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
              <div key={platform.platformId} className={styles.platformCard} 
              onClick={() => navigate(`/platforms/${platform.platformId}`)}>
                <img 
                  src={`${BASE_URL}${platform.platformImage}`}
                  alt={platform.platformName} 
                  className={styles.platformImage}
                />
                <h3 className={styles.platformName}>{platform.platformName}</h3>
                {platform.ratingAvg >= 0 && (
                  <div className={styles.rating}>
                    <span className={styles.stars}>
                      {Array.from({ length: 5 }, (_, index) => {
                        const starValue = index + 1;
                        if (starValue <= platform.ratingAvg) {
                          return '★'; 
                        } else if (starValue - 0.5 <= platform.ratingAvg) {
                          return '★'; // 반 별
                        } else {
                          return '☆'; // 빈 별
                        }
                      }).join('')}
                    </span>
                    <span className={styles.ratingNumber}>
                      ({platform.ratingAvg.toFixed(1)})
                    </span>
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
