
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  TrendingUp,
  ArrowUpDown,
  CreditCard,
  Banknote,
  Mail,
  Users, 
  Settings,
  Menu,
  X,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        navigate('/admin');
        setLogoClickCount(0);
        return 0;
      }
      return newCount;
    });
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Plans', href: '/plans', icon: TrendingUp },
    { name: 'Arbitrage', href: '/arbitrage', icon: ArrowUpDown },
    { name: 'Deposit', href: '/deposit', icon: CreditCard },
    { name: 'Withdraw', href: '/withdraw', icon: Banknote },
    { name: 'Inbox', href: '/inbox', icon: Mail },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Support', href: '/support', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Only show these 5 buttons in mobile bottom navigation
  const mobileNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Plans', href: '/plans', icon: TrendingUp },
    { name: 'Deposit', href: '/deposit', icon: CreditCard },
    { name: 'Withdraw', href: '/withdraw', icon: Banknote },
    { name: 'Inbox', href: '/inbox', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-1 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700">
          <div className="flex items-center h-16 px-6 border-b border-gray-700">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Shield className="h-8 w-8 text-red-400" />
              <span className="text-xl font-bold text-white">TradePilot AI</span>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-gray-600 text-gray-400 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <button 
          onClick={handleLogoClick}
          className="flex items-center space-x-2"
        >
          <Shield className="h-6 w-6 text-red-400" />
          <span className="text-lg font-bold text-white">TradePilot AI</span>
        </button>
        
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="ghost"
          size="sm"
          className="text-gray-400"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col bg-gray-900 w-64 h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
              <span className="text-lg font-bold text-white">Menu</span>
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-600 text-gray-400 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation - Only 5 buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center px-3 py-2 min-w-0 flex-1 text-center ${
                  isActive ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
