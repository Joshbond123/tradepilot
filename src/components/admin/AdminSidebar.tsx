
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Globe,
  Menu,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'recaptcha', label: 'reCAPTCHA Settings', icon: Globe },
  ];

  return (
    <div className={cn(
      "bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 h-full transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Profile and Toggle */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm">A</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-sm">Admin</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white p-2"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Title */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left transition-all duration-200",
                isCollapsed ? "px-2" : "px-3",
                activeTab === item.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
