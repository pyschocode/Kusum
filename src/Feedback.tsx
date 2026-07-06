import React, { useState, useEffect } from 'react';
import './Feedback.css';
import { logEvent } from './logEvent';

type FeedbackProps = {
  language: 'hi' | 'en';
};

type FeedbackItem = {
  id: number;
  name: string;
  village: string;
  message: string;
  mood: 'happy' | 'neutral' | 'sad';
};

const Feedback: React.FC<FeedbackProps> = ({ language }) => {
  const isHindi = language === 'hi';
  const MAX_LEN = 300;

  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('happy');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState('');

  // page view analytics
  useEffect(() => {
    logEvent('page_view', { page: 'feedback', language });
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError(
        isHindi ? 'कृपया अपना अनुभव लिखें।' : 'Please write your experience.'
      );
      return;
    }

    if (trimmed.length > MAX_LEN) {
      setError(
        isHindi
          ? `संदेश अधिकतम ${MAX_LEN} अक्षरों तक होना चाहिए।`
          : `Message should be at most ${MAX_LEN} characters.`
      );
      return;
    }

    const entry: FeedbackItem = {
      id: Date.now(),
      name: name.trim(),
      village: village.trim(),
      message: trimmed,
      mood,
    };

    // analytics for feedback submission
    logEvent('feedback_submit', {
      language,
      mood,
      hasName: !!entry.name,
      hasVillage: !!entry.village,
      textLength: trimmed.length,
    });

    setItems((prev) => [entry, ...prev]);
    setName('');
    setVillage('');
    setMessage('');
    setMood('happy');
    setError('');
  };

  const title = isHindi ? 'किसान फीडबैक' : 'Farmer Feedback';
  const intro = isHindi
    ? 'कृपया अपने अनुभव या सुझाव सरल भाषा में लिखें।'
    : 'Please share your experience or suggestions in simple words.';

  const nameLabel = isHindi ? 'नाम (वैकल्पिक)' : 'Name (optional)';
  const villageLabel = isHindi ? 'गाँव / तहसील' : 'Village / Block';
  const messageLabel = isHindi ? 'आपका अनुभव / सुझाव' : 'Your experience / feedback';
  const moodLabel = isHindi ? 'संतुष्टि स्तर' : 'Satisfaction level';
  const submitText = isHindi ? 'फीडबैक भेजें' : 'Submit feedback';

  return (
    <div className="feedback-page">
      <div className="feedback-wrapper">
        <h1 className="feedback-title">{title}</h1>
        <p className="feedback-intro">{intro}</p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              {nameLabel}
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              {villageLabel}
              <input
                className="form-input"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              {messageLabel}
              <textarea
                className="form-textarea"
                rows={3}
                value={message}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_LEN) {
                    setMessage(value);
                    if (error) setError('');
                  }
                }}
              />
            </label>
          </div>

          <div className="form-row info-row">
            <span className="char-count">
              {message.length}/{MAX_LEN}
            </span>
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="form-row">
            <span className="form-label">{moodLabel}</span>
            <div className="mood-group">
              <label>
                <input
                  type="radio"
                  value="happy"
                  checked={mood === 'happy'}
                  onChange={() => setMood('happy')}
                />
                {isHindi ? 'खुश' : 'Happy'}
              </label>
              <label>
                <input
                  type="radio"
                  value="neutral"
                  checked={mood === 'neutral'}
                  onChange={() => setMood('neutral')}
                />
                {isHindi ? 'ठीक-ठाक' : 'Average'}
              </label>
              <label>
                <input
                  type="radio"
                  value="sad"
                  checked={mood === 'sad'}
                  onChange={() => setMood('sad')}
                />
                {isHindi ? 'नाखुश' : 'Not happy'}
              </label>
            </div>
          </div>

          <button type="submit" className="feedback-submit">
            {submitText}
          </button>
        </form>

        {items.length > 0 && (
          <div className="feedback-list">
            <h2 className="feedback-list-title">
              {isHindi ? 'हाल की प्रतिक्रियाएँ' : 'Recent feedback'}
            </h2>
            {items.map((item) => (
              <div key={item.id} className={`feedback-card mood-${item.mood}`}>
                <div className="feedback-card-header">
                  <span className="feedback-name">
                    {item.name || (isHindi ? 'अनाम किसान' : 'Anonymous farmer')}
                  </span>
                  {item.village && (
                    <span className="feedback-village">
                      {isHindi ? 'गाँव:' : 'Village:'} {item.village}
                    </span>
                  )}
                </div>
                <p className="feedback-message">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
