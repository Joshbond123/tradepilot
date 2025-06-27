
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  ArrowUpDown, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { BlinkingInboxIcon } from '@/components/ui/BlinkingInboxIcon';
import { useNotifications } from '@/hooks/useNotifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/plans', label: 'AI Plans', icon: TrendingUp },
    { path: '/deposit', label: 'Deposit', icon: CreditCard },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpDown },
    { path: '/arbitrage', label: 'Live Rates', icon: TrendingUp },
    { path: '/referrals', label: 'Referrals', icon: Users },
    { path: '/inbox', label: 'Inbox', icon: 'inbox', hasUnread: unreadCount > 0 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/support', label: 'Support', icon: HelpCircle },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">TradePilot AI</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold text-white">TradePilot AI</h1>
              <p className="text-gray-400 text-sm mt-1">AI Trading Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = typeof item.icon === 'string' ? null : item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left transition-all duration-200",
                      isActivePath(item.path)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.label === 'Inbox' ? (
                      <BlinkingInboxIcon hasUnread={item.hasUnread || false} className="mr-3" />
                    ) : Icon ? (
                      <Icon className="h-5 w-5 mr-3" />
                    ) : null}
                    <span>{item.label}</span>
                    {item.hasUnread && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {children}
        </div>
      </div>
    </div>
  );
};
