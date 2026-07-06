import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import Chatbot from './Chatbot';
import KusumInfo from './KusumInfo';
import Feedback from './Feedback';


const App: React.FC = () => {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  return (
    <Router>
      <Navbar language={language} setLanguage={setLanguage} />
      <Routes>
        <Route path="/" element={<Home language={language} />} />
        <Route path="/chat" element={<Chatbot language={language} />} />
        <Route path="/kusum-info" element={<KusumInfo language={language} />} />
        <Route path="/feedback" element={<Feedback language={language} />} />
      </Routes>
    </Router>
  );
};

export default App;
