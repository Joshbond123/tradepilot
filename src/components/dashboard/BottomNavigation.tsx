
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  ArrowUpDown,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/plans', label: 'AI Plans', icon: TrendingUp },
    { path: '/deposit', label: 'Deposit', icon: CreditCard },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpDown },
    { path: '/inbox', label: 'Inbox', icon: Mail },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 lg:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 min-w-0 flex-1",
                isActive 
                  ? "text-blue-400 bg-blue-600/20" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
