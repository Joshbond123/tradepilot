
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WithdrawPage } from '@/components/withdraw/WithdrawPage';

const Withdraw = () => {
  return (
    <DashboardLayout>
      <WithdrawPage />
    </DashboardLayout>
  );
};

export default Withdraw;
