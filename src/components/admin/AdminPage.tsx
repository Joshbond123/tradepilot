
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebar } from './AdminSidebar';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminEnhancedPlanManagement } from './AdminEnhancedPlanManagement';
import { AdminTransactionManagement } from './AdminTransactionManagement';
import { AdminEnhancedSystemSettings } from './AdminEnhancedSystemSettings';
import { AdminSupportTickets } from './AdminSupportTickets';
import { AdminMessageTemplates } from './AdminMessageTemplates';
import { AdminRecaptchaSettings } from './AdminRecaptchaSettings';
import { AdminOverview } from './AdminOverview';

export const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUserManagement />;
      case 'transactions':
        return <AdminTransactionManagement />;
      case 'plans':
        return <AdminEnhancedPlanManagement />;
      case 'platform-settings':
        return <AdminEnhancedSystemSettings />;
      case 'security':
        return <AdminSupportTickets />;
      case 'wallets':
        return <AdminEnhancedSystemSettings />;
      case 'admin':
        return <AdminEnhancedSystemSettings />;
      case 'support':
        return <AdminSupportTickets />;
      case 'message-templates':
        return <AdminMessageTemplates />;
      case 'recaptcha':
        return <AdminRecaptchaSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-400" />
                <span className="text-xl font-bold text-white">TradePilot Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                Administrator
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
