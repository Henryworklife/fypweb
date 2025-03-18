import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './contexts/LanguageContext';

// Import your images
import imageRecognition from './Images/Image-Recognition.jpg';
import componentIdentification from './Images/Component-Identification.jpg';
import educationalGuidance from './Images/Educational-Guidance.jpg';
import circuitDesign from './Images/Circuit-Design.jpg';
import codeGeneration from './Images/Code-Generation.jpg';
import interactiveLearning from './Images/Interactive-Learning.jpg';

const Homepage = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const content = {
    en: {
      title: "STEM AI Assistant",
      welcome: "Welcome to the STEM AI Assistant! Our AI-powered platform is designed to guide students through Arduino projects, making learning electronics and programming an interactive and engaging experience.",
      objective: "Our goal is to develop an AI-powered assistant that analyzes photos of components on a table, identifies them, and provides educational guidance on using these components with Arduino.",
      features: [
        { name: "Image Recognition", image: imageRecognition },
        { name: "Component Identification", image: componentIdentification },
        { name: "Educational Guidance", image: educationalGuidance },
        { name: "Circuit Design", image: circuitDesign },
        { name: "Code Generation", image: codeGeneration },
        { name: "Interactive Learning", image: interactiveLearning }
      ],
      implementation: "We use cutting-edge technologies like TensorFlow for image recognition, and React with Node.js for our educational platform. Our user-friendly interface makes it easy to upload photos and interact with the AI assistant.",
      getStarted: "Ready to embark on your Arduino learning journey? Click the button below to start exploring our AI functions!",
      startButton: "Start!"
    },
    zh: {
      title: "STEM 人工智能助手",
      welcome: "歡迎使用STEM人工智慧助理！我們的人工智慧平台旨在指導學生完成Arduino項目，使電子和程式設計學習成為一種互動和引人入勝的體驗。",
      objective: "我們的目標是開發一個人工智慧助手，分析桌子上組件的照片，識別它們，並提供有關如何使用這些組件與Arduino一起使用的教育指導。",
      features: [
        { name: "影像辨識", image: imageRecognition },
        { name: "元件辨識", image: componentIdentification },
        { name: "教育指導", image: educationalGuidance },
        { name: "電路設計", image: circuitDesign },
        { name: "程式碼產生", image: codeGeneration },
        { name: "互動學習", image: interactiveLearning }
      ],
      implementation: "我們使用TensorFlow等尖端技術進行影像識別，並使用React和Node.js建立我們的教育平台。我們的用戶友好介面使上傳照片和與人工智慧助理互動變得容易。",
      getStarted: "準備開始您的Arduino學習之旅了嗎？點擊下面的按鈕開始探索我們的AI功能！",
      startButton: "開始！"
    }
  };

  const text = content[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % text.features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [text.features.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + text.features.length) % text.features.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % text.features.length);
  };

  const handleStart = () => {
    navigate('/function');
  };

  return (
    <div style={{ textAlign: 'left', padding: '2rem' }}>
      <h1 style={{ color: '#3B7097', marginBottom: '2rem' }}>{text.title}</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{text.welcome}</p>
      <h2 style={{ color: '#3B7097', marginTop: '2rem', marginBottom: '1rem' }}>{language === 'en' ? 'Objective' : '目標'}</h2>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{text.objective}</p>
      <h2 style={{ color: '#3B7097', marginTop: '2rem', marginBottom: '1rem' }}>{language === 'en' ? 'Key Features' : '主要特點'}</h2>
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', borderRadius: '10px' }}>
        <img 
          src={text.features[currentSlide].image} 
          alt={text.features[currentSlide].name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'white', margin: 0 }}>{text.features[currentSlide].name}</p>
        </div>
        <button onClick={handlePrevSlide} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer' }}>{'<'}</button>
        <button onClick={handleNextSlide} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer' }}>{'>'}</button>
      </div>
      <h2 style={{ color: '#3B7097', marginTop: '2rem', marginBottom: '1rem' }}>{language === 'en' ? 'Implementation' : '實施'}</h2>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{text.implementation}</p>
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#3B7097', marginBottom: '1rem' }}>{language === 'en' ? 'Get Started' : '開始使用'}</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{text.getStarted}</p>
        <button 
          onClick={handleStart}
          style={{ 
            backgroundColor: '#75BDE0', 
            color: 'white', 
            padding: '10px 20px', 
            fontSize: '1.1rem', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          {text.startButton}
        </button>
      </div>
    </div>
  );
};

export default Homepage;
