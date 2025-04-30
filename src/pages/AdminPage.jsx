import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from '../styles/AdminPage.module.css';
const BASE_URL = import.meta.env.VITE_S3_URL;

const AdminPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('members'); // members, platforms, categories
  const [currentPage, setCurrentPage] = useState(1);
  const [platformPage, setPlatformPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platformImage, setPlatformImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [platformForm, setPlatformForm] = useState({
    platformName: '',
    platformDescription: '',
    categoryId: '',
    serviceAt: '',
    subsPlans: [{ planName: '', price: '', billingCycle: '월' }]
  });

  const pageSize = 10;

  // 권한 체크
  React.useEffect(() => {
    if (!isAdmin) {
      showToast('관리자만 접근할 수 있는 페이지입니다.', 'error');
      navigate('/');
    }
  }, [isAdmin, navigate, showToast]);

  // 회원 목록 조회
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['admin', 'members', currentPage],
    queryFn: async () => {
      const response = await instance.get(`/admin/members?page=${currentPage}&size=${pageSize}`);
      return response.data;
    },
    enabled: isAdmin && activeTab === 'members'
  });

  // 플랫폼 목록 조회
  const { data: platformsData, isLoading: platformsLoading } = useQuery({
    queryKey: ['admin', 'platforms', platformPage],
    queryFn: async () => {
      const response = await instance.get(`/admin/platforms?page=${platformPage}&size=${pageSize}`);
      return response.data;
    },
    enabled: isAdmin && activeTab === 'platforms'
  });

  // 카테고리 목록 조회
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const response = await instance.get('/categories');
      return response.data;
    },
    enabled: isAdmin && (activeTab === 'categories' || showPlatformModal)
  });

  // 플랫폼 삭제
  const deletePlatformMutation = useMutation({
    mutationFn: async (platformId) => {
      return await instance.delete(`/platforms/${platformId}`);
    },
    onSuccess: () => {
      showToast('플랫폼이 삭제되었습니다.');
      queryClient.invalidateQueries(['admin', 'platforms']);
    },
    onError: (error) => {
      showToast('플랫폼 삭제에 실패했습니다: ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  // 플랫폼 추가
  const addPlatformMutation = useMutation({
    mutationFn: async (formData) => {
      return await instance.post('/platforms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      showToast('플랫폼이 추가되었습니다.');
      queryClient.invalidateQueries(['admin', 'platforms']);
      setShowPlatformModal(false);
      resetPlatformForm();
    },
    onError: (error) => {
      showToast('플랫폼 추가에 실패했습니다: ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  // 회원 상세 정보 조회
  const fetchMemberDetail = async (memberId) => {
    try {
      const response = await instance.get(`/admin/members/${memberId}`);
      if (response.data) {
        setSelectedMember(response.data);
        setShowModal(true);
      } else {
        showToast('회원 정보를 찾을 수 없습니다.', 'error');
      }
    } catch (error) {
      showToast('회원 정보 조회에 실패했습니다.', 'error');
    }
  };

  // 회원 탈퇴 처리
  const deleteMutation = useMutation({
    mutationFn: async (memberId) => {
      return await instance.delete(`/admin/members/${memberId}`);
    },
    onSuccess: () => {
      showToast('회원이 탈퇴 처리되었습니다.');
      queryClient.invalidateQueries(['admin', 'members']);
    },
    onError: (error) => {
      showToast('회원 탈퇴 처리에 실패했습니다: ' + (error.response?.data?.message || '오류가 발생했습니다.'), 'error');
    }
  });

  const handleDeleteMember = (memberId, event) => {
    event.stopPropagation();
    if (window.confirm('정말로 이 회원을 탈퇴시키겠습니까?')) {
      deleteMutation.mutate(memberId);
    }
  };

  const handleDeletePlatform = (platformId, event) => {
    event.stopPropagation();
    if (window.confirm('정말로 이 플랫폼을 삭제하시겠습니까?')) {
      deletePlatformMutation.mutate(platformId);
    }
  };

  const handleRowClick = (memberId) => {
    fetchMemberDetail(memberId);
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlatformImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 플랫폼 폼 입력 핸들러
  const handlePlatformInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformForm({
      ...platformForm,
      [name]: value
    });
  };

  // 플랜 입력 핸들러
  const handlePlanInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPlans = [...platformForm.subsPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value
    };
    setPlatformForm({
      ...platformForm,
      subsPlans: updatedPlans
    });
  };

  // 플랜 추가 핸들러
  const handleAddPlan = () => {
    setPlatformForm({
      ...platformForm,
      subsPlans: [...platformForm.subsPlans, { planName: '', price: '', billingCycle: '월' }]
    });
  };

  // 플랜 삭제 핸들러
  const handleRemovePlan = (index) => {
    const updatedPlans = platformForm.subsPlans.filter((_, i) => i !== index);
    setPlatformForm({
      ...platformForm,
      subsPlans: updatedPlans
    });
  };

  // 플랫폼 추가 제출 핸들러
  const handleSubmitPlatform = (e) => {
    e.preventDefault();
    
    if (!platformImage) {
      showToast('플랫폼 이미지를 업로드해주세요.', 'error');
      return;
    }

    if (!platformForm.platformName || !platformForm.platformDescription || !platformForm.categoryId || !platformForm.serviceAt) {
      showToast('모든 필수 항목을 입력해주세요.', 'error');
      return;
    }

    // 유효한 플랜이 하나 이상 있는지 확인
    const hasValidPlan = platformForm.subsPlans.some(
      plan => plan.planName && plan.price
    );

    if (!hasValidPlan) {
      showToast('최소 하나 이상의, 올바른 구독 플랜을 추가해주세요.', 'error');
      return;
    }

    // 폼데이터 생성
    const formData = new FormData();
    
    // 이미지는 'image' 필드로 추가
    formData.append('image', platformImage);
    
    // JSON 데이터는 'data' 필드로 추가
    const platformData = {
      platformName: platformForm.platformName,
      platformDescription: platformForm.platformDescription,
      categoryId: Number(platformForm.categoryId),
      serviceAt: platformForm.serviceAt,
      subsPlans: platformForm.subsPlans.filter(plan => plan.planName && plan.price)
    };
    
    // 'data' 필드로 JSON 문자열 추가
    formData.append('data', JSON.stringify(platformData));
    
    addPlatformMutation.mutate(formData);
  };

  // 플랫폼 폼 초기화
  const resetPlatformForm = () => {
    setPlatformForm({
      platformName: '',
      platformDescription: '',
      categoryId: '',
      serviceAt: '',
      subsPlans: [{ planName: '', price: '', billingCycle: '월' }]
    });
    setPlatformImage(null);
    setImagePreview(null);
  };

  // 탭 변경 시 페이지 초기화
  React.useEffect(() => {
    if (activeTab === 'members') {
      setCurrentPage(1);
    } else if (activeTab === 'platforms') {
      setPlatformPage(1);
    }
  }, [activeTab]);

  const renderMembersTab = () => {
    if (membersLoading) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    return (
      <>
        <div className={styles.tableContainer}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>프로필</th>
                <th>사용자명</th>
                <th>이메일</th>
                <th>성별</th>
                <th>나이</th>
                <th>가입날짜</th>
                <th>휴대폰번호</th>
                <th>탈퇴</th>
              </tr>
            </thead>
            <tbody>
              {membersData?.data.map((member) => (
                <tr key={member.memberId} onClick={() => handleRowClick(member.memberId)}>
                  <td>
                    <div className={styles.profileImageWrapper}>
                      <img 
                        src={`${BASE_URL}${member.image}`} 
                        alt={member.name} 
                        className={styles.profileImage}
                      />
                    </div>
                  </td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.gender === 'MALE' ? '남' : '여'}</td>
                  <td>{member.age}</td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td>{member.phoneNumber}</td>
                  <td>
                    <button 
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteMember(member.memberId, e)}
                    >
                      탈퇴
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {membersData?.pageInfo && membersData.pageInfo.totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              이전
            </button>
            <span className={styles.pageInfo}>
              {currentPage} / {membersData.pageInfo.totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === membersData.pageInfo.totalPages}
              className={styles.pageButton}
            >
              다음
            </button>
          </div>
        )}

        {showModal && selectedMember && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3>회원 상세 정보</h3>
              <div className={styles.memberDetail}>
                <div className={styles.profileSection}>
                  <img 
                    src={`${BASE_URL}${selectedMember.data.image}`} 
                    alt={selectedMember.data.name} 
                    className={styles.detailProfileImage}
                  />
                  <h4>{selectedMember.data.name}</h4>
                </div>
                <div className={styles.infoSection}>
                  <div className={styles.infoRow}>
                    <label>이메일</label>
                    <span>{selectedMember.data.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>성별</label>
                    <span>{selectedMember.data.gender === 'MALE' ? '남자' : '여자'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>나이</label>
                    <span>{selectedMember.data.age}세</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>가입일자</label>
                    <span>{new Date(selectedMember.data.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>휴대폰 번호</label>
                    <span>{selectedMember.data.phoneNumber}</span>
                  </div>
                </div>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderPlatformsTab = () => {
    if (platformsLoading) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    return (
      <>
        <div className={styles.actionButtons}>
          <button 
            className={styles.addButton}
            onClick={() => setShowPlatformModal(true)}
          >
            새 플랫폼 추가
          </button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.platformTable}>
            <thead>
              <tr>
                <th>로고</th>
                <th>플랫폼 명</th>
                <th>카테고리</th>
                <th>서비스시작일</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {platformsData?.data.length > 0 ? (
                platformsData.data.map((platform) => (
                  <tr key={platform.platformId}>
                    <td>
                      <div className={styles.logoWrapper}>
                        <img 
                          src={`${BASE_URL}${platform.platformImage}`} 
                          alt={platform.platformName} 
                          className={styles.platformLogo}
                        />
                      </div>
                    </td>
                    <td>{platform.platformName}</td>
                    <td>{platform.categoryName}</td>
                    <td>{new Date(platform.serviceAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className={styles.deleteButton}
                        onClick={(e) => handleDeletePlatform(platform.platformId, e)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.emptyState}>
                    등록된 플랫폼이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {platformsData?.pageInfo && platformsData.pageInfo.totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => setPlatformPage(prev => prev - 1)}
              disabled={platformPage === 1}
              className={styles.pageButton}
            >
              이전
            </button>
            <span className={styles.pageInfo}>
              {platformPage} / {platformsData.pageInfo.totalPages}
            </span>
            <button 
              onClick={() => setPlatformPage(prev => prev + 1)}
              disabled={platformPage === platformsData.pageInfo.totalPages}
              className={styles.pageButton}
            >
              다음
            </button>
          </div>
        )}

        {/* 플랫폼 추가 모달 */}
        {showPlatformModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPlatformModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3>새 플랫폼 추가</h3>
              <form onSubmit={handleSubmitPlatform} className={styles.platformForm}>
                <div className={styles.imageUploadSection}>
                  <div 
                    className={styles.imagePreviewArea}
                    style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}
                  >
                    {!imagePreview && <p>이미지를 업로드해주세요</p>}
                  </div>
                  <label className={styles.imageUploadButton}>
                    이미지 업로드
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className={styles.inputGroup}>
                  <label>플랫폼 명*</label>
                  <input 
                    type="text" 
                    name="platformName" 
                    value={platformForm.platformName} 
                    onChange={handlePlatformInputChange}
                    placeholder="플랫폼 이름을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>설명*</label>
                  <textarea 
                    name="platformDescription" 
                    value={platformForm.platformDescription} 
                    onChange={handlePlatformInputChange}
                    placeholder="플랫폼에 대한 설명을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>카테고리*</label>
                  <select 
                    name="categoryId" 
                    value={platformForm.categoryId} 
                    onChange={handlePlatformInputChange}
                    required
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categoriesData?.data.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>서비스 시작일*</label>
                  <input 
                    type="date" 
                    name="serviceAt" 
                    value={platformForm.serviceAt} 
                    onChange={handlePlatformInputChange}
                    required
                  />
                </div>

                <div className={styles.plansSection}>
                  <div className={styles.planSectionHeader}>
                    <h4>구독 플랜</h4>
                    <button 
                      type="button" 
                      onClick={handleAddPlan}
                      className={styles.addPlanButton}
                    >
                      + 플랜 추가
                    </button>
                  </div>
                  
                  {platformForm.subsPlans.map((plan, index) => (
                    <div key={index} className={styles.planRow}>
                      <div className={styles.planInputs}>
                        <div className={styles.inputGroup}>
                          <label>플랜 이름*</label>
                          <input 
                            type="text" 
                            name="planName" 
                            value={plan.planName} 
                            onChange={(e) => handlePlanInputChange(index, e)}
                            placeholder="플랜 이름"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>가격*</label>
                          <input 
                            type="number" 
                            name="price" 
                            value={plan.price} 
                            onChange={(e) => handlePlanInputChange(index, e)}
                            placeholder="가격"
                            min="0"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>결제 주기</label>
                          <select 
                            name="billingCycle" 
                            value={plan.billingCycle} 
                            onChange={(e) => handlePlanInputChange(index, e)}
                          >
                            <option value="월">월</option>
                            <option value="년">년</option>
                          </select>
                        </div>
                      </div>
                      {platformForm.subsPlans.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemovePlan(index)}
                          className={styles.removePlanButton}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.modalButtons}>
                  <button 
                    type="button" 
                    onClick={() => setShowPlatformModal(false)}
                    className={styles.cancelButton}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={addPlatformMutation.isPending}
                  >
                    {addPlatformMutation.isPending ? '처리 중...' : '추가하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCategoriesTab = () => {
    if (categoriesLoading) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    return (
      <>
        <div className={styles.actionButtons}>
          <button className={styles.addButton}>새 카테고리 추가</button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.categoryTable}>
            <thead>
              <tr>
                <th>아이콘</th>
                <th>카테고리 명</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {categoriesData?.data.length > 0 ? (
                categoriesData.data.map((category) => (
                  <tr key={category.categoryId}>
                    <td>
                      <div className={styles.iconWrapper}>
                        <img 
                          src={`${BASE_URL}${category.categoryImage}`} 
                          alt={category.categoryName} 
                          className={styles.categoryIcon}
                        />
                      </div>
                    </td>
                    <td>{category.categoryName}</td>
                    <td>
                      <button className={styles.deleteButton}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.emptyState}>
                    등록된 카테고리가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>관리자 페이지</h1>
      <div className={styles.contentContainer}>
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'members' ? styles.active : ''}`}
            onClick={() => setActiveTab('members')}
          >
            회원 관리
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'platforms' ? styles.active : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            플랫폼 관리
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'categories' ? styles.active : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            카테고리 관리
          </button>
        </div>

        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'platforms' && renderPlatformsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
      </div>
    </div>
  );
};

export default AdminPage; 