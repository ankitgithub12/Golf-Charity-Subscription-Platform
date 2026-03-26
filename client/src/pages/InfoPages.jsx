import React from 'react';
import { HelpCircle, Shield, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const InfoPages = ({ type }) => {
  const content = {
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about the platform and our impact.",
      items: [
        {
          q: "How does the monthly draw work?",
          a: "Every month, we generate a set of winning numbers. If your latest 5 logged scores match 3 or more of these numbers, you win a portion of the prize pool. Tiers are defined by the number of matches."
        },
        {
          q: "What percentage goes to charity?",
          a: "A minimum of 10% of every subscription fee goes directly to your selected charity. You can voluntarily increase this up to 50% in your dashboard settings."
        },
        {
          q: "Is the draw fair?",
          a: "Yes. Every draw is cryptographically anchored using a simulated blockchain hash to ensure the results cannot be tampered with after publication."
        },
        {
          q: "How do I claim my winnings?",
          a: "If you win, you'll receive an email notification. Log in to your dashboard, go to the Winnings section, and provide your bank details/UPI along with a screenshot of your score evidence."
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      subtitle: "The legal framework for our community of golfers.",
      sections: [
        {
          h: "1. Eligibility",
          p: "Users must be 18+ to participate in prize draws. Professional golfers are eligible provided they comply with local amateur status regulations."
        },
        {
          h: "2. Subscription Fees",
          p: "Subscription fees are billed monthly or annually. 10% is non-refundable as it is immediately designated for charitable contribution."
        },
        {
          h: "3. Fair Play",
          p: "Any evidence of score manipulation or fraudulent entry will lead to immediate account termination and forfeiture of any pending winnings."
        }
      ]
    }
  };

  const data = type === 'faq' ? content.faq : content.terms;

  return (
    <div className="info-page container section animate-fade-in">
      <Link to="/" className="back-home">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <header className="info-header">
        <h1>{data.title}</h1>
        <p>{data.subtitle}</p>
      </header>

      <div className="info-content glass-card">
        {type === 'faq' ? (
          <div className="faq-list">
            {data.items.map((item, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">
                  <HelpCircle size={18} className="text-primary" />
                  <h3>{item.q}</h3>
                </div>
                <p className="faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="terms-list">
            {data.sections.map((sec, i) => (
              <div key={i} className="terms-sec">
                <h3>{sec.h}</h3>
                <p>{sec.p}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .info-page { max-width: 800px; padding-top: 4rem; }
        .back-home { display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); font-size: 0.875rem; text-decoration: none; margin-bottom: 2rem; transition: 0.2s; }
        .back-home:hover { color: var(--primary); }
        
        .info-header { margin-bottom: 3rem; }
        .info-header h1 { font-size: 3rem; margin-bottom: 1rem; }
        .info-header p { font-size: 1.125rem; color: var(--text-muted); }
        
        .info-content { padding: 3rem !important; }
        
        .faq-item { margin-bottom: 2.5rem; }
        .faq-item:last-child { margin-bottom: 0; }
        .faq-q { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
        .faq-q h3 { margin: 0; font-size: 1.25rem; }
        .faq-a { color: var(--text-muted); line-height: 1.7; padding-left: 2.25rem; }
        
        .terms-sec { margin-bottom: 2rem; }
        .terms-sec h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--text-main); }
        .terms-sec p { color: var(--text-muted); line-height: 1.7; }
      `}</style>
    </div>
  );
};

export default InfoPages;
