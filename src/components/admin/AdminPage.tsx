
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { AdminMessages } from './AdminMessages';

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
      case 'messages':
        return <AdminMessages />;
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-3 min-w-0">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white flex-shrink-0"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0" />
                <span className="text-lg sm:text-xl font-bold text-white truncate">TradePilot Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Badge variant="secondary" className="bg-red-600/20 text-red-400 hidden sm:inline-flex">
                Administrator
              </Badge>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
                size="sm"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
