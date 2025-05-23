import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import PlatformSearchModal from '../components/PlatformSearchModal';
import styles from '../styles/SubscriptionRegisterPage.module.css';
const BASE_URL = import.meta.env.VITE_S3_URL;

const SubscriptionRegisterPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionDate, setSubscriptionDate] = useState('');

  // 로그인 상태 확인
  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }


  // 선택한 플랫폼 상세 조회
  const { data: platformDetail } = useQuery({
    queryKey: ['platform', selectedPlatform?.platformId],
    queryFn: async () => {
      if (!selectedPlatform?.platformId) return null;
      const response = await instance.get(`/platforms/${selectedPlatform.platformId}`);
      return response.data.data;
    },
    enabled: !!selectedPlatform?.platformId
  });

  // 플랫폼 상세 정보가 로드되면 선택한 플랫폼 정보 업데이트
  React.useEffect(() => {
    if (platformDetail) {
      setSelectedPlatform(prev => ({
        ...prev,
        ...platformDetail
      }));
    }
  }, [platformDetail]);

  // 구독 등록 mutation
  const subscriptionMutation = useMutation({
    mutationFn: (subscriptionData) => {
      return instance.post('/subscription', subscriptionData);
    },
    onSuccess: () => {
      showToast('구독이 성공적으로 등록되었습니다.');
      navigate('/');
    },
    onError: (error) => {
      showToast('(실패) 구독이 ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPlatform) {
      showToast('플랫폼을 선택해주세요.', 'error');
      return;
    }
    
    if (!selectedPlan) {
      showToast('구독 플랜을 선택해주세요.', 'error');
      return;
    }
    
    if (!subscriptionDate) {
      showToast('구독 시작일을 선택해주세요.', 'error');
      return;
    }

    subscriptionMutation.mutate({
      platformId: selectedPlatform.platformId,
      subsPlanId: selectedPlan.subsPlanId,
      subscriptionAt: subscriptionDate
    });
  };

  // 모달에서 플랫폼 선택 시 처리
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setSelectedPlan(null);
    setShowPlatformModal(false);
  };

  // plans 배열이 존재하는지 확인
  const hasPlanOptions = selectedPlatform && selectedPlatform.plans && selectedPlatform.plans.length > 0;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>구독 서비스 등록</h1>
      <p className={styles.pageDescription}>
        구독하고 있는 서비스를 등록해주세요.
      </p>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>플랫폼 선택</label>
            <div className={styles.platformSelector}>
              {selectedPlatform ? (
                <div className={styles.selectedPlatform}>
                  <img 
                    src={`${BASE_URL}${selectedPlatform.platformImage}`} 
                    alt={selectedPlatform.platformName} 
                    className={styles.platformImage}
                  />
                  <div className={styles.platformInfo}>
                    <h3>{selectedPlatform.platformName}</h3>
                    <p>{selectedPlatform.categoryName}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="small" 
                    onClick={() => setShowPlatformModal(true)}
                  >
                    변경
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => setShowPlatformModal(true)}
                >
                  플랫폼 찾기
                </Button>
              )}
            </div>
          </div>

          {selectedPlatform && (
            <div className={styles.formGroup}>
              <label className={styles.label}>구독 플랜</label>
              {hasPlanOptions ? (
                <div className={styles.planSelector}>
                  {selectedPlatform.plans.map((plan) => (
                    <div 
                      key={plan.subsPlanId} 
                      className={`${styles.planOption} ${selectedPlan?.subsPlanId === plan.subsPlanId ? styles.selected : ''}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <h4>{plan.planName}</h4>
                      <p className={styles.planPrice}>
                        {plan.billingCycle} {plan.price.toLocaleString()}원
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.loading}>플랜 정보를 불러오는 중...</div>
              )}
            </div>
          )}

          {selectedPlan && (
            <div className={styles.formGroup}>
              <label className={styles.label}>구독 시작일</label>
              <input
                type="date"
                className={styles.dateInput}
                value={subscriptionDate}
                onChange={(e) => setSubscriptionDate(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formActions}>
            <Button 
              type="submit" 
              fullWidth 
              disabled={!selectedPlatform || !selectedPlan || !subscriptionDate}
            >
              구독 등록하기
            </Button>
          </div>
        </form>
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

export default SubscriptionRegisterPage; 