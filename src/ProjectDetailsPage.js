import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from './contexts/LanguageContext';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

const ProjectDetailsPage = () => {
  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { components, description } = location.state;

  const [generatedContent, setGeneratedContent] = useState({
    code: '',
    principles: '',
    guide: ''
  });

  const [copySuccess, setCopySuccess] = useState('');
  const [loadingStates, setLoadingStates] = useState({
    code: false,
    principles: false,
    guide: false
  });

  const [errorStates, setErrorStates] = useState({
    code: '',
    principles: '',
    guide: ''
  });

  const [generationProgress, setGenerationProgress] = useState({
    code: 0,
    principles: 0,
    guide: 0
  });

  const fetchContentFromGemini = async (prompt, section) => {
    let progressInterval;
    try {
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => ({
          ...prev,
          [section]: prev[section] >= 90 ? 90 : prev[section] + 10
        }));
      }, 500);

      const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => {
              clearInterval(progressInterval);
              setGenerationProgress(prev => ({ ...prev, [section]: 0 }));
              reject(new Error('Request timeout after 60 seconds'));
            }, 60000)
          )
        ]);

      if (result.response && result.response.text()) {
        clearInterval(progressInterval);
        setGenerationProgress(prev => ({ ...prev, [section]: 100 }));
        return result.response.text();
      }

      throw new Error('No valid content in response');

    } catch (error) {
      console.error('Gemini API Error:', error);
      setErrorStates(prev => ({
        ...prev,
        [section]: `Error: ${error.message}. Click regenerate to try again.`
      }));
      throw error;
    } finally {
      clearInterval(progressInterval);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent.code);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  const parseGuideResponse = (response) => {
    try {
      const components = [];
      const lines = response.split('\n');
      let remainingText = [];
      let inTable = false;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        if (trimmedLine.toLowerCase().includes('component')) {
          inTable = true;
          return;
        }

        if (inTable) {
          if (trimmedLine.match(/^\|.+\|.+\|/)) {
            const parts = trimmedLine.split('|').filter(p => p.trim() !== '');
            if (parts.length >= 3) {
              components.push({
                component: parts[0].trim(),
                pinConnection: parts[1].trim(),
                notes: parts[2].trim()
              });
            }
          }
        } else {
          remainingText.push(trimmedLine);
        }
      });

      return { 
        components, 
        remainingText: remainingText.join('\n'),
        rawResponse: response
      };
    } catch (error) {
      console.error("Error parsing guide response:", error);
      return { components: [], remainingText: response, rawResponse: response };
    }
  };

  const generatePrompts = (components, description) => {
    const componentsList = components.map(c => `${c.quantity} ${c.name}`).join(', ');
    
    return {
      code: `Generate Arduino code for: ${componentsList}. Project: ${description}.
             Include necessary libraries, setup(), loop(), and comments.
             Return only the code with no explanations.`,
      
      principles: `As a teacher explaining to a secondary student, provide a clear, point-form explanation of the electrical principles for: ${componentsList}

                  Structure your response exactly like this:

                  Basic Concepts:
                  • [Explain voltage, current basics relevant to these components]
                  • [Explain resistance basics if relevant]
                  
                  Component Functions:
                  ${components.map(c => `
                  ${c.name}:
                  • Purpose: [Explain main function]
                  • Working Principle: [Explain how it works]
                  • Voltage/Current Requirements: [Specify requirements]`).join('\n')}
                  
                  Safety Considerations:
                  • [List key safety points]
                  • [List precautions]
                  
                  Keep explanations simple and student-friendly. Use bullet points only.`,
      
      guide: `Create connection guide for: ${componentsList}.
              Use markdown table format with Component, Pin Connections, Notes columns.
              Make it concise with only essential details.
              Put additional information below the table.`
    };
  };

  const fetchSectionContent = async (prompt, section) => {
    setLoadingStates(prev => ({ ...prev, [section]: true }));
    setErrorStates(prev => ({ ...prev, [section]: '' }));

    try {
      const content = await fetchContentFromGemini(prompt, section);
      setGeneratedContent(prev => ({
        ...prev,
        [section]: content
      }));
    } catch (error) {
      console.error(`Error generating ${section} content:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleRegenerate = async (section) => {
    const prompts = generatePrompts(components, description);
    await fetchSectionContent(prompts[section], section);
  };

  useEffect(() => {
    const generateInitialContent = async () => {
      if (!components || components.length === 0) return;

      const prompts = generatePrompts(components, description);
      
      await Promise.all([
        fetchSectionContent(prompts.code, 'code'),
        fetchSectionContent(prompts.principles, 'principles'),
        fetchSectionContent(prompts.guide, 'guide')
      ]);
    };

    generateInitialContent();
  }, [components, description]);

  const RegenerateButton = ({ section }) => (
    <button
      onClick={() => handleRegenerate(section)}
      disabled={loadingStates[section]}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: loadingStates[section] ? 'not-allowed' : 'pointer',
        marginLeft: '1rem'
      }}
    >
      {loadingStates[section] ? 'Regenerating...' : 'Regenerate'}
    </button>
  );

  const content = {
    en: {
      title: "Project Details",
      backButton: "Back to Function Page",
      codeSection: "Arduino Code",
      circuitPrinciples: "Circuit Principles",
      connectionGuide: "Connection Guide",
      additionalNotes: "Additional Notes"
    },
    zh: {
      title: "項目詳情",
      backButton: "返回功能頁面",
      codeSection: "Arduino 代碼",
      circuitPrinciples: "電路原理",
      connectionGuide: "連接指南",
      additionalNotes: "附加說明"
    }
  };

  const text = content[language];

  const ProgressBar = ({ progress, section }) => (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#f0f0f0',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#75BDE0',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
      {progress > 0 && progress < 100 && (
        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
          {language === 'en' 
            ? `Generating ${section}: ${progress}%`
            : `正在生成${section === 'code' ? '代碼' : section === 'principles' ? '原理' : '接線指南'}：${progress}%`}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <h1 style={{ color: '#3B7097', marginBottom: '2rem', textAlign: 'center' }}>{text.title}</h1>
      
      <div style={{ position: 'absolute', top: '1rem', left: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#3B7097',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {text.backButton}
        </button>
      </div>
      
      <section style={{ marginBottom: '2rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#3B7097' }}>{text.codeSection}</h2>
          <div>
            <button onClick={copyToClipboard} style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#3B7097',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              {copySuccess || (language === 'en' ? 'Copy Code' : '複製代碼')}
            </button>
            <RegenerateButton section="code" />
          </div>
        </div>
        {generationProgress.code > 0 && <ProgressBar progress={generationProgress.code} section="code" />}
        <pre style={{ 
          backgroundColor: '#f4f4f4', 
          padding: '1rem', 
          borderRadius: '5px',
          position: 'relative'
        }}>
          <code>
            {loadingStates.code ? (language === 'en' ? 'Generating...' : '生成中...') : 
             errorStates.code || generatedContent.code || (language === 'en' ? "Loading..." : "加載中...")}
          </code>
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#3B7097' }}>{text.circuitPrinciples}</h2>
          <RegenerateButton section="principles" />
        </div>
        {generationProgress.principles > 0 && <ProgressBar progress={generationProgress.principles} section="principles" />}
        <div style={{ 
          backgroundColor: '#f4f4f4',
          padding: '1.5rem',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          textAlign: loadingStates.principles ? 'center' : 'left',
          margin: 0,
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'auto',
          minHeight: '100px',
          display: 'flex',
          alignItems: loadingStates.principles ? 'center' : 'flex-start',
          justifyContent: loadingStates.principles ? 'center' : 'flex-start'
        }}>
          {loadingStates.principles ? (
            <div>{language === 'en' ? 'Generating...' : '生成中...'}</div>
          ) : errorStates.principles ? (
            <div>{errorStates.principles}</div>
          ) : generatedContent.principles ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {generatedContent.principles}
            </div>
          ) : (
            <div>{language === 'en' ? "Loading..." : "加載中..."}</div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#3B7097' }}>{text.connectionGuide}</h2>
          <RegenerateButton section="guide" />
        </div>
        {generationProgress.guide > 0 && <ProgressBar progress={generationProgress.guide} section="guide" />}
        <div style={{ 
          backgroundColor: '#f4f4f4',
          padding: '1rem',
          borderRadius: '5px'
        }}>
          {loadingStates.guide ? (
            <div>{language === 'en' ? 'Generating...' : '生成中...'}</div>
          ) : errorStates.guide ? (
            <div>{errorStates.guide}</div>
          ) : generatedContent.guide ? (
            <>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                tableLayout: 'fixed',
                fontSize: '0.9em'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#75BDE0', 
                    color: 'white',
                    textAlign: 'left'
                  }}>
                    <th style={{ 
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      width: '20%'
                    }}>{text.connectionGuide.split(' ')[0]}</th>
                    <th style={{ 
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      width: '35%'
                    }}>{language === 'en' ? 'Pin Connections' : '引腳連接'}</th>
                    <th style={{ 
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      width: '45%'
                    }}>{language === 'en' ? 'Notes' : '備註'}</th>
                  </tr>
                </thead>
                <tbody>
                  {parseGuideResponse(generatedContent.guide).components.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ 
                        padding: '12px 15px',
                        backgroundColor: 'white',
                        fontWeight: '500',
                        verticalAlign: 'top'
                      }}>
                        {item.component}
                      </td>
                      <td style={{ 
                        padding: '12px 15px',
                        backgroundColor: 'white',
                        whiteSpace: 'pre-line',
                        verticalAlign: 'top'
                      }}>
                        {item.pinConnection.split('\n').map((line, i) => (
                          <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                        ))}
                      </td>
                      <td style={{ 
                        padding: '12px 15px',
                        backgroundColor: 'white',
                        whiteSpace: 'pre-line',
                        verticalAlign: 'top'
                      }}>
                        {item.notes.split('\n').map((line, i) => (
                          <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {parseGuideResponse(generatedContent.guide).remainingText && (
                <div style={{ 
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ 
                    color: '#3B7097',
                    marginBottom: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    {text.additionalNotes}
                  </h3>
                  <div style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.9em'
                  }}>
                    {parseGuideResponse(generatedContent.guide).remainingText}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>{language === 'en' ? "Loading..." : "加載中..."}</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailsPage;