
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Shield, 
  Wallet, 
  UserCog, 
  MessageSquare, 
  Mail, 
  Globe 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'plans', label: 'Plans', icon: TrendingUp },
    { id: 'platform-settings', label: 'Platform Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'admin', label: 'Admin', icon: UserCog },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'message-templates', label: 'Message Templates', icon: Mail },
    { id: 'recaptcha', label: 'reCAPTCHA Settings', icon: Globe },
  ];

  return (
    <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 h-full">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left",
                activeTab === item.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
