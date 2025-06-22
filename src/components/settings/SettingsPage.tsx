
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, User, Shield, Bell, Palette, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    trading: true,
    security: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setEmail(user.email || '');
      }
    };
    getUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Handle profile data when it's loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const updateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePassword = async () => {
    // This would typically open a password reset flow
    toast({
      title: "Password Reset",
      description: "Check your email for password reset instructions",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences and security settings</p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {/* Profile Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <User className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Profile Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                value={email}
                readOnly
                className="bg-gray-700/30 border-gray-600 text-gray-400"
              />
              <p className="text-xs text-gray-500">Contact support to change your email</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Referral Code</p>
                <p className="text-lg font-mono font-semibold text-blue-400">
                  {profile?.referral_code || 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Account Status</p>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6 bg-gray-700" />
          
          <div className="flex justify-end">
            <Button
              onClick={updateProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Password</p>
                <p className="text-sm text-gray-400">Change your account password</p>
              </div>
              <Button
                onClick={updatePassword}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white"
              >
                Change Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Browser Notifications</p>
                <p className="text-sm text-gray-400">Receive push notifications in your browser</p>
              </div>
              <Switch
                checked={notifications.browser}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, browser: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Trading Alerts</p>
                <p className="text-sm text-gray-400">Get notified about trading activities and profits</p>
              </div>
              <Switch
                checked={notifications.trading}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, trading: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Security Alerts</p>
                <p className="text-sm text-gray-400">Important security notifications and login alerts</p>
              </div>
              <Switch
                checked={notifications.security}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, security: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Palette className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Theme</p>
                <p className="text-sm text-gray-400">Currently using dark theme</p>
              </div>
              <div className="text-blue-400 font-semibold">Dark Mode</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-semibold text-white">Language</p>
                <p className="text-sm text-gray-400">Choose your preferred language</p>
              </div>
              <div className="text-blue-400 font-semibold">English</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
