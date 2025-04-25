import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import styles from '../styles/PlatformDetailPage.module.css';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PlatformDetailPage = () => {
  const { platformId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  const [editingReview, setEditingReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // 플랫폼 상세 정보 조회
  const { data: platformData, isLoading: isPlatformLoading } = useQuery({
    queryKey: ['platform', platformId],
    queryFn: async () => {
      const response = await instance.get(`/platforms/${platformId}`);
      return response.data.data;
    }
  });

  // 리뷰 목록 조회
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', platformId, currentPage],
    queryFn: async () => {
      const response = await instance.get(`/platforms/${platformId}/reviews`, {
        params: { page: currentPage, size: 10 }
      });
      return response.data;
    }
  });

  // 통계 데이터 조회
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['platformStats', platformId],
    queryFn: async () => {
      const res = await instance.get(`/platforms/${platformId}/statistics`);
      return res.data.data;
    }
  });

  // 리뷰 작성/수정 mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ reviewId, content, rating }) => {
      if (reviewId) {
        return instance.patch(`/platforms/${platformId}/reviews/${reviewId}`, { content, rating });
      }
      return instance.post(`/platforms/${platformId}/reviews`, { content, rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', platformId]);
      queryClient.invalidateQueries(['platform', platformId]);
      showToast(editingReview ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.');
      setShowReviewForm(false);
      setReviewContent('');
      setRating(5);
      setEditingReview(null);
    },
    onError: (error) => {
      console.log(error);
      if (error.response?.status === 409) {
        showToast('이미 리뷰를 등록하셨습니다.', 'error');
      } 
      else if (error.response?.status === 401) {
        showToast('로그인이 필요한 서비스입니다.', 'error');
      }
      else if (error.response?.status === 403) {
        showToast('해당 플랫폼에 구독하지 않았습니다.', 'error');
      }
      else if (error.response.data.fieldErrors[0].reason === "본문은 200자 이내이어야 합니다.") {
        showToast('200자 이내로만 작성할 수 있습니다.', 'error');
      }
      else {
        showToast('리뷰 등록에 실패했습니다.', 'error');
      }
    }
  });

  // 리뷰 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId) => instance.delete(`/platforms/${platformId}/reviews/${reviewId}`),
    onSuccess: () => {
      // 리뷰 목록 새로고침(invalidateQueries는 재요청하는 함수)
      queryClient.invalidateQueries(['reviews', platformId]);
      queryClient.invalidateQueries(['platform', platformId]);
      showToast('리뷰가 삭제되었습니다.');
    },
    onError: () => {
      showToast('리뷰 삭제에 실패했습니다.', 'error');
    }
  });

  // 리뷰 추천 mutation
  const recommendMutation = useMutation({
    mutationFn: (reviewId) => instance.post(`/platforms/${platformId}/reviews/${reviewId}/recommend`),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', platformId]);
    },
    onError: async (error, variables) => {
      const reviewId = variables;
      if (error.response?.status === 409) {
        try {
          await instance.delete(`/platforms/${platformId}/reviews/${reviewId}/recommend`);
          queryClient.invalidateQueries(['reviews', platformId]);
        } catch (cancelError) {
          showToast('추천 취소에 실패했습니다.', 'error');
        }
      } else {
        showToast('추천에 실패했습니다.', 'error');
      }
    }
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    reviewMutation.mutate({
      reviewId: editingReview?.reviewId,
      content: reviewContent,
      rating
    });
  };

  const handleReviewDelete = (reviewId) => {
    deleteMutation.mutate(reviewId);
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setReviewContent(review.content);
    setRating(review.rating);
    setShowReviewForm(true);
  };

  const handleRecommend = (reviewId) => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'error');
      return;
    }
    recommendMutation.mutate(reviewId);
  };

  // 로딩 상태 확인
  if (isPlatformLoading || isReviewsLoading || isStatsLoading) {
    return <div>Loading...</div>;
  }
  // 전체 구독자 수 계산
  const totalSubscribers = (statsData.genderStats.MALE || 0) + (statsData.genderStats.FEMALE || 0);
  const ageKeys = ['10','20','30','40','50','60','70','80','90'];
  const agePercentData = ageKeys.map(age => totalSubscribers > 0 ? (statsData.ageStats[age] || 0) / totalSubscribers * 100 : 0);

  return (
    <div className={styles.pageContainer}>
      {/* 플랫폼 상세 정보 섹션 */}
      <section className={styles.platformInfo}>
        <div className={styles.platformHeader}>
          <img 
            src={`${instance.defaults.baseURL}${platformData.platformImage}`} 
            alt={platformData.platformName} 
            className={styles.platformImage}
          />
          <div className={styles.platformDetails}>
            <h1 className={styles.platformName}>{platformData.platformName}</h1>
            <p className={styles.platformDescription}>{platformData.platformDescription}</p>
            <div className={styles.platformMeta}>
              <span>카테고리: {platformData.categoryName}</span>
              <span>서비스 시작일: {new Date(platformData.serviceAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.platformStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>평균 평점</span>
                <span className={styles.statValue}>{platformData.ratingAvg.toFixed(1)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>리뷰 수</span>
                <span className={styles.statValue}>{platformData.reviewCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 구독 플랜 */}
        <div className={styles.plansSection}>
          <h2 className={styles.sectionTitle}>구독 플랜(요금제)</h2>
          <div className={styles.plansList}>
            {platformData.plans.map((plan) => (
              <Card key={plan.subsPlanId} className={styles.planCard}>
                <h3 className={styles.planName}>{plan.planName}</h3>
                <p className={styles.planPrice}>
                  {plan.billingCycle} {plan.price.toLocaleString()}원
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className={styles.statisticsSection}>
          <h2 className={styles.sectionTitle}>통계</h2>
          {isStatsLoading ? (
            <div>Loading statistics...</div>
          ) : totalSubscribers === 0 ? (
            <div className={styles.statisticsPlaceholder}>
              아직 해당 서비스에 구독자가 없습니다.
            </div>
          ) : (
            <div className={styles.statisticsCharts}>
              <div className={styles.chartBox}>
                <h3 className={styles.chartTitle}>성별 구독 분포</h3>
                <div className={styles.chartContainer}>
                  <Doughnut
                    id={`gender-chart-${platformId}`}
                    data={{
                      labels: ['남성', '여성'],
                      datasets: [{
                        data: [statsData.genderStats.MALE, statsData.genderStats.FEMALE],
                        backgroundColor: ['#006DFF', '#FF6B6B'],
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            generateLabels: chart => {
                              const data = chart.data;
                              const dataset = data.datasets[0];
                              return data.labels.map((label, i) => {
                                const value = dataset.data[i] || 0;
                                const percentNum = totalSubscribers > 0 ? (value / totalSubscribers * 100) : 0;
                                let percentText;
                                if (isNaN(percentNum) || percentNum === 0) percentText = '없음';
                                else if (percentNum < 1) percentText = '<1%';
                                else percentText = `${Math.round(percentNum)}%`;
                                return {
                                  text: `${label}: ${percentText}`,
                                  fillStyle: dataset.backgroundColor[i],
                                  hidden: chart.getDatasetMeta(0).data[i].hidden,
                                  index: i
                                };
                              });
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: context => {
                              const value = context.dataset.data[context.dataIndex] || 0;
                              const percentNum = totalSubscribers > 0 ? (value / totalSubscribers * 100) : 0;
                              let percentText;
                              if (isNaN(percentNum) || percentNum === 0) percentText = '없음';
                              else if (percentNum < 1) percentText = '<1%';
                              else percentText = `${Math.round(percentNum)}%`;
                              return `${context.label}: ${percentText}`;
                            }
                          }
                        }
                      },
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
              <div className={styles.chartBox}>
                <h3 className={styles.chartTitle}>연령별 구독 분포</h3>
                <div className={styles.chartContainer}>
                  <Bar
                    id={`age-chart-${platformId}`}
                    data={{
                      labels: ageKeys.map(age => `${age}대`),
                      datasets: [{
                        label: '구독 비율',
                        data: agePercentData,
                        backgroundColor: '#006D77'
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: context => {
                              const val = context.parsed.y;
                              if (isNaN(val) || val === 0) return '없음';
                              return `${Math.round(val)}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                        },
                        y: {
                          beginAtZero: true,
                          grid: { display: false },
                          ticks: {
                            align: 'center',
                            stepSize: 20,
                            callback: value => `${value}%`
                          }
                        }
                      },
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 리뷰 섹션 */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewHeader}>
            <h2 className={styles.sectionTitle}>리뷰</h2>
            {isLoggedIn && !showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                className={styles.writeReviewButton}
              >
                리뷰 작성하기
              </Button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <div className={styles.ratingSelect}>
                <span>평점: </span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`${styles.ratingButton} ${rating >= value ? styles.active : ''}`}
                  >
                    {rating >= value ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="리뷰를 작성해주세요"
                className={styles.reviewTextarea}
                required
              />
              <div className={styles.reviewFormButtons}>
                <Button type="submit">
                  {editingReview ? '수정하기' : '작성하기'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setReviewContent('');
                    setRating(5);
                  }}
                  variant="secondary"
                >
                  취소
                </Button>
              </div>
            </form>
          )}

          <div className={styles.reviewsList}>
            {reviewsData?.data.map((review) => {
              return (
                <ReviewCard
                  key={review.reviewId}
                  review={review}
                  onDelete={handleReviewDelete}
                  onEdit={handleReviewEdit}
                  onRecommend={() => handleRecommend(review.reviewId)}
                />
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {reviewsData?.pageInfo.totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: reviewsData.pageInfo.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PlatformDetailPage; 