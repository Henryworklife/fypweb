import React, { useContext } from 'react';
import { LanguageContext } from './contexts/LanguageContext';
// Add this import statement at the top of the file
import missionImage from './Images/shopping.jpeg';

function Aboutpage() {
  const { language } = useContext(LanguageContext);

  const content = {
    en: {
      title: "About STEM AI Assistant",
      mission: {
        title: "Our Mission",
        description: "At STEM AI Assistant, we are dedicated to revolutionizing STEM education by leveraging artificial intelligence. Our mission is to make learning Arduino and electronics accessible, interactive, and engaging for students of all levels."
      },
      whatWeDo: {
        title: "What We Do",
        items: [
          "Provide AI-powered image recognition for electronic components",
          "Offer detailed educational guidance on Arduino programming and circuit design",
          "Generate custom code based on identified components",
          "Create interactive tutorials and hands-on projects",
          "Continuously improve our AI model to enhance the learning experience"
        ]
      },
      technology: {
        title: "Our Technology",
        description: "We use cutting-edge technologies to power our platform:",
        items: [
          "Custom algorithms for code generation and circuit analysis"
        ]
      },
      getInvolved: {
        title: "Get Involved",
        description: "There are many ways you can be a part of our mission:",
        items: [
          "Try our AI assistant for your next Arduino project",
          "Contribute to our open-source initiatives",
          "Share your feedback to help us improve",
          "Spread the word about AI-assisted STEM learning"
        ]
      }
    },
    zh: {
      title: "關於 STEM AI 助手",
      mission: {
        title: "我們的目標",
        description: "在 STEM AI 助手，我們致力於利用人工智慧革新 STEM 教育。我們的使命是讓所有程度的學生都能輕鬆、互動地學習 Arduino 和電子知識。"
      },
      whatWeDo: {
        title: "我們的工作",
        items: [
          "為電子元件提供 AI 驅動的影像辨識",
          "提供 Arduino 程式設計和電路設計的詳細教育指導",
          "根據識別的元件產生自訂程式碼",
          "創建互動教程和實踐項目",
          "不斷改進我們的 AI 模型以提升學習體驗"
        ]
      },
      technology: {
        title: "我們的技術",
        description: "我們使用尖端技術來支援我們的平台：",
        items: [
          "使用 TensorFlow 和 PyTorch 進行高級圖像識別",
          "使用 React 和 Node.js 來打造響應式和動態的網頁界面",
          "自訂算法用於代碼生成和電路分析"
        ]
      },
      getInvolved: {
        title: "參與其中",
        description: "您可以通過多種方式參與我們的使命：",
        items: [
          "在您的下一個 Arduino 專案中嘗試我們的 AI 助手",
          "為我們的開源計畫做出貢獻",
          "分享您的回饋以幫助我們改進",
          "傳播 AI 輔助 STEM 學習的概念"
        ]
      }
    }
  };

  const text = content[language];

  return (
    <div className="about-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#3B7097', marginBottom: '2rem' }}>{text.title}</h1>
      
      <section className="mission" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#3B7097' }}>{text.mission.title}</h2>
        <p>{text.mission.description}</p>
        {/* Update the img src to use the imported image */}
        <img src={missionImage} alt="Mission Image" style={{ width: '50', marginTop: '2rem' }} />
      </section>
      
      <section className="what-we-do" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#3B7097' }}>{text.whatWeDo.title}</h2>
        <ul>
          {text.whatWeDo.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
      
      <section className="technology" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#3B7097' }}>{text.technology.title}</h2>
        <p>{text.technology.description}</p>
        <ul>
          {text.technology.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
      
      <section className="get-involved" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#3B7097' }}>{text.getInvolved.title}</h2>
        <p>{text.getInvolved.description}</p>
        <ul>
          {text.getInvolved.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Aboutpage;
