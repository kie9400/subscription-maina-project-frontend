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
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleRowClick = (memberId) => {
    fetchMemberDetail(memberId);
  };

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
    return (
      <>
        <div className={styles.actionButtons}>
          <button className={styles.addButton}>새 플랫폼 추가</button>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.platformTable}>
            <thead>
              <tr>
                <th>로고</th>
                <th>플랫폼 명</th>
                <th>카테고리</th>
                <th>구독자 수</th>
                <th>등록일</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  구현 예정입니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderCategoriesTab = () => {
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
                <th>플랫폼 수</th>
                <th>등록일자</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className={styles.emptyState}>
                  구현 예정입니다.
                </td>
              </tr>
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