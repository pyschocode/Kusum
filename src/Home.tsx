import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { logEvent } from './logEvent';

type HomeProps = {
  language: 'hi' | 'en';
};

const Home: React.FC<HomeProps> = ({ language }) => {
  const navigate = useNavigate();
  const isHindi = language === 'hi';

  const mainTitle = isHindi ? 'कुसुम' : 'KUSUM';
  const subTitle = isHindi ? 'सरल समाधान' : 'Simplified support';
  const chatButtonText = isHindi ? 'हमारे एआई साथी से पूछें' : 'Ask our AI guide';
  const infoButtonText = isHindi ? 'कुसुम की सरल जानकारी देखें' : 'See KUSUM simple guide';
  const feedbackButtonText = isHindi ? 'अपना अनुभव साझा करें' : 'Share your experience';

  // Page-view event
  useEffect(() => {
    logEvent('page_view', { page: 'home', language });
  }, [language]);

  const handleChatClick = () => {
    logEvent('click_chat_cta', { page: 'home', language });
    navigate('/chat');
  };

  const handleInfoClick = () => {
    logEvent('click_kusum_info', { page: 'home', language });
    navigate('/kusum-info');
  };

  const handleFeedbackClick = () => {
    logEvent('click_feedback', { page: 'home', language });
    navigate('/feedback');
  };

  return (
    <div className="home-container">
      <div className="title-block">
        <h1 className="main-title">{mainTitle}</h1>
        <p className="sub-title">{subTitle}</p>

        <div className="button-stack">
          <button className="hero-button" onClick={handleChatClick}>
            {chatButtonText}
          </button>

          <div className="secondary-buttons">
            <button className="hero-button outline" onClick={handleInfoClick}>
              {infoButtonText}
            </button>
            <button className="hero-button outline" onClick={handleFeedbackClick}>
              {feedbackButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
