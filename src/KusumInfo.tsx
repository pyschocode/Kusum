import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './KusumInfo.css';
import { logEvent } from './logEvent';

type KusumInfoProps = {
  language?: 'hi' | 'en';
};

const KusumInfo: React.FC<KusumInfoProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // accept lang from props OR navigation state
  const stateLang = (location.state as any)?.language as 'hi' | 'en' | undefined;
  const lang = language ?? stateLang ?? 'en';
  const isHindi = lang === 'hi';

  const heading = isHindi ? 'कुसुम योजना – सरल जानकारी' : 'PM-KUSUM Scheme – Simple Guide';
  const backToChat = isHindi ? 'चैटबॉट पर वापस जाएँ' : 'Back to Chatbot';

  // page view analytics
  useEffect(() => {
    logEvent('page_view', { page: 'kusum_info', language: lang });
  }, [lang]);

  const handleBackToChat = () => {
    logEvent('click_back_to_chat', { from: 'kusum_info', language: lang });
    navigate('/chat', { state: { language: lang } });
  };

  return (
    <div className="kusum-page">
      <div className="kusum-wrapper">
        {/* Top bar */}
        <div className="top-bar">
          <h1 className="heading">{heading}</h1>

          <button className="back-button" onClick={handleBackToChat}>
            {backToChat}
          </button>
        </div>

        {/* 1. What is PM-KUSUM */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '1. कुसुम योजना क्या है?' : '1. What is PM-KUSUM?'}
          </h2>

          {isHindi ? (
            <p className="section-text">
              यह योजना किसानों को सौर ऊर्जा से सस्ती और भरोसेमंद बिजली देने के लिए बनाई गई है।
              खेत की सिंचाई के लिए डीज़ल पर निर्भरता कम होती है और किसान अतिरिक्त बिजली बेचकर
              अतिरिक्त आय भी कमा सकते हैं।
            </p>
          ) : (
            <p className="section-text">
              PM-KUSUM is a scheme to provide farmers with reliable, affordable solar power.
              It reduces diesel dependency and allows farmers to earn income by selling surplus solar power.
            </p>
          )}
        </section>

        {/* 2. Main components */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '2. कुसुम के मुख्य घटक (Components)' : '2. Main components of PM-KUSUM'}
          </h2>

          {isHindi ? (
            <ul className="list">
              <li>
                <strong>घटक A:</strong> किसानों / पंचायत / FPO की जमीन पर
                छोटे ग्रिड‑कनेक्टेड सोलर प्लांट (आमतौर पर 500 kW–2 MW तक) लगाए जाते हैं,
                जो नज़दीकी सब‑स्टेशन को दिन में बिजली देते हैं।
              </li>
              <li>
                <strong>घटक B:</strong> डीज़ल या कमजोर ग्रिड पर निर्भरता कम करने के लिए
                स्टैंड‑अलोन सोलर पंप लगाए जाते हैं, जो सीधे सौर ऊर्जा से चलते हैं।
              </li>
              <li>
                <strong>घटक C:</strong> पहले से जुड़े कृषि पंपों को सौर बनाया जाता है
                (इंडिविजुअल पंप या फीडर‑लेवल सौरिकीकरण मॉडल के माध्यम से) ताकि दिन में
                भरोसेमंद बिजली मिल सके और अतिरिक्त बिजली ग्रिड को दी जा सके।
              </li>
            </ul>
          ) : (
            <ul className="list">
              <li>
                <strong>Component A:</strong> Small grid‑connected solar plants
                (typically around 500 kW–2 MW) are installed on farmer / panchayat / FPO land
                near rural substations to supply power to the grid.
              </li>
              <li>
                <strong>Component B:</strong> Stand‑alone solar pumps replace diesel
                or unreliable supply and run directly from solar power for irrigation.
              </li>
              <li>
                <strong>Component C:</strong> Existing grid‑connected pumps are
                solarised (either pump‑wise or through feeder‑level solarisation)
                so farmers get reliable day‑time power and can feed surplus to the grid.
              </li>
            </ul>
          )}
        </section>

        {/* 3. Benefits */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '3. किसानों को क्या लाभ हैं?' : '3. What are the benefits?'}
          </h2>

          <ul className="list">
            {isHindi ? (
              <>
                <li>सिंचाई के लिए सस्ती और भरोसेमंद बिजली</li>
                <li>डीज़ल का खर्च कम, रखरखाव कम</li>
                <li>अतिरिक्त सौर बिजली बेचकर अतिरिक्त आमदनी</li>
                <li>सूखे और बिजली कटौती के समय भी बेहतर ऊर्जा सुरक्षा</li>
              </>
            ) : (
              <>
                <li>Cheaper & reliable irrigation power</li>
                <li>Reduced diesel cost & maintenance</li>
                <li>Earn income by selling extra solar power</li>
                <li>Better energy security during droughts & outages</li>
              </>
            )}
          </ul>
        </section>

        {/* 4. Eligibility */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '4. कौन पात्र है?' : '4. Who is eligible?'}
          </h2>

          <ul className="list">
            {isHindi ? (
              <>
                <li>व्यक्तिगत किसान (छोटे / सीमांत / बड़े)</li>
                <li>किसान समूह व सहकारी समितियाँ</li>
                <li>पंचायतें व किसान उत्पादक संगठन (FPO)</li>
                <li>कुछ राज्यों में जल उपयोगकर्ता संघ / अन्य समूह भी शामिल हो सकते हैं</li>
                <li>अंतिम नियम राज्य स्तर की गाइडलाइन पर आधारित</li>
              </>
            ) : (
              <>
                <li>Individual farmers (small, marginal and large)</li>
                <li>Farmer groups & cooperative societies</li>
                <li>Panchayats & Farmer Producer Organisations (FPOs)</li>
                <li>In some states, water user associations / community groups</li>
                <li>Final conditions depend on state guidelines</li>
              </>
            )}
          </ul>
        </section>

        {/* 5. Subsidy & costs overview */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '5. सब्सिडी और लागत (संक्षेप में)' : '5. Subsidy & costs (overview)'}
          </h2>

          {isHindi ? (
            <ul className="list">
              <li>
                कई मॉडलों में किसान के हिस्से की लागत पर <strong>उच्च सब्सिडी</strong> दी जाती है;
                कुल सिस्टम लागत का बड़ा हिस्सा केंद्र व राज्य सरकार और बैंक लोन से कवर हो सकता है।
              </li>
              <li>
                किसान को आम तौर पर कुल लागत का केवल एक हिस्सा स्वयं देना होता है;
                सही प्रतिशत राज्य और घटक (A / B / C) पर निर्भर करता है।
              </li>
              <li>
                आवेदन से पहले अपने राज्य की नवीनतम सब्सिडी सूचना और DISCOM / नोडल एजेंसी की
                गाइडलाइन जरूर देखें।
              </li>
            </ul>
          ) : (
            <ul className="list">
              <li>
                In many implementations, a large share of system cost is supported through
                central & state subsidy and bank finance, so the farmer pays only a portion.
              </li>
              <li>
                Exact subsidy percentage and farmer contribution vary by state and by component
                (A / B / C), and can change with new notifications.
              </li>
              <li>
                Farmers should always check the latest state‑specific guidelines and DISCOM /
                nodal agency announcements before applying.
              </li>
            </ul>
          )}
        </section>

        {/* 6. Distance from substation */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '6. सबस्टेशन से दूरी (लगभग)' : '6. Distance from substation (approx.)'}
          </h2>

          {isHindi ? (
            <ul className="list">
              <li>
                कई राज्यों में घटक A के तहत सोलर प्लांट को आम तौर पर
                <strong> नज़दीकी सबस्टेशन से लगभग 5 किमी के दायरे</strong> में लगाने की सलाह दी जाती है।
              </li>
              <li>
                दूरी ज़्यादा होने पर लाइन बिछाने और ग्रिड कनेक्शन की लागत बढ़ सकती है,
                इसलिए सही दूरी और व्यावहारिकता के लिए स्थानीय DISCOM / नोडल एजेंसी से पुष्टि ज़रूरी है।
              </li>
            </ul>
          ) : (
            <ul className="list">
              <li>
                Under Component A, many state guidelines suggest installing the plant
                within roughly <strong>5 km radius of the nearest substation</strong>.
              </li>
              <li>
                Longer distance can increase line and connection cost, so farmers should
                confirm exact limits and feasibility with the local DISCOM / nodal agency.
              </li>
            </ul>
          )}
        </section>

        {/* 7. Land needed */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '7. जमीन कितनी चाहिए?' : '7. How much land is needed?'}
          </h2>

          {isHindi ? (
            <ul className="list">
              <li>
                1 मेगावाट सोलर प्लांट के लिए आम तौर पर लगभग
                <strong> 4–5 एकड़ जमीन</strong> मानी जाती है; सटीक जरूरत डिज़ाइन और साइट पर निर्भर करती है।
              </li>
              <li>
                छोटे सोलर पंप (1–10 HP) के लिए जमीन की जरूरत बहुत कम होती है
                और कई बार इसे खेत के किनारे या नज़दीकी खाली हिस्से में लगाया जा सकता है।
              </li>
            </ul>
          ) : (
            <ul className="list">
              <li>
                For a 1 MW solar plant, about <strong>4–5 acres of land</strong> are typically needed;
                the exact area depends on design and local conditions.
              </li>
              <li>
                For individual solar pumps (around 1–10 HP), land requirement is much smaller
                and the system can usually be installed on or near the farm itself.
              </li>
            </ul>
          )}
        </section>

        {/* 8. Small farmers & community models */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '8. छोटे किसान कैसे लाभ लें?' : '8. How can small farmers benefit?'}
          </h2>

          {isHindi ? (
            <ul className="list">
              <li>
                छोटे किसान व्यक्तिगत रूप से <strong>1HP–10HP सोलर पंप</strong> के लिए आवेदन कर सकते हैं,
                जहाँ जमीन की आवश्यकता कम होती है और सब्सिडी उपलब्ध हो सकती है।
              </li>
              <li>
                कई मॉडल में किसान <strong>समूह, FPO, सहकारी समिति या पंचायत समूह</strong> बनाकर
                मिलकर सोलर प्लांट लगाते हैं और लागत व लाभ आपस में बाँटते हैं।
              </li>
              <li>
                समूह मॉडल के लिए आम तौर पर संयुक्त आवेदन, समझौता कागज़ और बैंक / एजेंसी के साथ
                कॉमन एग्रीमेंट की जरूरत होती है; विवरण राज्य की गाइडलाइन में दिया रहता है।
              </li>
            </ul>
          ) : (
            <ul className="list">
              <li>
                Small farmers can apply individually for <strong>1–10 HP solar pumps</strong>,
                which need limited space and may receive subsidy support.
              </li>
              <li>
                They can also form a <strong>group, FPO, cooperative or panchayat‑led community</strong>
                project to set up a larger plant and share costs and benefits.
              </li>
              <li>
                Group models usually require a joint application, agreements between members
                and a common contract with the DISCOM / implementing agency, as per state guidelines.
              </li>
            </ul>
          )}
        </section>

        {/* 9. Required documents */}
        <section className="info-section">
          <h2 className="section-title">
            {isHindi ? '9. ज़रूरी दस्तावेज़' : '9. Required documents'}
          </h2>

          <ul className="list">
            {isHindi ? (
              <>
                <li>आधार कार्ड / वोटर कार्ड</li>
                <li>भूमि कागज़ / नामांकन दस्तावेज़</li>
                <li>बैंक पासबुक</li>
                <li>राज्य‑विशेष अतिरिक्त डॉक्यूमेंट (यदि लागू)</li>
              </>
            ) : (
              <>
                <li>ID (Aadhaar / Voter ID)</li>
                <li>Land ownership / registration documents</li>
                <li>Bank details</li>
                <li>State‑specific additional documents</li>
              </>
            )}
          </ul>
        </section>

        {/* 10. Footer note */}
        <section className="info-note">
          {isHindi ? (
            <p>
              नोट: कुसुम योजना की सब्सिडी व नियम राज्य के अनुसार बदलते हैं। हमेशा अपडेटेड आधिकारिक नोटिफिकेशन देखें।
            </p>
          ) : (
            <p>
              Note: PM-KUSUM rules and subsidies vary by state. Always check the latest official notifications.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default KusumInfo;
