
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { InboxPage } from '@/components/inbox/InboxPage';

const Inbox = () => {
  return (
    <DashboardLayout>
      <InboxPage />
    </DashboardLayout>
  );
};

export default Inbox;
