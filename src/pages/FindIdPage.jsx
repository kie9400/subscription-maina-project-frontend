import React, { useState } from 'react';
import { instance } from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/FindIdPage.module.css';

const FindIdPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneNumberChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setError('전화번호를 입력해주세요');
      return;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }

    try {
      const response = await instance.post('/members/findid', {
        phoneNumber
      });
      
      setFoundEmail(response.data.data.email);
      showToast('아이디를 찾았습니다.');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('등록되지 않은 전화번호입니다');
      } else {
        setError('아이디 찾기에 실패했습니다. 다시 시도해주세요');
      }
      showToast('아이디 찾기에 실패했습니다.', 'error');
    }
  };

  return (
    <div className={styles.findIdContainer}>
      <div className={styles.findIdBox}>
        <h2 className={styles.title}>아이디 찾기</h2>
        {!foundEmail ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="전화번호"
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
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
              아이디 찾기
            </Button>
          </form>
        ) : (
          <div className={styles.resultContainer}>
            <p className={styles.resultMessage}>
              회원님의 아이디를 찾았습니다
            </p>
            <div className={styles.resultBox}>
              <p className={styles.resultLabel}>찾은 아이디</p>
              <p className={styles.resultEmail}>{foundEmail}</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/login'}
              fullWidth
              size="large"
            >
              로그인 하러가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindIdPage; 