import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './contexts/LanguageContext';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as ort from 'onnxruntime-web';

const Functionpage = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedComponents, setDetectedComponents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const fileInputRef = useRef(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modelOutput, setModelOutput] = useState('');

  const content = {
    en: {
      title: "Our AI Functions",
      functions: [
        {
          name: "Image Recognition",
          description: "Analyze photos of electronic components using advanced AI algorithms."
        },
        {
          name: "Component Identification",
          description: "Accurately identify and categorize various electronic components."
        },
        {
          name: "Educational Guidance",
          description: "Provide step-by-step instructions for Arduino projects based on identified components."
        }
      ],
      uploadButton: "Click to Upload Photo",
      resultsTitle: "Detected Components",
      componentName: "Component Name",
      quantity: "Quantity",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      noComponents: "No components detected. Upload an image to start.",
      uploadInstructions: "Upload a photo",
      editButton: "Edit Components",
      saveButton: "Save Changes",
      cancelButton: "Cancel",
      addComponent: "Add Component",
      newComponentName: "New Component",
      confirmButton: "Confirm Project",
      confirmationMessage: "Project confirmed! Thank you for using our service.",
      projectDescriptionLabel: "Describe your Arduino project:",
      projectDescriptionPlaceholder: "Enter your project description here...",
      detectButton: "Detect Objects",
    },
    zh: {
      title: "我哋嘅人工智能功能",
      functions: [
        {
          name: "圖像識別",
          description: "使用先進嘅人工智能算法分析電子元件嘅相片。"
        },
        {
          name: "元件識別",
          description: "準確識別同分類各種電子元件。"
        },
        {
          name: "教育指導",
          description: "根據識別到嘅元件，提供 Arduino 項目嘅逐步指導。"
        }
      ],
      uploadButton: "點擊上傳相片",
      resultsTitle: "檢測到嘅元件",
      componentName: "元件名稱",
      quantity: "數量",
      actions: "操作",
      edit: "編輯",
      delete: "刪除",
      noComponents: "未檢測到元件。上傳相片開始檢測。",
      uploadInstructions: "上傳相片",
      editButton: "編輯元件",
      saveButton: "保存更改",
      cancelButton: "取消",
      addComponent: "添加元件",
      newComponentName: "新元件",
      confirmButton: "確認項目",
      confirmationMessage: "項目已確認！感謝您使用我們的服務。",
      projectDescriptionLabel: "描述你的 Arduino 項目：",
      projectDescriptionPlaceholder: "在此輸入你的項目描述...",
      detectButton: "檢測物件",
    }
  };

  const text = content[language];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setUploadedImage(URL.createObjectURL(file));
      setDetectedComponents([]);
    }
  };

  const handleObjectDetection = async () => {
    if (!selectedImage) {
      setShowErrorMessage(true);
      setModelOutput(language === 'en' 
        ? 'Error: Please upload an image first'
        : '錯誤：請先上傳圖片');
      return;
    }

    setIsProcessing(true);
    setModelOutput('');
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Add timeout and error handling
      const response = await Promise.race([
        fetch('http://localhost:5001/detect', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit'
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const components = data.detections.map((det, index) => ({
          id: index + 1,
          name: language === 'en' ? det.name : translateComponentName(det.name),
          quantity: det.quantity
        }));
        
        setDetectedComponents(components);
        setModelOutput(language === 'en' 
          ? `Detected: ${components.map(c => `${c.quantity} ${c.name}`).join(', ')}`
          : `檢測到: ${components.map(c => `${c.quantity} ${c.name}`).join(', ')}`);
      } else {
        throw new Error(data.error || 'Detection failed');
      }

    } catch (error) {
      console.error('Error during object detection:', error);
      let errorMessage;
      if (error.message === 'Failed to fetch') {
        errorMessage = language === 'en'
          ? 'Error: Cannot connect to server. Please make sure the server is running on port 5000.'
          : '錯誤：無法連接到伺服器。請確保伺服器在端口5000上運行。';
      } else if (error.message === 'Request timeout') {
        errorMessage = language === 'en'
          ? 'Error: Request timed out. Please try again.'
          : '錯誤：請求超時。請重試。';
      } else {
        errorMessage = language === 'en'
          ? `Error: ${error.message}`
          : `錯誤：${error.message}`;
      }
      setModelOutput(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original detected components if needed
  };

  const handleComponentChange = (id, field, value) => {
    setDetectedComponents(components =>
      components.map(component =>
        component.id === id ? { ...component, [field]: value } : component
      )
    );
  };

  const handleAddComponent = () => {
    const newComponent = {
      id: Date.now(),
      name: text.newComponentName,
      quantity: 1
    };
    setDetectedComponents([...detectedComponents, newComponent]);
  };

  const handleDelete = (id) => {
    setDetectedComponents(detectedComponents.filter(component => component.id !== id));
  };

  const handleConfirm = () => {
    if (!uploadedImage) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000); // Hide the message after 3 seconds
      return;
    }
    // Navigate to the ProjectDetailsPage with the current state
    navigate('/project-details', { 
      state: { 
        components: detectedComponents, 
        description: projectDescription 
      } 
    });
  };

  // Add a function to translate component names to Chinese if needed
  const translateComponentName = (name) => {
    const translations = {
      '9V battery snap': '9V 電池扣', 
      'Arduino UNO board rev.3': 'Arduino Uno 開發板 rev.3', 
      'Breadboard': '麵包板', 
      'Buttons': '按鈕', 
      'DC Motor': '直流馬達', 
      'LCD Alphanumeric (16x2 characters)': 'LCD 字符顯示器 (16x2)', 
      'LED light': 'LED 燈', 
      'Micro Servo Motor': '微型伺服馬達', 
      'Sound Components Piezo Capsule (PKM17EPP-4001-B0)': '蜂鳴器 (PKM17EPP-4001-B0)', 
      'Temperature Sensor (TMP36)': '溫度感測器 (TMP36)', 
      'Tilt Sensor': '傾斜感測器', 
      'H-Bridge Motor Driver (L293D)': 'H 橋馬達驅動器 (L293D)', 
      'Optocouplers (4N35)': '光耦合器 (4N35)'

      // Add translations for all your classes
    };
    return translations[name] || name;
  };

  return (
    <div style={{ textAlign: 'left', padding: '2rem' }}>
      <h1 style={{ color: '#3B7097', marginBottom: '2rem' }}>{text.title}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '2rem' }}>
        {text.functions.map((func, index) => (
          <div key={index} style={{ width: '30%', marginBottom: '2rem', backgroundColor: '#75BDE0', padding: '1rem', borderRadius: '8px' }}>
            <h2 style={{ color: '#FFFFFF', marginTop: '1rem' }}>{func.name}</h2>
            <p style={{ color: '#FFFFFF' }}>{func.description}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <button 
          onClick={handleUploadButtonClick}
          style={{ 
            backgroundColor: '#3B7097', 
            color: 'white', 
            padding: '10px 20px', 
            fontSize: '1.1rem', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          {text.uploadButton}
        </button>
        {uploadedImage && !isEditing && (
          <button
            onClick={handleEdit}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {text.editButton}
          </button>
        )}
      </div>
      {uploadedImage ? (
        <div style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={uploadedImage} 
            alt="Uploaded" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px',
              marginBottom: '1rem'
            }} 
          />
          <button
            onClick={handleObjectDetection}
            style={{
              backgroundColor: '#3B7097',
              color: 'white',
              padding: '10px 20px',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: 'fit-content',
              marginBottom: '1rem'
            }}
          >
            {text.detectButton}
          </button>
          {modelOutput && (
            <div style={{
              padding: '10px',
              backgroundColor: modelOutput.includes('Error') ? '#ffebee' : '#e8f5e9',
              borderRadius: '5px',
              color: modelOutput.includes('Error') ? '#c62828' : '#2e7d32',
              width: '80%',
              maxWidth: '600px',
              marginTop: '0.5rem'
            }}>
              {modelOutput}
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          marginBottom: '2rem', 
          textAlign: 'center', 
          border: '2px dashed #3B7097', 
          padding: '2rem', 
          borderRadius: '8px' 
        }}>
          <p>{text.uploadInstructions}</p>
        </div>
      )}
      {isProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '200px',
            height: '6px',
            backgroundColor: '#f0f0f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#75BDE0',
              animation: 'progress 1s infinite linear',
              transformOrigin: '0% 50%'
            }} />
          </div>
          <p style={{ color: 'white', marginTop: '1rem' }}>
            {language === 'en' ? 'Processing Image...' : '正在處理圖片...'}
          </p>
        </div>
      )}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#3B7097' }}>{text.resultsTitle}</h2>
          {isEditing && (
            <button
              onClick={handleAddComponent}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '5px 10px',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {text.addComponent}
            </button>
          )}
        </div>
        {isProcessing ? (
          <p>{language === 'en' ? 'Analyzing components...' : '正在分析元件...'}</p>
        ) : detectedComponents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#75BDE0', color: 'white' }}>
                <th style={{ padding: '10px' }}>{text.componentName}</th>
                <th style={{ padding: '10px' }}>{text.quantity}</th>
                {!isEditing && <th style={{ padding: '10px' }}>{text.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {detectedComponents.map((component) => (
                <tr key={component.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>
                    {isEditing ? (
                      <input
                        value={component.name}
                        onChange={(e) => handleComponentChange(component.id, 'name', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    ) : (
                      component.name
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={component.quantity}
                        onChange={(e) => handleComponentChange(component.id, 'quantity', parseInt(e.target.value))}
                        style={{ width: '50px', padding: '5px' }}
                      />
                    ) : (
                      component.quantity
                    )}
                  </td>
                  {!isEditing && (
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleEdit(component.id)} style={{ marginRight: '10px', backgroundColor: '#3B7097', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                        {text.edit}
                      </button>
                      <button onClick={() => handleDelete(component.id)} style={{ backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                        {text.delete}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{text.noComponents}</p>
        )}
        {isEditing && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {text.cancelButton}
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {text.saveButton}
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <label htmlFor="project-description" style={{ display: 'block', marginBottom: '0.5rem', color: '#3B7097' }}>
          {text.projectDescriptionLabel}
        </label>
        <textarea
          id="project-description"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder={text.projectDescriptionPlaceholder}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', alignItems: 'center' }}>
        {showErrorMessage && (
          <p style={{ color: 'red', marginRight: '1rem' }}>
            {language === 'en' ? "Please upload an image first." : "請先上傳圖片。"}
          </p>
        )}
        <button
          onClick={handleConfirm}
          style={{
            backgroundColor: uploadedImage ? '#4CAF50' : '#ccc',
            color: 'white',
            padding: '10px 20px',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: uploadedImage ? 'pointer' : 'not-allowed'
          }}
        >
          {text.confirmButton}
        </button>
      </div>

      <style>
        {`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Functionpage;
