
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ArbitragePage } from '@/components/arbitrage/ArbitragePage';

const Arbitrage = () => {
  return (
    <DashboardLayout>
      <ArbitragePage />
    </DashboardLayout>
  );
};

export default Arbitrage;
