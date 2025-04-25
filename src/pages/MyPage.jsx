import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import styles from '../styles/MyPage.module.css';
const BASE_URL = import.meta.env.VITE_S3_URL;

const MyPage = () => {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('info');

  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }

  // 마이페이지 기본 정보 (이름, 이미지) 조회
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: async () => {
      const response = await instance.get('/mypage');
      return response.data.data;
    },
    enabled: isLoggedIn
  });

  // 내 상세 정보 조회
  const { data: myInfoData, isLoading: infoLoading } = useQuery({
    queryKey: ['mypage', 'info'],
    queryFn: async () => {
      const response = await instance.get('/mypage/info');
      return response.data.data;
    },
    enabled: isLoggedIn
  });

  // 로딩 상태 확인
  if (profileLoading || infoLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'info':
        return <MyInfo data={myInfoData} />;
      case 'subscription':
        return <MySubscription />;
      case 'review':
        return <MyReview />;
      default:
        return <MyInfo data={myInfoData} />;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>마이페이지</h1>
      
      <div className={styles.contentContainer}>
        {/* 왼쪽 사이드바 */}
        <div className={styles.sidebar}>
          <div className={styles.profile}>
            <img 
              src={`${BASE_URL}${profileData?.image}`} 
              alt="프로필 이미지" 
              className={styles.profileImage}
            />
            <h2 className={styles.userName}>{profileData?.name || '사용자'}</h2>
          </div>
          
          <div className={styles.menu}>
            <button 
              className={`${styles.menuItem} ${activeMenu === 'info' ? styles.active : ''}`}
              onClick={() => setActiveMenu('info')}
            >
              <span role="img" aria-label="내 정보">👤</span> 내 정보
            </button>
            <button 
              className={`${styles.menuItem} ${activeMenu === 'subscription' ? styles.active : ''}`}
              onClick={() => setActiveMenu('subscription')}
            >
              <span role="img" aria-label="내 구독내역">🔔</span> 내 구독내역
            </button>
            <button 
              className={`${styles.menuItem} ${activeMenu === 'review' ? styles.active : ''}`}
              onClick={() => setActiveMenu('review')}
            >
              <span role="img" aria-label="내 리뷰내역">✍️</span> 내 리뷰내역
            </button>
          </div>
        </div>
        
        {/* 오른쪽 콘텐츠 영역 */}
        <div className={styles.content}>
          {activeMenu === 'info' && <h2 className={styles.sectionTitle}>내 정보</h2>}
          {activeMenu === 'subscription' && <h2 className={styles.sectionTitle}>내 구독내역</h2>}
          {activeMenu === 'review' && <h2 className={styles.sectionTitle}>내 리뷰내역</h2>}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// 내 정보 컴포넌트
const MyInfo = ({ data }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleEditProfile = () => {
    navigate('/mypage/edit');
  };

  const handlePasswordChange = () => {
    navigate('/mypage/password');
  };

  const handleDeleteMember = () => {
    navigate('/mypage/delete');
  };

  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <label>이메일</label>
          <div className={styles.infoValue}>{data?.email || ''}</div>
        </div>
        
        <div className={styles.infoRow}>
          <label>성별</label>
          <div className={styles.infoValue}>
            {data?.gender === 'MALE' ? '남자' : 
             data?.gender === 'FEMALE' ? '여자' : ''}
          </div>
        </div>
        
        <div className={styles.infoRow}>
          <label>나이</label>
          <div className={styles.infoValue}>{data?.age || ''}</div>
        </div>
        
        <div className={styles.infoRow}>
          <label>가입일</label>
          <div className={styles.infoValue}>
            {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : ''}
          </div>
        </div>
        
        <div className={styles.infoRow}>
          <label>휴대폰 번호</label>
          <div className={styles.infoValue}>{data?.phoneNumber || ''}</div>
        </div>
      </div>
      
      <div className={styles.buttonGroup}>
        <Button type="button" onClick={handleEditProfile}>회원정보 수정</Button>
        <Button type="button" onClick={handlePasswordChange}>비밀번호 변경</Button>
      </div>
      
      <div className={styles.withdrawContainer}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowConfirmModal(true)}
          className={styles.withdrawButton}
        >
          회원 탈퇴
        </Button>
      </div>

      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>정말로 탈퇴를 진행하시겠습니까?</h3>
            <p>탈퇴 진행 시 추가 인증이 필요합니다.</p>
            <div className={styles.modalActions}>
              <Button onClick={() => {
                setShowConfirmModal(false);
                handleDeleteMember();
              }} variant="danger">탈퇴 진행</Button>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 내 구독내역 컴포넌트
const MySubscription = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['mypage', 'subscription'],
    queryFn: async () => {
      const response = await instance.get('/mypage/subs');
      return response.data.data;
    },
    enabled: isLoggedIn
  });

  const handleSubscriptionClick = (subscriptionId) => {
    navigate(`/subscription/${subscriptionId}`);
  };

  if (subsLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!subsData || 
      !subsData.categories || 
      subsData.categories.length === 0 || 
      subsData === "" || 
      Object.keys(subsData).length === 0) {
    return <div className={styles.emptyState}>구독 내역이 없습니다.</div>;
  }

  return (
    <div className={styles.subscriptionContainer}>
      <div className={styles.subSummary}>
        <div className={styles.totalPriceBox}>
          <span className={styles.totalPriceLabel}>월 구독 총요금 : </span>
          <span className={styles.totalPrice}>{subsData.totalMonthlyPrice.toLocaleString()}원</span>
        </div>
      </div>
      
      <div className={styles.categoryList}>
        {subsData.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryInfo}>
                <img 
                  src={`${BASE_URL}${category.categoryImage}`} 
                  alt={category.categoryName} 
                  className={styles.categoryImage} 
                />
                <span className={styles.categoryName}>{category.categoryName}</span>
                <span className={styles.categoryPrice}>총 요금 {category.categoryTotalPrice.toLocaleString()}원</span>
              </div>
            </div>
            
            <div className={styles.platformGrid}>
              {category.subscriptions.map((subscription) => (
                <div 
                  key={subscription.subscriptionId} 
                  className={styles.platformCard}
                  onClick={() => handleSubscriptionClick(subscription.subscriptionId)}
                >
                  <div className={styles.platformImgWrapper}>
                    <img 
                      src={`${BASE_URL}${subscription.platformImage}`} 
                      alt={subscription.platformName} 
                      className={styles.platformImage} 
                    />
                    <div className={styles.platformName}>{subscription.platformName}</div>
                  </div>
                  <div className={styles.platformInfo}>
                    <div className={styles.planName}>{subscription.planName}</div>
                    <div className={styles.monthlyFee}>
                      <span className={styles.billingCycle}>{subscription.billingCycle}</span>
                      <span className={styles.price}>{subscription.price.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 내 리뷰내역 컴포넌트
const MyReview = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['mypage', 'reviews', currentPage],
    queryFn: async () => {
      const response = await instance.get(`/mypage/reviews?page=${currentPage}&size=${pageSize}`);
      return response.data;
    },
    enabled: isLoggedIn
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ platformId, reviewId }) => {
      return await instance.delete(`/platforms/${platformId}/reviews/${reviewId}`);
    },
    onSuccess: () => {
      showToast('리뷰가 삭제되었습니다.');
      //리뷰 삭제가 성공하면 이 콜백함수에서 새로고침침
      queryClient.invalidateQueries(['mypage', 'reviews']);
    },
    onError: (error) => {
      showToast('리뷰 삭제에 실패했습니다: ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  const handleDeleteReview = (platformId, reviewId, event) => {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      deleteMutation.mutate({ platformId, reviewId });
    }
  };

  const handleReviewClick = (platformId) => {
    navigate(`/platforms/${platformId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (reviewsLoading) {
    return <div className={styles.loading}>리뷰 내역을 불러오는 중...</div>;
  }

  if (!reviewsData || !reviewsData.data || reviewsData.data.length === 0) {
    return <div className={styles.emptyState}>작성한 리뷰가 없습니다.</div>;
  }

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.reviewsList}>
        {reviewsData.data.map((review) => (
          <div 
            key={review.reviewId} 
            className={styles.reviewItem}
            onClick={() => handleReviewClick(review.platformId)}
          >
            <div className={styles.reviewPlatform}>
              <div className={styles.platformImageWrapper}>
                <img 
                  src={`${BASE_URL}${review.platformImage}`} 
                  alt={review.platformName} 
                  className={styles.platformImage}
                />
              </div>
              <div className={styles.platformName}>{review.platformName}</div>
            </div>
            <div className={styles.reviewContent}>
              <div className={styles.reviewHeader}>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>★</span>
                  ))}
                </div>
              </div>
              <p>{review.content}</p>
              <div className={styles.reviewActions}>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => handleDeleteReview(review.platformId, review.reviewId, e)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {reviewsData.pageInfo && reviewsData.pageInfo.totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            이전
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {reviewsData.pageInfo.totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === reviewsData.pageInfo.totalPages}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};


export default MyPage;