
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EnhancedDepositPage } from '@/components/deposit/EnhancedDepositPage';

const Deposit = () => {
  return (
    <DashboardLayout>
      <EnhancedDepositPage />
    </DashboardLayout>
  );
};

export default Deposit;
