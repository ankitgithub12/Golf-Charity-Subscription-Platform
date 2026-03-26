import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, label = "Next Draw In" }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div className="time-block" key={interval}>
        <span className="time-val">{String(timeLeft[interval]).padStart(2, '0')}</span>
        <span className="time-label">{interval.charAt(0).toUpperCase()}</span>
      </div>
    );
  });

  return (
    <div className="countdown-timer">
      <div className="timer-header">
        <Clock size={14} className="animate-pulse" />
        <span>{label}</span>
      </div>
      <div className="timer-display">
        {timerComponents.length ? timerComponents : <span>Draw is starting now!</span>}
      </div>

      <style>{`
        .countdown-timer { 
          padding: 1.5rem; 
          background: rgba(16, 185, 129, 0.05); 
          border-radius: var(--radius-lg); 
          border: 1px solid rgba(16, 185, 129, 0.2);
          text-align: center;
        }
        .timer-header { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 0.5rem; 
          font-size: 0.75rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          color: var(--primary);
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        .timer-display { 
          display: flex; 
          justify-content: center; 
          gap: 1.25rem; 
        }
        .time-block { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
        }
        .time-val { 
          font-size: 1.75rem; 
          font-weight: 900; 
          font-family: monospace; 
          line-height: 1;
          color: var(--text-main);
        }
        .time-label { 
          font-size: 0.6rem; 
          text-transform: uppercase; 
          font-weight: 800; 
          margin-top: 0.25rem;
          color: var(--text-dim);
        }
      `}</style>
    </div>
  );
};

export default CountdownTimer;
