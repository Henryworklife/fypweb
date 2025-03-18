import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const { language, setLanguage } = useContext(LanguageContext);

  const navItems = [
    { path: '/', label: language === 'en' ? 'Home' : '主頁' },
    { path: '/about', label: language === 'en' ? 'About' : '關於' },
    { path: '/function', label: language === 'en' ? 'Function' : '功能' },
    { path: '/contact', label: language === 'en' ? 'Contact' : '聯絡' }
  ];

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // Force a re-render of the component
    window.location.reload();
  };

  return (
    <nav style={{ backgroundColor: '#3B7097', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <select 
        value={language} 
        onChange={handleLanguageChange}
        style={{ 
          backgroundColor: '#F6E2BC', 
          color: '#3B7097', 
          padding: '0.5rem', 
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
      <ul style={{ listStyle: 'none', display: 'flex', margin: 0, padding: 0 }}>
        {navItems.map((item) => (
          <li key={item.path} style={{ marginLeft: '1rem' }}>
            <Link 
              to={item.path} 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                backgroundColor: location.pathname === item.path ? '#75BDE0' : 'transparent',
                borderRadius: '5px'
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
