import React, { useEffect, useState } from 'react';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import styles from '../styles/MainPage.module.css';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
const BASE_URL = 'http://localhost:8080';

const MainPage = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // React Query로 데이터 가져오기
    const { data, isLoading, error } = useQuery({
        queryKey: ['mainPageData', isLoggedIn], // isLoggedIn이 바뀔 때마다 다시 fetch
        queryFn: async () => {
            const response = await instance.get(`/main`);
            return response.data.data;
        }
    });

    if (isLoading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    if (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        return <div className={styles.error}>데이터를 불러오는데 실패했습니다.</div>;
    }

    // data가 있으면 categories와 platforms 사용
    const categories = data?.categories || [];
    const platforms = data?.platforms || [];

    const handleCategoryClick = (categoryId) => {
        navigate(`/platforms?categoryId=${categoryId}`);
    };

    return (
        <div className={styles.mainContainer}>
            <section className={styles.categorySection}>
                <h2 className={styles.sectionTitle}>전체 카테고리</h2>
                <div className={styles.categoryGrid}>
                    {categories.map((category) => (
                        <Card 
                            key={category.categoryId} 
                            className={styles.categoryCard}
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            <img 
                                src={`${BASE_URL}${category.categoryImage}`}
                                alt={category.categoryName}
                                className={styles.categoryImage}
                            />
                            <p className={styles.categoryName}>{category.categoryName}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className={styles.platformSection}>
                <h2 className={styles.sectionTitle}>
                    {isLoggedIn ? '맞춤형 추천 구독 서비스' : '인기 구독 서비스'}
                </h2>
                <div className={styles.platformGrid}>
                    {platforms.map((platform) => (
                        <Card key={platform.platformId} className={styles.platformCard}>
                            <img 
                                src={`${BASE_URL}${platform.platformImage}`}
                                alt={platform.platformName}
                                className={styles.platformImage}
                            />
                            <p className={styles.platformName}>{platform.platformName}</p>
                            {platform.ratingAvg >= 0 && (
                                <div className={styles.rating}>
                                    {platform.ratingAvg > 0 
                                        ? `평점: ${platform.ratingAvg.toFixed(1)}`
                                        : '평점: 없음'
                                    }
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MainPage;
