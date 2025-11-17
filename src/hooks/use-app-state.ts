'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/app-context';

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
