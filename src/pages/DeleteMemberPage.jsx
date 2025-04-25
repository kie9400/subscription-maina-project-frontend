import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/DeleteMember.module.css';
import Input from '../components/Input';
import Button from '../components/Button';

const DeleteMemberPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { showToast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [passwordMatchError, setPasswordMatchError] = useState('');
  
  //로그인 상태 확인
  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await instance.delete('/members', {
        data: {
          email: formData.email,
          password: formData.password
        }
      });

      if (response.status === 204) {
        localStorage.removeItem('token');
        localStorage.setItem('isLoggingOut', 'true');
        showToast('회원 탈퇴가 완료되었습니다.');
        navigate('/login');
        logout();
      }
    } catch (error) {
      if (error.response.data.message === '비밀번호 또는 이메일이 틀렸습니다.') {
        showToast('이메일 또는 비밀번호가 일치하지 않습니다.', 'error');
      } else {
        showToast('회원 탈퇴에 실패했습니다. 다시 시도해 주세요', 'error');
      }
    }
  };

  const renderPasswordInput = (field, label) => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.passwordInputWrapper}>
        <Input
          type={showPasswords[field] ? "text" : "password"}
          name={field}
          value={formData[field]}
          onChange={handleInputChange}
          error={field === 'confirmPassword' ? passwordMatchError || errors[field] : errors[field]}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => togglePasswordVisibility(field)}
        >
          {showPasswords[field] ? '숨김' : '보기'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>회원 탈퇴</h1>
      
      <div className={styles.contentBox}>
        <div className={styles.noticeSection}>
          <h3 className={styles.noticeTitle}>계정 복구 및 데이터 파기에 관련된 내용</h3>
          <div className={styles.noticeContent}>
            <p>• 부정 이용 방지를 위해서 명의 구분을 위해 개인정보를 6개월 간 보관하고 있습니다.</p>
            <p>• 탈퇴일로부터 30일 이내에는 계정복구가 보관되어 복구할 수 있습니다.</p>
            <p>• 계정복구는 해당 사이트의 전화번호로 문의를 주셔야 가능합니다.</p>
            <p>• 30일 이후에는 계정복구 등의 서비스를 절대로 받으실 수 없으며, 복구할 수 없습니다.</p>
          </div>
        </div>

        <div className={styles.noticeSection}>
          <h3 className={styles.noticeTitle}>탈퇴 후 재가입</h3>
          <div className={styles.noticeContent}>
            <p>• 탈퇴일로부터 6개월 이후 재가입하기 위해 새로운 이메일로만 재가입할 수 있습니다.</p>
            <p>• 기존에 사용하였던 이메일로 가입은 가능하지만, 데이터는 복구 할 수 없습니다.</p>
            <p>• 회원 탈퇴 시 신중하시길 바랍니다.</p>
          </div>
        </div>

        <div className={styles.agreementSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            주의사항을 모두 확인했으며, 이에 동의합니다.
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <Button onClick={() => navigate('/mypage')} variant="secondary">
            취소
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            disabled={!agreed}
            variant="error"
          >
            회원 탈퇴
          </Button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>회원 탈퇴 확인</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>이메일</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
              </div>
              
              {renderPasswordInput('password', '비밀번호')}
              {renderPasswordInput('confirmPassword', '비밀번호 확인')}

              {errors.submit && (
                <div className={styles.error}>{errors.submit}</div>
              )}

              <div className={styles.modalActions}>
                <Button type="submit" variant="error">
                  탈퇴
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteMemberPage; 