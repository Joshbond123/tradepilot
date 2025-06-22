
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PlansPage } from '@/components/plans/PlansPage';

const Plans = () => {
  return (
    <DashboardLayout>
      <PlansPage />
    </DashboardLayout>
  );
};

export default Plans;
