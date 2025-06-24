
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EnhancedWithdrawPage } from '@/components/withdraw/EnhancedWithdrawPage';

const Withdraw = () => {
  return (
    <DashboardLayout>
      <EnhancedWithdrawPage />
    </DashboardLayout>
  );
};

export default Withdraw;
