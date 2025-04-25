import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import styles from '../styles/SubscriptionDetailPage.module.css';
const BASE_URL = import.meta.env.VITE_S3_URL;

const SubscriptionDetailPage = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 권한 체크
  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }
  
  // 구독 상세 정보 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: async () => {
      const response = await instance.get(`/subscription/${subscriptionId}`);
      return response.data.data;
    },
    enabled: !!subscriptionId && isLoggedIn,
    onSuccess: (data) => {
      if (data.nextPaymentDate) {
        setSelectedDate(new Date(data.nextPaymentDate));
      }
    }
  });

  // 구독 삭제 mutation
  const deleteSubscription = useMutation({
    mutationFn: async () => {
      return await instance.delete(`/subscription/${subscriptionId}`);
    },
    onSuccess: () => {
      showToast('구독이 성공적으로 삭제되었습니다.');
      queryClient.invalidateQueries(['mypage', 'subscription']);
      navigate('/mypage');
    },
    onError: (error) => {
      showToast('구독 삭제 중 오류가 발생했습니다.', 'error');
      console.error('구독 삭제 오류:', error);
    }
  });

  // 달력 렌더링
  const renderCalendar = (date) => {
    if (!date) return null;
    
    const paymentDate = new Date(date);
    const year = paymentDate.getFullYear();
    const month = paymentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 달력 헤더 (월/년)
    const calendarHeader = (
      <div className={styles.calendarHeader}>
        <span>{`${year}년 ${month + 1}월`}</span>
      </div>
    );
    
    // 요일 헤더
    const dayHeader = (
      <div className={styles.dayNames}>
        {dayNames.map((day, index) => (
          <div key={index} className={styles.dayName}>{day}</div>
        ))}
      </div>
    );
    
    // 이전 월의 날짜들
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`prev-${i}`} className={styles.dayPlaceholder}></div>);
    }
    
    // 이번 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isPaymentDay = paymentDate.getDate() === i;
      
      days.push(
        <div 
          key={`current-${i}`}
          className={`${styles.day} ${isToday ? styles.today : ''} ${isPaymentDay ? styles.paymentDay : ''}`}
        >
          {i}
        </div>
      );
    }
    
    return (
      <div className={styles.calendar}>
        {calendarHeader}
        {dayHeader}
        <div className={styles.days}>{days}</div>
      </div>
    );
  };

  // 날짜 형식화
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/subscription/${subscriptionId}/edit`);
  };

  // 삭제 모달 표시
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // 삭제 확인
  const confirmDelete = () => {
    deleteSubscription.mutate();
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!data) {
    return <div className={styles.empty}>구독 정보가 없습니다.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>구독 상세 페이지</h1>
      
      <div className={styles.contentContainer}>
        <div className={styles.platformInfo}>
          <div className={styles.platformHeader}>
            <h2 className={styles.platformName}>{data.platformName}</h2>
          </div>
          
          <div className={styles.platformDetails}>
            <div className={styles.platformImageContainer}>
              <img 
                src={`${BASE_URL}${data.platformImage}`} 
                alt={data.platformName} 
                className={styles.platformImage}
                onClick={() => navigate(`/platforms/${data.platformId}`)}
              />
            </div>
            
            <div className={styles.subscriptionDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>구독 플랜:</span>
                <span className={styles.detailValue}>{data.subsPlanName}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>구독 시작일:</span>
                <span className={styles.detailValue}>{formatDate(data.subscriptionStartAt)}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>결제 주기:</span>
                <span className={styles.detailValue}>
                  {data.billingCycle === '월' ? '1개월' : 
                   data.billingCycle === '연' ? '1년' : data.billingCycle}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>요금:</span>
                <span className={styles.detailValue}>
                  {data.billingCycle} {data.price.toLocaleString()}원
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>다음 결제일:</span>
                <span className={styles.detailValue}>{formatDate(data.nextPaymentDate)}</span>
              </div>
            </div>
          </div>
          <p className={styles.calendarNote}>
            ※ 플랫폼 이미지를 클릭하면 <span className={styles.highlightDate}>플랫폼 페이지</span>로 이동합니다.
          </p>
        </div>
        
        <div className={styles.calendarContainer}>
          <h3 className={styles.calendarTitle}>다음 결제일</h3>
          {renderCalendar(data.nextPaymentDate)}
          <p className={styles.calendarNote}>
            * 달력에 <span className={styles.highlightDate}>동그라미</span>로 표시된 날짜가 다음 결제일입니다.
          </p>
        </div>
        
        <div className={styles.actions}>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleEdit}
            className={styles.editButton}
          >
            구독 정보 수정
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDelete}
            className={styles.cancelButton}
          >
            구독 취소
          </Button>
        </div>
      </div>
      
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>구독 삭제 확인</h3>
            <p className={styles.modalMessage}>
              정말로 {data.platformName} 구독을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className={styles.modalActions}>
              <Button 
                type="button" 
                variant="danger"
                onClick={confirmDelete}
                disabled={deleteSubscription.isPending}
              >
                {deleteSubscription.isPending ? '삭제 중...' : '삭제'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetailPage; 