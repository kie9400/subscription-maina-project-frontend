import React, { useEffect, useState, useRef } from 'react';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from '../styles/MainPage.module.css';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import gamePassBanner from '../assets/images/gamePassBanner.png';
import netflixBanner from '../assets/images/netflixBanner.png';
import shinsegaeBanner from '../assets/images/shinsegaeBanner.png';
const BASE_URL = import.meta.env.VITE_S3_URL;

const MainPage = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentBanner, setCurrentBanner] = useState(0);
    const bannerInterval = useRef(null);
    
    const banners = [
        { id: 0, image: netflixBanner, link: '/platforms/1' },
        { id: 1, image: shinsegaeBanner, link: '/platforms/22' },
        { id: 2, image: gamePassBanner, link: '/platforms/28' },
    ];

    useEffect(() => {
        bannerInterval.current = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 15000); // 15초 마다 자동으로 회전

        return () => clearInterval(bannerInterval.current);
    }, []);
    
    const handleBannerClick = (link) => {
        navigate(link);
    };

    const handlePrevBanner = (e) => {
        e.stopPropagation(); 
        e.preventDefault();
        setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
        clearInterval(bannerInterval.current);
        bannerInterval.current = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 15000);
    };
    
    const handleNextBanner = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentBanner(prev => (prev + 1) % banners.length);
        clearInterval(bannerInterval.current);
        bannerInterval.current = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 15000);
    };

    // React Query로 데이터 가져오기
    const { data, isLoading, error, isSuccess } = useQuery({
        queryKey: ['mainPageData', isLoggedIn],
        queryFn: async () => {
            const response = await instance.get(`/main`);
            return response.data.data;
        }
    });

    //React Query v5에서 useQuery()로부터 isSuccess를 꺼내 쓰려면 직접 구조 분해 해야 한다.
    useEffect(() => {
        if (isSuccess && data?.categories) {
          queryClient.setQueryData(['categories'], data.categories);
        }
      }, [isSuccess, data]);

    
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
    const ageBasedPlatforms = data?.ageBasedPlatforms || [];

    const handleCategoryClick = (categoryId) => {
        navigate(`/platforms?categoryId=${categoryId}`);
    };

    return (
        <div className={styles.mainContainer}>
            <section className={styles.bannerSection}>
                <div className={styles.bannerContainer}>
                    {banners.map((banner, index) => (
                        <div 
                            key={banner.id}
                            className={`${styles.banner} ${currentBanner === index ? styles.activeBanner : ''}`}
                            onClick={() => handleBannerClick(banner.link)}
                        >
                            <img 
                                src={banner.image} 
                                alt={`Banner ${index + 1}`}
                                className={styles.bannerImage}
                            />
                        </div>
                    ))}
                    
                    <div className={styles.bannerControls}>
                        <button 
                            className={styles.navButton} 
                            onClick={handlePrevBanner}
                            aria-label="이전 배너"
                        >
                            &lt;
                        </button>
                        <div className={styles.navDivider}></div>
                        <button 
                            className={`${styles.navButton} ${styles.navButtonRight}`} 
                            onClick={handleNextBanner}
                            aria-label="다음 배너"
                        >
                            &gt;
                        </button>
                    </div>
                    
                    <div className={styles.bannerDots}>
                        {banners.map((banner, index) => (
                            <span 
                                key={`dot-${banner.id}`}
                                className={`${styles.dot} ${currentBanner === index ? styles.activeDot : ''}`}
                                onClick={() => setCurrentBanner(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>
            
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
                    인기 구독 서비스 목록
                </h2>
                <div className={styles.platformGrid}>
                    {platforms.map((platform) => (
                        <Card key={platform.platformId} className={styles.platformCard}
                        onClick={() => navigate(`/platforms/${platform.platformId}`)}>
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
                {isLoggedIn && (
                    <>
                        <h2 className={styles.sectionTitle}>
                            맞춤형 추천 구독 서비스 목록(나이, 성별)
                        </h2>
                        {ageBasedPlatforms.length > 0 ? (
                            <div className={styles.platformGrid}>
                                {ageBasedPlatforms.map((platform) => (
                                    <Card key={platform.platformId} className={styles.platformCard}
                                    onClick={() => navigate(`/platforms/${platform.platformId}`)}>
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
                        ) : (
                            <p className={styles.noData}>아직 맞춤형 추천 구독 서비스가 없습니다.</p>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default MainPage;
