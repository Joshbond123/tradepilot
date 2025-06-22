
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DepositPage } from '@/components/deposit/DepositPage';

const Deposit = () => {
  return (
    <DashboardLayout>
      <DepositPage />
    </DashboardLayout>
  );
};

export default Deposit;
