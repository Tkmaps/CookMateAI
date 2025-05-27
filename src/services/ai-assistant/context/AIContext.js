import React, { createContext, useContext, useState } from 'react';
import { AIService } from '../api/aiService';

const AIContext = createContext();

export function AIProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const aiService = new AIService();

  const value = {
    loading,
    error,
    aiService,
    setLoading,
    setError,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}
