import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { instance } from '../api/axiosInstance';
import ConfirmModal from './ConfirmModal';
import styles from '../styles/ReviewCard.module.css';

const ReviewCard = ({ review, onDelete, onEdit, onRecommend }) => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthor = user?.memberId === review.memberId;

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(review.reviewId);
    setShowMenu(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(review);
    setShowMenu(false);
  };

  const handleRecommend = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    onRecommend(review.reviewId);
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <img 
          src={`${instance.defaults.baseURL}${review.memberImage}`} 
          alt={`${review.memberName}의 프로필`} 
          className={styles.profileImage}
        />
        <span className={styles.reviewerName}>{review.memberName}</span>
        <span className={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
        <div className={styles.rightSection}>
          <div className={styles.rating}>
            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
          </div>
          {isAuthor && (
            <div className={styles.menuContainer}>
              <button className={styles.menuButton} onClick={handleMenuClick}>
                ⋮
              </button>
              {showMenu && (
                <div className={styles.menuDropdown}>
                  <button onClick={handleEdit}>수정</button>
                  <button onClick={handleDelete}>삭제</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className={styles.reviewContent}>{review.content}</p>
      <div className={styles.reviewFooter}>
        <button 
          className={`${styles.recommendButton} ${review.isRecommended ? styles.recommended : ''}`}
          onClick={handleRecommend}
        >
          {review.isRecommended ? '추천 취소' : '추천'} {review.recommendCount}
        </button>
      </div>

      <ConfirmModal
        isOpen={showLoginModal}
        message={"로그인 하셔야 가능합니다. <br/>로그인 페이지로 이동 하시겠습니까?"}
        onConfirm={() => navigate('/login')}
        onCancel={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ReviewCard; 