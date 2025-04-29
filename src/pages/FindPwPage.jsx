import React, { useState } from 'react';
import { instance } from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/FindPwPage.module.css';

const FindPwPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.phoneNumber) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }

    try {
      await instance.post('/members/findpw', formData);
      showToast('임시비밀번호가 전송되었습니다.');
      window.location.href = '/login';
    } catch (error) {
      if (error.response?.status === 404) {
        setError('일치하는 회원정보가 없습니다');
        showToast('일치하는 회원정보가 없습니다.', 'error');
      } else {
        setError('비밀번호 찾기에 실패했습니다. 다시 시도해주세요');
        showToast('비밀번호 찾기에 실패했습니다.', 'error');
      }
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
          />
          <Input
            label="이름"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
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
            error={error}
          />
          <Button 
            type="submit" 
            fullWidth
            size="large"
          >
            비밀번호 찾기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FindPwPage;
