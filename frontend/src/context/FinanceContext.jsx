import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import { currentMonth, currentYear } from '../utils/formatters';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [future, setFuture] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async (m = month, y = year) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/summary?month=${m}&year=${y}`);
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const fetchTransactions = useCallback(async (filters = {}) => {
    const params = new URLSearchParams({ month, year, ...filters });
    const { data } = await api.get(`/transactions?${params}`);
    setTransactions(data);
  }, [month, year]);

  const fetchFixed = useCallback(async () => {
    const { data } = await api.get('/fixed?active=true');
    setFixed(data);
  }, []);

  const fetchFuture = useCallback(async () => {
    const { data } = await api.get('/future?realized=false');
    setFuture(data);
  }, []);

  const fetchDebts = useCallback(async () => {
    const { data } = await api.get('/debts?active=true');
    setDebts(data);
  }, []);

  const addTransaction = async (payload) => {
    const { data } = await api.post('/transactions', payload);
    await fetchSummary();
    return data;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    await fetchSummary();
  };

  const addFixed = async (payload) => {
    const { data } = await api.post('/fixed', payload);
    setFixed((prev) => [...prev, data]);
    await fetchSummary();
    return data;
  };

  const deleteFixed = async (id) => {
    await api.delete(`/fixed/${id}`);
    setFixed((prev) => prev.filter((f) => f._id !== id));
    await fetchSummary();
  };

  const addFuture = async (payload) => {
    const { data } = await api.post('/future', payload);
    setFuture((prev) => [...prev, data]);
    return data;
  };

  const realizeFuture = async (id) => {
    await api.patch(`/future/${id}/realize`);
    setFuture((prev) => prev.filter((f) => f._id !== id));
  };

  const deleteFuture = async (id) => {
    await api.delete(`/future/${id}`);
    setFuture((prev) => prev.filter((f) => f._id !== id));
  };

  const addDebt = async (payload) => {
    const { data } = await api.post('/debts', payload);
    setDebts((prev) => [...prev, data]);
    await fetchSummary();
    return data;
  };

  const deleteDebt = async (id) => {
    await api.delete(`/debts/${id}`);
    setDebts((prev) => prev.filter((d) => d._id !== id));
    await fetchSummary();
  };

  const changePeriod = (m, y) => {
    setMonth(m); setYear(y);
    fetchSummary(m, y);
  };

  return (
    <FinanceContext.Provider value={{
      month, year, changePeriod, summary, loading,
      transactions, fetchTransactions, addTransaction, deleteTransaction,
      fixed, fetchFixed, addFixed, deleteFixed,
      future, fetchFuture, addFuture, realizeFuture, deleteFuture,
      debts, fetchDebts, addDebt, deleteDebt,
      fetchSummary,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
