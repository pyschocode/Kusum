import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

type NavbarProps = {
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
};

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage }) => {
  const navigate = useNavigate();
  const isHindi = language === 'hi';

  const homeLabel = isHindi ? 'होम' : 'Home';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'hi' ? 'hi' : 'en';
    setLanguage(value);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="nav-home" onClick={() => navigate('/')}>
          {homeLabel}
        </button>
      </div>

      <div className="navbar-right">
        <select
          className="lang-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
    </header>
  );
};

export default Navbar;
