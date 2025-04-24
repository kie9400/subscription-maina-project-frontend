import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import styles from '../styles/MyPage.module.css';

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
              src={`${instance.defaults.baseURL}${profileData?.image || '/images/noImage.png'}`} 
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// 내 정보 컴포넌트
const MyInfo = ({ data }) => {
  const { showToast } = useToast();
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
      <h2 className={styles.sectionTitle}>내 정보</h2>
      
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

// 내 구독내역 컴포넌트 (나중에 구현)
const MySubscription = () => {
  return (
    <div className={styles.subscriptionContainer}>
      <h2 className={styles.sectionTitle}>내 구독내역</h2>
      <p>구독 내역 페이지는 준비 중입니다.</p>
    </div>
  );
};

// 내 리뷰내역 컴포넌트 (나중에 구현)
const MyReview = () => {
  return (
    <div className={styles.reviewContainer}>
      <h2 className={styles.sectionTitle}>내 리뷰내역</h2>
      <p>리뷰 내역 페이지는 준비 중입니다.</p>
    </div>
  );
};

export default MyPage;