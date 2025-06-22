
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ReferralsPage } from '@/components/referrals/ReferralsPage';

const Referrals = () => {
  return (
    <DashboardLayout>
      <ReferralsPage />
    </DashboardLayout>
  );
};

export default Referrals;
