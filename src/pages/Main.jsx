import React, { useEffect, useState } from 'react';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/MainPage.module.css';
import Card from '../components/Card';

const BASE_URL = 'http://localhost:8080';

const MainPage = () => {
    const [categories, setCategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await instance.get(`/main`);
                setCategories(response.data.data.categories);
                setPlatforms(response.data.data.platforms);
            } catch (error) {
                console.error('데이터 로딩 중 오류 발생:', error);
            }
        };

        fetchData();
    }, [isLoggedIn]);

    return (
        <div className={styles.mainContainer}>
            <section className={styles.categorySection}>
                <h2 className={styles.sectionTitle}>전체 카테고리</h2>
                <div className={styles.categoryGrid}>
                    {categories.map((category) => (
                        <Card key={category.categoryId} className={styles.categoryCard}>
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
                            {platform.ratingAvg > 0 && (
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
