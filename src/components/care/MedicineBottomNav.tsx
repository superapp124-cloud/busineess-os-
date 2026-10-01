import React from 'react';
import { HealthBottomNav } from '@/components/health/HealthBottomNav';

/**
 * MedicineBottomNav
 * Unifies the medicines section under the primary CHATR Health OS bottom navigation.
 * Prevents sub-navigation hijacking so the user can freely switch between
 * Hub, Wellness, Medicines, Reports, and Passport.
 */
export const MedicineBottomNav = () => {
  return <HealthBottomNav />;
};
