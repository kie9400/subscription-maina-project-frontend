import React, { useState } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/LoginPage.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      // 로그인 성공 처리
      console.log('로그인 성공:', response.data);
      
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.error('로그인 실패:', err);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>로그인</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="이메일"
            type="email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
            error={error}
          />
          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
          <Button 
            type="submit" 
            fullWidth
            size="large"
          >
            로그인
          </Button>
        </form>
        <div className={styles.links}>
          <p className={styles.helpText}>
            아이디를 잃어버리셨나요? <a href="/find_id" className={styles.link}>아이디 찾기</a>
          </p>
        </div>
        <div className={styles.links}>
          <p className={styles.helpText}>
            아직 가입하지 않으셨나요? <a href="/signup" className={styles.link}>지금 바로 가입하세요</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 