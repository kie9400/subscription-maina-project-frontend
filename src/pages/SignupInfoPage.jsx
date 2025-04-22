import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Radio from '../components/Radio';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';
import SignupSteps from '../components/SignupSteps';
import styles from '../styles/SignupInfoPage.module.css';

const SignupInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showToast } = useToast();
  const { email, verified } = location.state || {};

  // 페이지 접근 제한
  if (!verified || !email) {
    navigate('/signup/email');
    return null;
  }

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
    name: '',
    phoneNumber: '',
    age: '',
    gender: ''
  });

  const [errors, setErrors] = useState({
    password: '',
    passwordConfirm: '',
    name: '',
    phoneNumber: '',
    age: '',
    gender: ''
  });

  const [passwordMatchError, setPasswordMatchError] = useState('');

  const ageOptions = Array.from({ length: 83 }, (_, i) => ({
    value: String(i + 18),
    label: `${i + 18}세`
  }));

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  useEffect(() => {
    if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
      setPasswordMatchError('비밀번호가 일치하지 않습니다');
    } else {
      setPasswordMatchError('');
    }
  }, [formData.password, formData.passwordConfirm]);

  const handleChange = (name, value) => {
    if (name === 'phoneNumber') {
      value = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    const phoneRegex = /^010-\d{4}-\d{4}$/;

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '전화번호를 입력해주세요';
    } else if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length !== 13) {
      newErrors.phoneNumber = '올바른 전화번호를 입력해주세요';
    }

    if (!formData.age) {
      newErrors.age = '나이를 선택해주세요';
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
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
      await instance.post('/members', {
        email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        age: parseInt(formData.age),
        gender: formData.gender
      });

      showToast('회원가입이 완료되었습니다.');
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: '이미 등록된 전화번호입니다'
        }));
      } else {
        // 기타 에러 처리
        console.error('회원가입 에러:', error);
        showToast('회원가입에 실패했습니다.', 'error');
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SignupSteps currentStep={3} />
      <div className={styles.signupContainer}>
        <div className={styles.signupBox}>
          <h2 className={styles.title}>회원가입</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="이메일"
              type="email"
              value={email}
              disabled
            />
            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              required
              error={errors.password}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={(e) => handleChange('passwordConfirm', e.target.value)}
              placeholder="비밀번호를 다시 입력해주세요"
              required
              error={passwordMatchError || errors.passwordConfirm}
            />
            <Input
              label="이름"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
              required
              error={errors.name}
            />
            <Input
              label="전화번호"
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="숫자만 입력하세요"
              maxLength={13}
              required
              error={errors.phoneNumber}
            />
            <div className={styles.row}>
              <div className={styles.col}>
                <Dropdown
                  label="나이"
                  options={ageOptions}
                  value={formData.age}
                  onChange={(value) => handleChange('age', value)}
                  placeholder="나이를 선택하세요"
                  required
                  error={errors.age}
                />
              </div>
              <div className={styles.col}>
                <div className={styles.genderGroup}>
                  <label className={styles.groupLabel}>
                    성별
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.radioGroup}>
                    <Radio
                      label="남자"
                      name="gender"
                      value="MALE"
                      checked={formData.gender === 'MALE'}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    />
                    <Radio
                      label="여자"
                      name="gender"
                      value="FEMALE"
                      checked={formData.gender === 'FEMALE'}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    />
                  </div>
                  {errors.gender && (
                    <p className={styles.errorMessage}>{errors.gender}</p>
                  )}
                </div>
              </div>
            </div>
            <Button
              type="submit"
              fullWidth
              size="large"
            >
              회원가입
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupInfoPage; 