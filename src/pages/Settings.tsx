
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SettingsPage } from '@/components/settings/SettingsPage';

const Settings = () => {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  );
};

export default Settings;
