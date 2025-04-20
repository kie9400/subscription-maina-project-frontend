import React from 'react'
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Header />    
      <hr className="line" />
      <MainPage />
      <Footer />
    </div>
  );
}

export default App;
