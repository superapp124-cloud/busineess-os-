import React from 'react';
import { useGlobalBackListener } from '@/hooks/useGlobalBackListener';

export const GlobalBackHandler: React.FC = () => {
  useGlobalBackListener();
  return null;
};
