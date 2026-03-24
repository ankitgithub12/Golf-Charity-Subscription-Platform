import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCharity = (charityId) => {
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!charityId) return;
    const fetchCharity = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/charities/${charityId}`);
        setCharity(res.data.charity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [charityId]);

  return { charity, loading };
};
