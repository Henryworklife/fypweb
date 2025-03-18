import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './Homepage';
import Aboutpage from './Aboutpage';
import Contactpage from './Contactpage';
import Functionpage from './Functionpage';  // Update this line
import ProjectDetailsPage from './ProjectDetailsPage';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';  // Add this line

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="content-box">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/about" element={<Aboutpage />} />
              <Route path="/contact" element={<Contactpage />} />
              <Route path="/function" element={<Functionpage />} />
              <Route path="/project-details" element={<ProjectDetailsPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
