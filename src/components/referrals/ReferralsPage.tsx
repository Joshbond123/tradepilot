
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Share2, DollarSign, TrendingUp, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const ReferralsPage = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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

  const { data: referralEarnings } = useQuery({
    queryKey: ['referral-earnings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_earnings')
        .select(`
          *,
          referred:profiles!referral_earnings_referred_id_fkey(email, full_name)
        `)
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: referredUsers } = useQuery({
    queryKey: ['referred-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('referred_by', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}?ref=${profile.referral_code}`
    : '';

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Join TradePilot AI',
          text: 'Start earning with AI-powered crypto arbitrage trading!',
          url: referralLink,
        });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const totalEarnings = referralEarnings?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
        <p className="text-gray-400">Earn 10% commission on every referral's trading profits</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold text-white">{referredUsers?.length || 0}</p>
              <p className="text-purple-400 text-sm">Active Users</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
              <p className="text-green-400 text-sm">Commission Earned</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                ${profile?.referral_earnings ? Number(profile.referral_earnings).toFixed(2) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm">Ready to Withdraw</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Share2 className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Your Referral Link</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={referralLink}
              readOnly
              className="bg-gray-700/50 border-gray-600 text-white flex-1"
            />
            <Button
              onClick={copyReferralLink}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={shareReferralLink}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Gift className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Share your unique referral link with friends</li>
                  <li>• They sign up and start trading with TradePilot AI</li>
                  <li>• You earn 10% commission on their trading profits</li>
                  <li>• Commissions are paid out daily to your account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Referred Users */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Referrals</h2>
          
          <div className="space-y-3">
            {referredUsers && referredUsers.length > 0 ? (
              referredUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-sm text-gray-400">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No referrals yet</p>
                <p className="text-sm">Start sharing your link to earn commissions!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Earnings History */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Earnings History</h2>
          
          <div className="space-y-3">
            {referralEarnings && referralEarnings.length > 0 ? (
              referralEarnings.map((earning: any) => (
                <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-400">+${Number(earning.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-400">
                      From: {earning.referred?.full_name || earning.referred?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {earning.source}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Earnings will appear here when your referrals start trading</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
