import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/FindPwPage.module.css';

const FindPwPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }));
    } else if (name === 'email' || name === 'name') {
      setFormData(prev => ({
        ...prev,
        [name]: value.replace(/\s/g, '')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.phoneNumber) {
      setErrors({
        email: !formData.email ? '이메일을 입력해주세요' : '',
        name: !formData.name ? '이름을 입력해주세요' : '',
        phoneNumber: !formData.phoneNumber ? '전화번호를 입력해주세요' : ''
      });
      return;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: '올바른 전화번호를 입력해주세요'
      }));
      return;
    }

    setIsLoading(true);
    try {
      await instance.post('/members/findpw', formData);
      showToast('임시비밀번호가 전송되었습니다.');
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.message === '회원을 찾을 수 없습니다.') {
        setErrors(prev => ({
          ...prev,
          email: '가입되지 않은 이메일입니다. 확인해주세요'
        }));
      } else if (error.response?.data?.message === '이름을 찾을 수 없습니다.') {
        setErrors(prev => ({
          ...prev,
          name: '이름을 찾을 수 없습니다.'
        }));
      } else if (error.response?.data?.message === '휴대폰 번호를 찾을 수 없습니다.') {
        setErrors(prev => ({
          ...prev,
          phoneNumber: '휴대폰 번호를 찾을 수 없습니다.'
        }));
      } else {
        showToast('비밀번호 찾기에 실패했습니다.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.findPwContainer}>
      <div className={styles.findPwBox}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="이메일"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
            error={errors.email}
            disabled={isLoading}
          />
          <Input
            label="이름"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
            error={errors.name}
            disabled={isLoading}
          />
          <Input
            label="전화번호"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="숫자만 입력하세요"
            maxLength={13}
            required
            error={errors.phoneNumber}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            fullWidth
            size="large"
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '비밀번호 찾기'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FindPwPage;
