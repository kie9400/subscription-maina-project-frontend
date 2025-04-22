import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/TermsPage.module.css';

const TermsPage = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });
  const [showError, setShowError] = useState(false);

  const handleAgreementChange = (type) => {
    setAgreements(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setShowError(false);
  };

  const handleAllAgreementChange = () => {
    const allChecked = Object.values(agreements).every(value => value);
    setAgreements({
      terms: !allChecked,
      privacy: !allChecked,
    });
    setShowError(false);
  };

  const handleNext = () => {
    if (!agreements.terms || !agreements.privacy) {
      setShowError(true);
      return;
    }
    navigate('/signup/email');
  };

  return (
    <div className={styles.termsContainer}>
      <div className={styles.termsBox}>
        <h2 className={styles.title}>약관동의</h2>
        
        <div className={styles.allAgreeSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Object.values(agreements).every(value => value)}
              onChange={handleAllAgreementChange}
              className={styles.checkbox}
            />
            <span>모든 약관에 동의합니다</span>
          </label>
        </div>

        <div className={styles.termsSection}>
          <div className={styles.termItem}>
            <div className={styles.termHeader}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange('terms')}
                  className={styles.checkbox}
                />
                <span>이용약관 동의 (필수)</span>
              </label>
            </div>
            <div className={styles.termContent}>
              <h3>제1조 (목적)</h3>
              <p>이 약관은 구독매니아(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              
              <h3>제2조 (용어의 정의)</h3>
              <p>1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</p>
              <p>2. "회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인을 의미합니다.</p>
              
              <h3>제3조 (약관의 효력 및 변경)</h3>
              <p>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
              <p>2. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공시합니다.</p>
            </div>
          </div>

          <div className={styles.termItem}>
            <div className={styles.termHeader}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange('privacy')}
                  className={styles.checkbox}
                />
                <span>개인정보 수집 및 이용 동의 (필수)</span>
              </label>
            </div>
            <div className={styles.termContent}>
              <h3>1. 수집하는 개인정보 항목</h3>
              <p>- 필수항목: 이메일 주소, 비밀번호, 이름</p>
              <p>- 선택항목: 프로필 이미지</p>
              
              <h3>2. 개인정보의 수집 및 이용목적</h3>
              <p>- 회원 식별 및 본인여부 확인</p>
              <p>- 서비스 제공 및 운영</p>
              <p>- 고객 상담 및 불만처리</p>
              
              <h3>3. 개인정보의 보유 및 이용기간</h3>
              <p>회원탈퇴 시까지 (단, 관계법령에 따라 필요한 경우 해당 법령에서 정한 기간까지)</p>
            </div>
          </div>
        </div>

        {showError && (
          <p className={styles.errorMessage}>
            모든 필수 약관에 동의해주세요.
          </p>
        )}

        <div className={styles.buttonSection}>
          <Button
            onClick={handleNext}
            fullWidth
            size="large"
          >
            다음으로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 