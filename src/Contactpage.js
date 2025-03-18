import React, { useContext } from 'react';
import { LanguageContext } from './contexts/LanguageContext';

const Contactpage = () => {
  const { language } = useContext(LanguageContext);

  const content = {
    en: {
      title: "Contact Us",
      intro: "We'd love to hear from you! Whether you have questions about our AI assistant, Arduino projects, or any of our services, please don't hesitate to reach out.",
      contactInfo: "Contact Information",
      phone: "Phone",
      email: "Email",
      address: "EDUHK Address",
      businessHours: "Business Hours",
      monday: "Monday - Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      closed: "Closed",
      emergency: "For emergencies outside of business hours, please contact me 24/7. I will respond as soon as possible."
    },
    zh: {
      title: "聯絡我哋",
      intro: "我哋好樂意聽到你嘅意見！無論你對我哋嘅AI助手、Arduino項目或任何服務有咩問題，請隨時聯絡我哋。",
      contactInfo: "聯絡資料",
      phone: "電話",
      email: "電郵",
      address: "EDUHK 地址",
      businessHours: "營業時間",
      monday: "星期一至五",
      saturday: "星期六",
      sunday: "星期日",
      closed: "休息",
      emergency: "喺營業時間以外如有緊急情況，請隨時聯絡我。我會盡快回覆。"
    }
  };

  const text = content[language];

  return (
    <div style={{ textAlign: 'left', padding: '2rem' }}>
      <h1 style={{ color: '#3B7097', marginBottom: '2rem' }}>{text.title}</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
        {text.intro}
      </p>
      <div style={{ backgroundColor: '#75BDE0', padding: '2rem', borderRadius: '8px' }}>
        <h2 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>{text.contactInfo}</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1.1rem' }}>📞 {text.phone}: (+852) ---</li>
          <li style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#FFFFFF' }}>✉️ {text.email}: henryhenry612@gmail.com</li>
          <li style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#FFFFFF' }}>🏠 {text.address}: 10 Lo Ping Road, Tai Po, New Territories, Hong Kong</li>
        </ul>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#3B7097', marginBottom: '1rem' }}>{text.businessHours}</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{text.monday}: 9:00 AM - 6:00 PM</li>
          <li style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{text.saturday}: 10:00 AM - 4:00 PM</li>
          <li style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{text.sunday}: {text.closed}</li>
        </ul>
      </div>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginTop: '2rem' }}>
        {text.emergency}
      </p>
    </div>
  );
};

export default Contactpage;
