import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import styles from '../styles/EditProfile.module.css';

const EditProfilePage = () => {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef();
  
  // 상태 관리
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  
  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'error');
      navigate('/login');
    }
  }, [isLoggedIn, navigate, showToast]);

  // 마이페이지 기본 정보 (이름, 이미지) 조회
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: async () => {
      const response = await instance.get('/mypage');
      return response.data.data;
    },
    enabled: isLoggedIn,
    onSuccess: (data) => {
      setName(data.name || '');
      setImagePreview(data.image ? `${instance.defaults.baseURL}${data.image}` : '');
    }
  });

  // 내 상세 정보 조회
  const { data: myInfoData, isLoading: infoLoading } = useQuery({
    queryKey: ['mypage', 'info'],
    queryFn: async () => {
      const response = await instance.get('/mypage/info');
      return response.data.data;
    },
    enabled: isLoggedIn,
    onSuccess: (data) => {
      setAge(data.age || '');
      setGender(data.gender || '');
    }
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      return await instance.patch('/mypage/profile', formData, {
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
    formData.append('name', name);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('deleteImage', isImageDeleted);
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate('/mypage');
  };

  // 로딩 상태 확인
  if (profileLoading || infoLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

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
                {(imagePreview || profileData?.image) && !isImageDeleted && (
                  <button 
                    type="button"
                    className={styles.imageDeleteButton}
                    onClick={handleImageDelete}
                  >
                    <span>×</span>
                  </button>
                )}
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
              <option value="">선택하세요</option>
              {[...Array(80)].map((_, i) => (
                <option key={i} value={i + 10}>
                  {i + 10}세
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