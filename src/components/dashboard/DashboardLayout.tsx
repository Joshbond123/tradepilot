
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, LogOut, Home, Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Mail, HelpCircle, Users, Settings, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out from TradePilot AI.",
    });
    navigate('/');
  };

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Wallet, label: 'Deposit', path: '/deposit' },
    { icon: ArrowUpFromLine, label: 'Withdraw', path: '/withdraw' },
    { icon: TrendingUp, label: 'Arbitrage', path: '/arbitrage' },
    { icon: Mail, label: 'Inbox', path: '/inbox' },
    { icon: HelpCircle, label: 'Support', path: '/support' },
    { icon: Users, label: 'Referrals', path: '/referrals' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">TradePilot AI</span>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex md:w-64 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700">
          <nav className="flex flex-col w-full p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={isActivePath(item.path) ? "secondary" : "ghost"}
                className={`justify-start w-full ${
                  isActivePath(item.path) 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-6 w-6 text-blue-400" />
                    <span className="text-lg font-bold text-white">TradePilot AI</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      variant={isActivePath(item.path) ? "secondary" : "ghost"}
                      className={`justify-start w-full ${
                        isActivePath(item.path) 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 px-2 py-2">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center p-2 min-w-0 ${
                isActivePath(item.path) 
                  ? 'text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
