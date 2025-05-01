# 💡구독 관리 및 조회 서비스, 구독 매니아  
<p align="center">
<img src="https://github.com/user-attachments/assets/94909ab5-9e2e-4690-869c-f454fe72ab67" height="300px" width="300px"/>
</p>

### 개발 배경

구독 서비스 시장 규모는 매년 증가되는 추세입니다.

2025년에는 무려 100조원 규모로 확대될 예정이기에 더 많은 사람이 구독 서비스를 이용할 것으로 예상됩니다.

그리하여 사용자가 자신의 구독내역을 효율적으로 관리할 수 있도록 사용자 친화적인 구독 관리 서비스를 제공하는 것이 목표입니다. 

## 📚목차
- [📰 프로젝트 개요](#프로젝트-개요)
- [📌 프로젝트 소개](#프로젝트-소개)
- [📄 기술 시연](#기술-시연)
- [📄 문서 링크 모음](#문서-링크-모음)
- [📊 ERD](#erd)
- [🛠️ 기술 스택](#기술-스택)
- [📑 기타 및 출처](#기타-및-출처)
  
---

## 📰프로젝트 개요

- **프로젝트 명** : 구독 매니아
- **프로젝트 개발자** : 송호근 (BE/FE) | 1인
- **진행 기간** : 2025.04.06 ~ 25.05.01
- **서비스 링크** : [구독 매니아](http://subsmania.shop)
- **프론트 엔드 Repo 링크** : [LINK](https://github.com/kie9400/subscription-maina-project-frontend)

---

## 📌프로젝트 소개
**구독 매니아**는 사용자가 직접 구독 중인 서비스를 등록하고,  
결제일 알림을 이메일로 받아볼 수 있는 **개인 구독 관리 서비스**입니다.

- 카테고리별로 다양한 구독 플랫폼을 조회할 수 있습니다.
- 내 구독내역과 결제일 알람을 통해 자신의 구독 내역을 관리할 수 있습니다.
- 각 플랫폼에 대해 사용자가 리뷰(피드백)를 남기고 평가할 수 있습니다.
- 관리자는 회원, 플랫폼, 카테고리를 효율적으로 관리하여 해당 서비스를 운영할 수 있는 기능을 제공합니다.

---

## 📺기술 시연
| 회원가입(이메일인증) | 회원가입(정보입력) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/f9cc8b49-9f9e-4652-b090-2b4db274f2b2" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/f7e65bab-866c-4fdb-bc89-d3bcb89cba84" width="380" height="230"/> |

| 로그인 | 아이디 찾기 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/9cd8c549-5dd1-496e-a617-fdc032039f01" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/de6c358c-283b-4a67-a7ef-8be8e8b2117d" width="380" height="230"/> |

| 비밀번호 찾기 | 플랫폼 조회 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/5b4a9072-3e32-422c-abdb-af429db28baa" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/cd1d8630-dcbc-4518-8d7e-2ce4abcf62a6" width="380" height="230"/> |

| 구독 등록 | 리뷰 등록 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/59cdf913-c2a0-43a4-87bd-e3daf0658708" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/46b3d733-167b-46ff-b338-4f64e7e23735" width="380" height="230"/> |

| 리뷰 수정 | 리뷰 삭제 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/b353b63d-0d74-4a3f-8f03-d5c6c6d71979" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/968f46e2-9bce-425d-9f6b-39e12c48025f" width="380" height="230"/> |

| 마이페이지(개인정보 수정) | 마이페이지(비밀번호 변경) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/c9633ccb-f5ad-4ee9-a742-741b17174c40" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/7ec6e426-4417-4f9e-9f75-9a5bc9d09ddb" width="380" height="230"/> |

| 마이페이지(회원 탈퇴) | 마이페이지(내 구독 내역 조회) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ae7db03e-7fa9-4d2f-92b4-faf94e444992" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/37a89b81-937f-4829-897a-5c5e73f0ec44" width="380" height="230"/> |

| 마이페이지(구독 내역 수정) | 마이페이지(구독 취소) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/38603001-3870-4538-b0ba-78cdcfbbba17" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/80e36b62-0dfb-4738-a0a8-eddb9fb97463" width="380" height="230"/> |

| 마이페이지(내 리뷰 내역 조회) | 마이페이지(리뷰 삭제) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/c62816fb-0e7a-4ad4-bbef-1efa02a577fe" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/dd55a352-ecd8-4895-8fb9-443504a6de09" width="380" height="230"/> |

| 관리자페이지(회원 목록 조회) | 관리자페이지(회원 탈퇴) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/93ae738d-1732-4c1d-8644-5ac32e95bb50" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/c0477301-aac9-42bc-82a5-3bf699e13cef" width="380" height="230"/> |

| 관리자페이지(플랫폼 목록 조회) | 관리자페이지(플랫폼 등록) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/64b15038-980a-44af-8ae2-47062e4eae5e" width="380" height="230"/> | <img src="https://github.com/user-attachments/assets/888d5495-8036-4a7e-abc8-2a99d6b40130" width="380" height="230"/> |

| 관리자페이지(플랫폼 삭제) | 
| :---: |
| <img src="https://github.com/user-attachments/assets/f26d0d1d-a344-4622-bf55-5fb590dd3fb1" width="380" height="230"/> | 

---

## 📄문서 링크 모음
👉 [📄 요구사항 명세서](https://docs.google.com/spreadsheets/d/11YX8Xix8UgedELQxZVVrAmBjwvqnHhks1MJZG7j92mM/edit?gid=1034760520#gid=1034760520)

👉 [🖌 와이어 프레임](https://www.figma.com/design/3A81g004CjFSzGUwJYui4K/%EA%B5%AC%EB%8F%85%EB%A7%A4%EB%8B%88%EC%95%84?node-id=0-1&p=f&t=Jk7p2ywlCuIzTUhI-0)


---

## 📊ERD
<img src="https://github.com/user-attachments/assets/0552df77-3634-4957-af77-8fc025aced5d" alt="ERD" width="1000"/>

👉 [LINK](https://www.erdcloud.com/d/YyJTwMGCSLFs6Fb5b)

---

## 🛠기술 스택


<div align=center> 
  <br>
  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/react query-FF4154?style=for-the-badge&logo=reactquery&logoColor=black">
  <img src="https://img.shields.io/badge/css modules-1572B6?style=for-the-badge&logo=cssmodules&logoColor=white">
  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/vite-02303A?style=for-the-badge&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=black">
  <br>
  
  <img src="https://img.shields.io/badge/spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white">
  <img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white"> 
  <img src="https://img.shields.io/badge/queryDsl-2088FF?style=for-the-badge&logo=query&logoColor=white">
  <img src="https://img.shields.io/badge/spring boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
  <img src="https://img.shields.io/badge/spring security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">
  <img src="https://img.shields.io/badge/gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white">  
  <br>
  
  <img src="https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white">
  <img src="https://img.shields.io/badge/Amazon%20Route53-8C4FFF?style=for-the-badge&logo=amazonroute53&logoColor=white">
  <img src="https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=Amazon%20EC2&logoColor=white">
  <img src="https://img.shields.io/badge/Amazon%20RDS-527FFF?style=for-the-badge&logo=Amazon%20RDS&logoColor=white">
  <img src="https://img.shields.io/badge/GitHub Actions-2088FF?style=for-the-badge&logo=GitHub Actions&logoColor=white">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white"> 
  <br>
  
  <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> 
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white"> 
</div>

### 요약

| 구분 | 기술 |
|------|------|
| **Frontend** | React, React Query, Vite, CSS Modules, Chart.js, JavaScript |
| **Backend** | Spring Boot, Spring Security, JWT, Spring Data JPA, Java, QueryDSL |
| **Infra** | EC2, S3, GitHub Actions, Docker, Route53, RDS |
| **DB** | MySQL, Redis |

---

## 📑기타 및 출처

아이콘 출처 : https://www.iconfinder.com/
