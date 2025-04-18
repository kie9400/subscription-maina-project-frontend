import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './MainPage.module.css';

const BASE_URL = 'http://localhost:8080';

const MainPage = () => {
    const [categories, setCategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/main`);
                setCategories(response.data.data.categories);
                setPlatforms(response.data.data.platforms);
            } catch (error) {
                console.error('데이터 로딩 중 오류 발생:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={styles.mainContainer}>
            <section className={styles.categorySection}>
                <h2 className={styles.sectionTitle}>전체 카테고리</h2>
                <div className={styles.categoryGrid}>
                    {categories.map((category) => (
                        <div key={category.categoryId} className={styles.categoryCard}>
                            <img 
                                src={`${BASE_URL}${category.categoryImage}`}
                                alt={category.categoryName}
                                className={styles.categoryImage}
                            />
                            <p className={styles.categoryName}>{category.categoryName}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.platformSection}>
                <h2 className={styles.sectionTitle}>플랫폼 구독 서비스</h2>
                <div className={styles.platformGrid}>
                    {platforms.map((platform) => (
                        <div key={platform.platformId} className={styles.platformCard}>
                            <img 
                                src={`${BASE_URL}${platform.platformImage}`}
                                alt={platform.platformName}
                                className={styles.platformImage}
                            />
                            <p className={styles.platformName}>{platform.platformName}</p>
                            {platform.ratingAvg > 0 && (
                                <div className={styles.rating}>
                                    평점: {platform.ratingAvg.toFixed(1)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MainPage;

