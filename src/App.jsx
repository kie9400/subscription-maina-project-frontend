import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import MainPage from './pages/MainHome';
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import SignupInfoPage from './pages/SignupInfoPage';
import TermsPage from './pages/TermsPage';
import Footer from './components/Footer';
import FindIdPage from './pages/FindIdPage';
import PlatformListPage from './pages/PlatformListPage';
import PlatformDetailPage from './pages/PlatformDetailPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ScrollToTop from './util/ScrollToTop';
import './styles/App.css';

const queryClient = new QueryClient({
  //리액트 쿼리 쿼리 클라이언트 기본 옵션 설정
  defaultOptions: {
    queries: {
      //실패 시 재시도 횟수 1
      retry: 1,
      //탭 포커스 시 자동 리패치 방치
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Header />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<TermsPage />} />
                <Route path="/signup/email" element={<VerificationPage />} />
                <Route path="/signup/info" element={<SignupInfoPage />} />
                <Route path="/find_id" element={<FindIdPage />} />
                <Route path="/platforms" element={<PlatformListPage />} />
                <Route path="/platforms/:platformId" element={<PlatformDetailPage />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
