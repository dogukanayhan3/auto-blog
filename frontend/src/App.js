import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import { Linkedin, Github } from "lucide-react"; // <-- icons added
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 Auto Blog - AI-Generated Content Page made by Dogukan Ayhan</p>
            
            <div className="social-links" style={{ marginTop: "8px", display: "flex", gap: "14px", justifyContent: "center" }}>
              <a 
                href="https://linkedin.com/in/dogukanayhan" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                <Linkedin size={24} />
              </a>

              <a 
                href="https://github.com/dogukanayhan3" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                <Github size={24} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;