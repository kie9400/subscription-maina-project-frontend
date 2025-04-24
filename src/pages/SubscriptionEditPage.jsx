import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import PlatformSearchModal from '../components/PlatformSearchModal';
import styles from '../styles/SubscriptionEditPage.module.css';

const SubscriptionEditPage = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // 모달 컴포넌트에서 뽑아올 상태 관리
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // 로그인 상태 확인
  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }

  // 구독 상세 정보 조회
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: async () => {
      const response = await instance.get(`/subscription/${subscriptionId}`);
      return response.data.data;
    },
    enabled: !!subscriptionId && isLoggedIn
  });

  // 플랫폼 상세 정보 조회
  const { data: platformData, isLoading: isPlatformLoading } = useQuery({
    queryKey: ['platform', subscriptionData?.platformId],
    queryFn: async () => {
      const response = await instance.get(`/platforms/${subscriptionData.platformId}`);
      return response.data.data;
    },
    enabled: !!subscriptionData?.platformId && isLoggedIn
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (subscriptionData) {
      // 구독 시작일 설정
      if (subscriptionData.subscriptionStartAt) {
        setSubscriptionDate(subscriptionData.subscriptionStartAt.split('T')[0]);
      }
      
      // 현재 선택된 플랜 설정
      if (subscriptionData.subsPlanId) {
        setSelectedPlan(subscriptionData.subsPlanId);
      }
    }
  }, [subscriptionData]);

  // 플랜 선택 핸들러
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan.subsPlanId);
  };

  // 모달에서 플랫폼 선택 시 처리
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setSelectedPlan(null);
    setShowPlatformModal(false);
  };

  // 구독 정보 수정 mutation
  const updateSubscription = useMutation({
    mutationFn: async (updatedData) => {
      return instance.patch(`/subscription/${subscriptionId}`, updatedData);
    },
    onSuccess: () => {
      showToast('구독 정보가 성공적으로 수정되었습니다.');
      queryClient.invalidateQueries(['subscription', subscriptionId]);
      queryClient.invalidateQueries(['mypage', 'subscription']);
      navigate(`/subscription/${subscriptionId}`);
    },
    onError: (error) => {
      showToast('구독 정보 수정 중 오류가 발생했습니다.', 'error');
      console.error('구독 수정 오류:', error);
    }
  });

  // 수정 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      showToast('구독 플랜을 선택해주세요.', 'error');
      return;
    }
    
    if (!subscriptionDate) {
      showToast('구독 시작일을 입력해주세요.', 'error');
      return;
    }
    
    updateSubscription.mutate({
      platformId: subscriptionData.platformId,
      subsPlanId: selectedPlan,
      subscriptionAt: subscriptionDate
    });
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/subscription/${subscriptionId}`);
  };

  if (isSubscriptionLoading || isPlatformLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!subscriptionData || !platformData) {
    return <div className={styles.error}>구독 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>구독 정보 수정</h1>
      <div className={styles.platformQuestion}>
        <span className={styles.questionText}>플랫폼을 변경하시겠습니까?</span>
        <Button 
          variant="outline" 
          size="small" 
          onClick={() => setShowPlatformModal(true)}
        >
          플랫폼 찾기
        </Button>
      </div>     
      <div className={styles.contentContainer}>
        <div className={styles.platformInfo}>
          <div className={styles.platformHeader}>
            <h2 className={styles.platformName}>{subscriptionData.platformName}</h2>
          </div>
          
          <div className={styles.platformDetails}>
            <div className={styles.platformImageContainer}>
              <img 
                src={`${instance.defaults.baseURL}${subscriptionData.platformImage}`} 
                alt={subscriptionData.platformName} 
                className={styles.platformImage}
              />
            </div>
            
            <form className={styles.editForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>구독 플랜</label>
                <div className={styles.planSelector}>
                  {platformData.plans?.map((plan) => (
                    <div 
                      key={`plan-${plan.subsPlanId}`}
                      className={`${styles.planOption} ${selectedPlan === plan.subsPlanId ? styles.selected : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <h4>{plan.planName}</h4>
                      <p className={styles.planPrice}>
                        {plan.billingCycle} {plan.price.toLocaleString()}원
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>구독 시작일</label>
                <Input 
                  type="date" 
                  value={subscriptionDate} 
                  onChange={(e) => setSubscriptionDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              
              <div className={styles.actions}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className={styles.saveButton}
                  disabled={updateSubscription.isPending}
                >
                  {updateSubscription.isPending ? '저장 중...' : '변경사항 저장'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPlatformModal && (
        <PlatformSearchModal
          isOpen={showPlatformModal}
          onClose={() => setShowPlatformModal(false)}
          onSelect={handlePlatformSelect}
        />
      )}
    </div>
  );
};

export default SubscriptionEditPage; 