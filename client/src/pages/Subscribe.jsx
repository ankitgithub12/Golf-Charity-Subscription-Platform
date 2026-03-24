import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Zap, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Subscribe = () => {
  const [loading, setLoading] = useState(null); // 'monthly' | 'yearly'

  const plans = [
    {
      id: 'monthly',
      name: 'Eagle Monthly',
      price: import.meta.env.VITE_MONTHLY_PRICE || '499',
      period: 'month',
      desc: 'Flexible monthly entry to all prize pools.',
      features: [
        '5-Score Rolling Tracker',
        'Automatic Draw Entry',
        '10% Charity Contribution',
        'Standard Prize Eligibility'
      ]
    },
    {
      id: 'yearly',
      name: 'Founder Annual',
      price: import.meta.env.VITE_YEARLY_PRICE || '4999',
      period: 'year',
      desc: 'Save 25% and maximize your impact.',
      features: [
        'Everything in Monthly',
        'Exclusive Founder Badge',
        'Early Draw Publish Alerts',
        'Enhanced Donation Reports',
        'Priority Verification'
      ],
      highlight: true
    }
  ];

  const handleSubscribe = async (planType) => {
    try {
      setLoading(planType);
      const res = await api.post('/subscriptions/create-checkout', { planType });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      setLoading(null);
    }
  };

  return (
    <div className="subscribe-page container section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="badge">Subscriptions</span>
        <h2>Choose Your Plan</h2>
        <p>Support a cause, enter the draws, and track your game. No hidden fees, just pure impact.</p>
      </motion.div>

      <div className="plans-grid">
        {plans.map((plan, i) => (
          <motion.div 
            key={plan.id}
            className={`plan-card glass-card ${plan.highlight ? 'plan-highlight' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            {plan.highlight && <div className="popular-badge"><Star size={12} /> Best Value</div>}
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
              <div className="price">
                <span className="currency">₹</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>
            </div>

            <div className="features-list">
              {plan.features.map((feature, j) => (
                <div key={j} className="feature-item">
                  <Check size={18} className="icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`btn btn-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
              disabled={loading !== null}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loading === plan.id ? <Loader className="animate-spin" size={20} /> : `Select ${plan.name}`}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="payment-trust glass-card animate-fade-in">
        <div className="trust-item">
          <Shield size={24} className="icon" />
          <div>
            <h4>Secure Payments</h4>
            <p>Processed by Stripe with 256-bit encryption.</p>
          </div>
        </div>
        <div className="trust-item">
          <Zap size={24} className="icon" />
          <div>
            <h4>Instant Access</h4>
            <p>Unlock all platform features immediately after checkout.</p>
          </div>
        </div>
      </div>

      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto 5rem;
        }
        .plan-card {
          display: flex;
          flex-direction: column;
          padding: 3rem !important;
          position: relative;
        }
        .plan-highlight {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
          transform: scale(1.05);
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          padding: 0.25rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .plan-header { text-align: center; margin-bottom: 2.5rem; }
        .plan-header h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .plan-header p { color: var(--text-muted); font-size: 0.875rem; }
        .price { margin-top: 2rem; }
        .currency { font-size: 1.5rem; font-weight: 600; vertical-align: top; margin-right: 0.25rem; }
        .amount { font-size: 4rem; font-weight: 800; letter-spacing: -0.05em; }
        .period { color: var(--text-dim); font-size: 1rem; }
        
        .features-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 3rem; flex: 1; }
        .feature-item { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.9375rem; }
        .feature-item .icon { color: var(--primary); flex-shrink: 0; }
        
        .payment-trust {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 2.5rem !important;
        }
        .trust-item { display: flex; gap: 1.5rem; align-items: flex-start; }
        .trust-item .icon { color: var(--text-dim); margin-top: 0.25rem; }
        .trust-item h4 { margin-bottom: 0.25rem; font-size: 1.125rem; }
        .trust-item p { color: var(--text-dim); font-size: 0.875rem; }
        
        @media (max-width: 768px) {
          .plans-grid { grid-template-columns: 1fr; gap: 2rem; }
          .plan-highlight { transform: none; }
          .payment-trust { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Subscribe;
