import { useState, useEffect } from 'react';
import api from '../services/api';

export const useScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scores');
      setScores(res.data.scores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return { scores, loading, refresh: fetchScores };
};
