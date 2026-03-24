import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Heart, Target, ChevronRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const features = [
    {
      icon: <Target className="feature-icon" />,
      title: "Track Performance",
      desc: "Log your rounds in Stableford format. We keep your latest 5 scores synced with the platform."
    },
    {
      icon: <Trophy className="feature-icon" />,
      title: "Monthly Prize Draws",
      desc: "Your scores automatically enter you into our monthly tier-based prize pools. Match numbers to win big."
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "Charitable Impact",
      desc: "Every subscription fuels a charity of your choice. Minimum 10% of fees go directly to those in need."
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge">Revolutionizing the Fairway</span>
            <h1>More Than a Game.<br/><span>A Legacy of Giving.</span></h1>
            <p className="hero-description">
              Join the world's most rewarding golf platform. Improve your game, enter exclusive monthly draws, and support your favorite charities with every swing.
            </p>
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary btn-large">
                Start My Journey <ArrowRight size={20} />
              </Link>
              <Link to="/charities" className="btn btn-secondary">
                Explore Charities
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <h3>₹45k+</h3>
                <p>Donated</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <h3>1.2k</h3>
                <p>Active Players</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="hero-image-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="hero-image-overlay"></div>
            <img 
              src="/golf_charity_hero_1774342731328.png" 
              alt="Premium Golf Charity" 
              className="hero-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=2000";
              }}
            />
          </motion.div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section className="philosophy container">
        <motion.div 
          className="section-header"
          {...fadeInUp}
        >
          <h2>The Gold Standard of Impact</h2>
          <p>We've stripped away the clichés to build a platform that feels as premium as your favorite club, while making a real-world difference.</p>
        </motion.div>

        <div className="feature-grid">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="icon-wrapper">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-banner">
        <div className="container banner-inner">
          <div className="banner-text">
            <h2>Your passion. <br/>Their survival.</h2>
            <p>10% of every monthly subscription is automatically distributed to your chosen charity. Scale your impact with our annual plan and contribute even more.</p>
            <Link to="/charities" className="text-link">
              View Charity Partners <ChevronRight size={18} />
            </Link>
          </div>
          <div className="banner-cards">
            <div className="impact-card glass-card">
              <div className="impact-val">10%</div>
              <div className="impact-label">Base Contribution</div>
            </div>
            <div className="impact-card glass-card highlight">
              <div className="impact-val">£5000</div>
              <div className="impact-label">Highest Monthly Jackpot</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta section">
        <div className="container">
          <motion.div 
            className="cta-box glass-card"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-content">
              <h2>Ready to change the game?</h2>
              <p>Join thousands of golfers making an impact. Subscriptions start from just ₹499/mo.</p>
              <div className="cta-benefits">
                <span><CheckCircle size={16} /> Monthly Prize Pools</span>
                <span><CheckCircle size={16} /> Performance Tracking</span>
                <span><CheckCircle size={16} /> Professional Verification</span>
              </div>
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .landing-page {
          overflow: hidden;
        }
        .hero {
          padding: 6rem 0 4rem;
          min-height: 85vh;
          display: flex;
          align-items: center;
        }
        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          letter-spacing: 0.05em;
        }
        .hero-text h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .hero-text h1 span {
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-description {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          max-width: 500px;
        }
        .hero-ctas {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 3.5rem;
        }
        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .stat h3 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .stat p {
          color: var(--text-dim);
          font-size: 0.875rem;
        }
        .stat-divider {
          width: 1px;
          height: 30px;
          background: var(--glass-border);
        }
        .hero-image-container {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .hero-image {
          width: 100%;
          display: block;
          transition: transform 10s ease;
        }
        .hero-image:hover {
          transform: scale(1.1);
        }
        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, rgba(15, 23, 42, 0.4), transparent);
          z-index: 1;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .section-header h2 {
          font-size: 2.5rem;
        }
        .section-header p {
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .feature-card {
          text-align: center;
        }
        .icon-wrapper {
          width: 60px;
          height: 60px;
          background: var(--glass);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--primary);
        }
        .feature-icon {
          width: 30px;
          height: 30px;
        }
        
        .impact-banner {
          background: var(--bg-dark);
          margin: 6rem 0;
          padding: 6rem 0;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
        }
        .banner-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .banner-text h2 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }
        .banner-text p {
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }
        .text-link {
          display: flex;
          align-items: center;
          color: var(--primary);
          font-weight: 600;
        }
        .banner-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .impact-card {
          padding: 2.5rem !important;
          text-align: center;
        }
        .impact-card.highlight {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }
        .impact-val {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .impact-label {
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        
        .cta-box {
          padding: 5rem !important;
          text-align: center;
          background: linear-gradient(135deg, var(--card-bg), rgba(16, 185, 129, 0.1));
        }
        .cta-box h2 {
          font-size: 2.5rem;
        }
        .cta-box p {
          color: var(--text-muted);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }
        .cta-benefits {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          color: var(--text-muted);
          font-size: 0.9375rem;
        }
        .cta-benefits span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (max-width: 1024px) {
          .hero-text h1 { font-size: 3rem; }
          .hero-content { grid-template-columns: 1fr; text-align: center; }
          .hero-description { margin: 0 auto 2.5rem; }
          .hero-ctas { justify-content: center; }
          .hero-stats { justify-content: center; }
          .banner-inner { grid-template-columns: 1fr; text-align: center; }
          .feature-grid { grid-template-columns: 1fr; }
          .banner-cards { grid-template-columns: 1fr; }
          .cta-benefits { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
