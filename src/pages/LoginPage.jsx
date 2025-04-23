import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
      setUsernameError('');
    } else if (name === 'password') {
      setPassword(value);
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      setUsernameError('이메일을 입력해주세요');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }

    try {
      const response = await instance.post('/auth/login', {
        username,
        password
      });

      const accessToken = response.headers.get("Authorization");
      const refreshToken = response.headers.get("Refresh");
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // 로그인 성공 시 유저 정보 저장
      const userData = {
        ...response.data,
        role: response.data.role || 'USER' // role이 없을 경우 기본값 설정
      };
      await login(userData);
      showToast('로그인이 완료되었습니다.');
      navigate('/');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setPasswordError('가입하지 않은 회원 이거나, 입력하신 정보가 올바르지 않습니다');
            showToast('가입하지 않은 회원 이거나, 입력하신 정보가 올바르지 않습니다.', 'error');
            break;
          default:
            setPasswordError('로그인에 실패했습니다. 다시 시도해주세요');
            showToast('로그인에 실패했습니다.', 'error');
        }
      } else {
        setPasswordError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요');
        showToast('서버 연결에 실패했습니다.', 'error');
      }
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
            value={username}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
            error={usernameError}
          />
          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
            error={passwordError}
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
            아이디를 잃어버리셨나요? <span onClick={() => navigate('/find_id')} className={styles.link}>아이디 찾기</span>
          </p>
        </div>
        <div className={styles.links}>
          <p className={styles.helpText}>
            아직 가입하지 않으셨나요? <span onClick={() => navigate('/signup')} className={styles.link}>지금 바로 가입하세요</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 