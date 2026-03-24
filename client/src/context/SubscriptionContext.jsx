import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, refreshUser } = useContext(AuthContext);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/status');
      setSubscription(res.data.subscription);
      
      // If we found a subscription but user object is still lagging, refresh user
      if (res.data.subscription?.status === 'active' && user?.subscriptionStatus !== 'active') {
        refreshUser();
      }
    } catch (err) {
      console.error("Sub fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (urlParams.get('subscribed') === 'true' && sessionId) {
        try {
          // Robust fallback: manually verify session instead of relying purely on webhooks
          await api.post('/subscriptions/verify-session', { sessionId });
          window.history.replaceState({}, document.title, window.location.pathname);
          refreshUser();
        } catch (err) {
          console.error("Session verification failed", err);
        }
      }
      fetchStatus();
    };

    init();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refresh: fetchStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
