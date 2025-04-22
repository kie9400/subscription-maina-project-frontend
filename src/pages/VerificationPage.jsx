import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import Input from '../components/Input';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import SignupSteps from '../components/SignupSteps';
import styles from '../styles/VerificationPage.module.css';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { showToast } = useToast();

  //버튼을 누르고 중복 전송을 방지하기 위해 쿨타임 10초준다.
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleCodeChange = (e) => {
    setVerificationCode(e.target.value);
    setCodeError('');
  };

  const handleEmailVerification = async () => {
    if (!isEmailValid) {
      setEmailError('올바른 이메일 형식을 입력해주세요');
      return;
    }

    try {
      console.log('이메일 전송 시도:', email);
      const response = await instance.post('/members/send-email', { email });
      console.log('이메일 전송 응답:', response);
      showToast('이메일 전송에 성공했습니다.');
      
      if (response.status === 200) {
        setShowVerification(true);
        setCooldown(10); 
        setEmailError('');
      }
    } catch (error) {
      console.error('이메일 전송 에러:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setEmailError('잘못된 이메일 형식입니다.');
            break;
          case 409:
            setEmailError('이미 가입된 이메일입니다.');
            break;
          default:
            setEmailError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
        }
      } else if (error.request) {
        setEmailError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        setEmailError('이메일 전송에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setCodeError('인증번호를 입력해주세요');
      return;
    }

    try {
      const response = await instance.post('/members/verify-code', {
        email,
        code: verificationCode
      });
      
      if (response.status === 200) {
        // 인증 성공 시 다음 단계로 이동한다.
        showToast('이메일 인증에 성공했습니다.');
        navigate('/signup/info', { state: { email, verified: true } });
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setCodeError('인증코드가 일치하지 않습니다.');
      } else {
        setCodeError('인증에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SignupSteps currentStep={2} />
      <div className={styles.signupContainer}>
        <div className={styles.signupBox}>
          <h2 className={styles.title}>이메일 인증</h2>
          <div className={styles.form}>
            <div className={styles.emailSection}>
              <Input
                label="이메일"
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="이메일을 입력하세요"
                required
                error={emailError}
              />
              <Button
                onClick={handleEmailVerification}
                disabled={!isEmailValid || cooldown > 0}
                size="medium"
              >
                {cooldown > 0 ? `재전송 (${cooldown}s)` : '인증번호 전송'}
              </Button>
            </div>

            {showVerification && (
              <>
                <div className={styles.verificationSection}>
                  <Input
                    label="인증번호"
                    type="text"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    placeholder="인증번호 6자리를 입력하세요"
                    required
                    error={codeError}
                  />
                </div>
                <Button
                  onClick={handleVerifyCode}
                  fullWidth
                  size="large"
                >
                  다음으로
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage; 