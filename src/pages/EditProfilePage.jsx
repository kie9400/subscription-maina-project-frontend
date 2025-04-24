import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import styles from '../styles/EditProfile.module.css';

const EditProfilePage = () => {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef();
  
  // 기존 사용자 데이터 가져오기
  const existingData = queryClient.getQueryData(['mypage', 'profile']);
  const existingInfoData = queryClient.getQueryData(['mypage', 'info']);
  
  // 상태 관리
  const [name, setName] = useState(existingData?.name || '');
  const [age, setAge] = useState(existingInfoData?.age || '');
  const [gender, setGender] = useState(existingInfoData?.gender || '');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(existingData?.image ? `${instance.defaults.baseURL}${existingData.image}` : '');
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  
  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'error');
      navigate('/login');
    }
  }, [isLoggedIn, navigate, showToast]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setIsImageDeleted(false);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setProfileImage(null);
    setImagePreview('');
    setIsImageDeleted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // JSON 데이터 생성
    const jsonData = {
      name: name,
      age: age,
      gender: gender
    };
    
    // JSON 데이터를 Blob으로 변환하여 추가
    const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    
    // 이미지 파일 추가
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    // 이미지 삭제 여부 추가
    formData.append('imageDeleted', isImageDeleted);
    
    updateProfileMutation.mutate(formData);
  };

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      return await instance.patch('/members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mypage']);
      showToast('프로필이 성공적으로 업데이트되었습니다.');
      navigate('/mypage');
    },
    onError: (error) => {
      showToast('프로필 업데이트에 실패했습니다: ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  const handleCancel = () => {
    navigate('/mypage');
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>회원정보 수정</h1>
      
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.profileImageSection}>
            <div className={styles.imageContainer}>
              <img 
                src={isImageDeleted ? `${instance.defaults.baseURL}/images/noImage.png` 
                   : (imagePreview || `${instance.defaults.baseURL}/images/noImage.png`)} 
                alt="프로필 이미지" 
                className={styles.profileImage}
              />
              <div className={styles.imageActions}>
                <button 
                  type="button"
                  className={styles.imageEditButton}
                  onClick={() => fileInputRef.current.click()}
                >
                  <span>+</span>
                </button>
                <button 
                  type="button"
                  className={styles.imageDeleteButton}
                  onClick={handleImageDelete}
                >
                  <span>×</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>나이</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={styles.select}
              required
            >

              {[...Array(90)].map((_, i) => (
                <option key={i} value={i + 15}>
                  {i + 15}세
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>성별</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={gender === 'MALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className={styles.radioInput}
                />
                <span>남자</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={gender === 'FEMALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className={styles.radioInput}
                />
                <span>여자</span>
              </label>
            </div>
          </div>
          
          <div className={styles.formActions}>
            <Button type="submit">수정 완료</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>취소</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 