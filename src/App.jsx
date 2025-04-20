import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <hr className="line" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
