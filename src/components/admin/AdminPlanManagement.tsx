import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminPlanManagement = () => {
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    min_amount: '',
    max_amount: '',
    daily_profit_percentage: '',
    duration_days: '',
    exchange_logos: ['binance', 'coinbase', 'kraken'],
    status: 'active'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_plans')
        .select(`
          *,
          user_investments (
            id,
            amount,
            user_id,
            is_active,
            profit_earned
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const { error } = await supabase
        .from('investment_plans')
        .insert([{
          ...planData,
          min_amount: parseFloat(planData.min_amount),
          max_amount: parseFloat(planData.max_amount),
          daily_profit_percentage: parseFloat(planData.daily_profit_percentage),
          profit_percentage: parseFloat(planData.daily_profit_percentage) * 30, // Convert daily to monthly for compatibility
          duration_days: parseInt(planData.duration_days)
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans-detailed'] });
      toast({
        title: "Plan Created",
        description: "Investment plan has been created successfully.",
      });
      setIsCreating(false);
      setNewPlan({
        name: '',
        description: '',
        min_amount: '',
        max_amount: '',
        daily_profit_percentage: '',
        duration_days: '',
        exchange_logos: ['binance', 'coinbase', 'kraken'],
        status: 'active'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: any }) => {
      const { error } = await supabase
        .from('investment_plans')
        .update({
          ...updates,
          min_amount: parseFloat(updates.min_amount),
          max_amount: parseFloat(updates.max_amount),
          daily_profit_percentage: parseFloat(updates.daily_profit_percentage),
          profit_percentage: parseFloat(updates.daily_profit_percentage) * 30, // Convert daily to monthly for compatibility
          duration_days: parseInt(updates.duration_days),
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans-detailed'] });
      toast({
        title: "Plan Updated",
        description: "Investment plan has been updated successfully.",
      });
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans-detailed'] });
      toast({
        title: "Plan Deleted",
        description: "Investment plan has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPlanStats = (plan: any) => {
    const totalInvestments = plan.user_investments?.reduce((total: number, inv: any) => total + Number(inv.amount), 0) || 0;
    const activeInvestments = plan.user_investments?.filter((inv: any) => inv.is_active).length || 0;
    const totalProfits = plan.user_investments?.reduce((total: number, inv: any) => total + Number(inv.profit_earned), 0) || 0;
    
    return { totalInvestments, activeInvestments, totalProfits };
  };

  const handleCreatePlan = () => {
    createPlanMutation.mutate(newPlan);
  };

  const handleUpdatePlan = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({ planId: editingPlan.id, updates: editingPlan });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Plan Management</h2>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading plans...</div>
      ) : (
        <div className="grid gap-6">
          {plans?.map((plan: any) => {
            const stats = getPlanStats(plan);
            return (
              <Card key={plan.id} className="bg-gray-800/50 border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-3">{plan.description}</p>
                    <div className="flex items-center space-x-4">
                      <Badge className={plan.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}>
                        {plan.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPlan({
                        ...plan,
                        daily_profit_percentage: plan.daily_profit_percentage || (plan.profit_percentage / 30).toFixed(2)
                      })}
                      className="border-gray-600 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlanMutation.mutate(plan.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Min Amount</p>
                    <p className="text-white font-semibold">${Number(plan.min_amount).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Max Amount</p>
                    <p className="text-white font-semibold">${Number(plan.max_amount).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Daily Profit</p>
                    <p className="text-green-400 font-semibold">{plan.daily_profit_percentage || (plan.profit_percentage / 30).toFixed(2)}%</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold">{plan.duration_days} days</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Monthly Total</p>
                    <p className="text-blue-400 font-semibold">{plan.profit_percentage}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-gray-700/20 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total Invested</p>
                    <p className="text-blue-400 font-semibold">${stats.totalInvestments.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Active Investments</p>
                    <p className="text-yellow-400 font-semibold">{stats.activeInvestments}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total Profits Paid</p>
                    <p className="text-green-400 font-semibold">${stats.totalProfits.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Plan Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Create Investment Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Plan Name</Label>
                <Input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  placeholder="e.g., Alpha Neural Trader"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <select
                  value={newPlan.status}
                  onChange={(e) => setNewPlan({...newPlan, status: e.target.value})}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Min Amount ($)</Label>
                <Input
                  type="number"
                  value={newPlan.min_amount}
                  onChange={(e) => setNewPlan({...newPlan, min_amount: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Max Amount ($)</Label>
                <Input
                  type="number"
                  value={newPlan.max_amount}
                  onChange={(e) => setNewPlan({...newPlan, max_amount: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Daily Profit Percentage (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPlan.daily_profit_percentage}
                  onChange={(e) => setNewPlan({...newPlan, daily_profit_percentage: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Duration (Days)</Label>
                <Input
                  type="number"
                  value={newPlan.duration_days}
                  onChange={(e) => setNewPlan({...newPlan, duration_days: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Professional AI-powered trading strategy..."
                  className="bg-gray-700/50 border-gray-600 text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlan}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Investment Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Plan Name</Label>
                <Input
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <select
                  value={editingPlan.status}
                  onChange={(e) => setEditingPlan({...editingPlan, status: e.target.value})}
                  className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Min Amount ($)</Label>
                <Input
                  type="number"
                  value={editingPlan.min_amount}
                  onChange={(e) => setEditingPlan({...editingPlan, min_amount: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Max Amount ($)</Label>
                <Input
                  type="number"
                  value={editingPlan.max_amount}
                  onChange={(e) => setEditingPlan({...editingPlan, max_amount: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Daily Profit Percentage (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingPlan.daily_profit_percentage}
                  onChange={(e) => setEditingPlan({...editingPlan, daily_profit_percentage: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Duration (Days)</Label>
                <Input
                  type="number"
                  value={editingPlan.duration_days}
                  onChange={(e) => setEditingPlan({...editingPlan, duration_days: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingPlan(null)}
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePlan}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Plan
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
