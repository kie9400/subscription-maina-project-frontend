import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/EditProfile.module.css';

const EditPasswordPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [passwordMatchError, setPasswordMatchError] = useState('');
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    passwordConfirm: false
  });
  
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: ''
  });

  // 로그인 상태 확인
  if (!isLoggedIn && !localStorage.getItem('isLoggingOut')) {
    showToast('로그인이 필요한 서비스입니다.', 'error');
    navigate('/login');
    return null; 
  }

  useEffect(() => {
    if (formData.passwordConfirm && formData.newPassword !== formData.passwordConfirm) {
      setPasswordMatchError('비밀번호가 일치하지 않습니다');
    } else {
      setPasswordMatchError('');
    }
  }, [formData.newPassword, formData.passwordConfirm]);

  const handleChange = (name, value) => {
    value = value.replace(/\s/g, ''); // 모든 공백 제거
    //prev는 이전상태, ...prev는 이를 복사
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩])[\w!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩]{8,20}$/;

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = '비밀번호는 8 ~ 20자 내외, 영문, 숫자, 특수문자를 포함해야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '새 비밀번호를 다시 입력해주세요';
    } else if (formData.newPassword !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await instance.patch('/members/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      showToast('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/mypage');
    } catch (error) {
      if (error.response.data.message === "비밀번호가 일치하지 않습니다.") {
        setErrors(prev => ({
          ...prev,
          currentPassword: '현재 비밀번호가 일치하지 않습니다'
        }));
      } else {
        showToast('비밀번호 변경에 실패했습니다.', 'error');
      }
    }
  };

  const handleCancel = () => {
    navigate('/mypage');
  };

  const renderPasswordInput = (field, label, placeholder) => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.passwordInputWrapper}>
        <Input
          type={showPasswords[field] ? "text" : "password"}
          name={field}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          required
          error={field === 'passwordConfirm' ? passwordMatchError || errors[field] : errors[field]}
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
      <h1 className={styles.pageTitle}>비밀번호 변경</h1>
      
      <div className={styles.formContainer}>
        <p className={styles.helpText}>
         비밀번호는 8 ~ 20자 내외이어야 하며, 영문/숫자/특수문자를 모두 포함해야 합니다.
        </p>
        <form onSubmit={handleSubmit}>
          {renderPasswordInput('currentPassword', '현재 비밀번호', '현재 비밀번호를 입력하세요')}
          {renderPasswordInput('newPassword', '새 비밀번호', '영문, 숫자, 특수문자 포함 8자 이상')}

          <div style={{ marginBottom: '100px' }}></div>
          {renderPasswordInput('passwordConfirm', '새 비밀번호 확인', '새 비밀번호를 다시 입력하세요')}
          
          <div className={styles.formActions}>
            <Button type="submit">변경 완료</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>취소</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPasswordPage;