
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Edit, Trash2, Plus, Save, X, Image } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminEnhancedPlanManagement = () => {
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState<any>(null);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-investment-plans-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_plans')
        .select(`
          *,
          plan_exchange_logos (
            exchange_logos (
              id,
              name,
              logo_url
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: exchangeLogos } = useQuery({
    queryKey: ['exchange-logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_logos')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const { data: plan, error: planError } = await supabase
        .from('investment_plans')
        .insert({
          name: planData.name,
          description: planData.description,
          min_amount: planData.min_amount,
          max_amount: planData.max_amount,
          profit_percentage: planData.profit_percentage,
          daily_profit_percentage: planData.daily_profit_percentage,
          duration_days: planData.duration_days,
          status: 'active'
        })
        .select()
        .single();
      
      if (planError) throw planError;

      // Add selected exchange logos
      if (selectedExchanges.length > 0) {
        const exchangeLinks = selectedExchanges.map(exchangeId => ({
          plan_id: plan.id,
          exchange_logo_id: exchangeId
        }));

        const { error: linkError } = await supabase
          .from('plan_exchange_logos')
          .insert(exchangeLinks);
        
        if (linkError) throw linkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investment-plans-detailed'] });
      toast({ title: "Plan Created", description: "Investment plan has been created successfully." });
      setNewPlan(null);
      setSelectedExchanges([]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates, exchanges }: { planId: string; updates: any; exchanges: string[] }) => {
      const { error: planError } = await supabase
        .from('investment_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);
      
      if (planError) throw planError;

      // Update exchange logos
      await supabase.from('plan_exchange_logos').delete().eq('plan_id', planId);
      
      if (exchanges.length > 0) {
        const exchangeLinks = exchanges.map(exchangeId => ({
          plan_id: planId,
          exchange_logo_id: exchangeId
        }));

        const { error: linkError } = await supabase
          .from('plan_exchange_logos')
          .insert(exchangeLinks);
        
        if (linkError) throw linkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investment-plans-detailed'] });
      toast({ title: "Plan Updated", description: "Investment plan has been updated successfully." });
      setEditingPlan(null);
      setSelectedExchanges([]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      queryClient.invalidateQueries({ queryKey: ['admin-investment-plans-detailed'] });
      toast({ title: "Plan Deleted", description: "Investment plan has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditPlan = (plan: any) => {
    setEditingPlan({ ...plan });
    const planExchanges = plan.plan_exchange_logos.map((pel: any) => pel.exchange_logos.id);
    setSelectedExchanges(planExchanges);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({
        planId: editingPlan.id,
        updates: {
          name: editingPlan.name,
          description: editingPlan.description,
          min_amount: editingPlan.min_amount,
          max_amount: editingPlan.max_amount,
          profit_percentage: editingPlan.profit_percentage,
          daily_profit_percentage: editingPlan.daily_profit_percentage,
          duration_days: editingPlan.duration_days,
          status: editingPlan.status
        },
        exchanges: selectedExchanges
      });
    }
  };

  const handleCreatePlan = () => {
    if (newPlan && newPlan.name && newPlan.min_amount && newPlan.max_amount) {
      createPlanMutation.mutate(newPlan);
    }
  };

  const toggleExchangeSelection = (exchangeId: string) => {
    setSelectedExchanges(prev => 
      prev.includes(exchangeId) 
        ? prev.filter(id => id !== exchangeId)
        : [...prev, exchangeId]
    );
  };

  const ExchangeSelector = ({ exchanges, selected, onToggle }: any) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {exchanges?.map((exchange: any) => (
        <div
          key={exchange.id}
          onClick={() => onToggle(exchange.id)}
          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
            selected.includes(exchange.id)
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <img
              src={exchange.logo_url}
              alt={exchange.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <span className="text-xs text-white text-center">{exchange.name}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Investment Plans</h2>
        </div>
        <Button
          onClick={() => setNewPlan({
            name: '',
            description: '',
            min_amount: '',
            max_amount: '',
            profit_percentage: '',
            daily_profit_percentage: '',
            duration_days: '',
            status: 'active'
          })}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading plans...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Plan Details</TableHead>
                  <TableHead className="text-gray-300">Amount Range</TableHead>
                  <TableHead className="text-gray-300">Returns</TableHead>
                  <TableHead className="text-gray-300">Exchanges</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newPlan && (
                  <TableRow className="border-gray-700 bg-green-500/10">
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          placeholder="Plan Name"
                          value={newPlan.name}
                          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Textarea
                          placeholder="Description"
                          value={newPlan.description}
                          onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={2}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Min Amount"
                          value={newPlan.min_amount}
                          onChange={(e) => setNewPlan({ ...newPlan, min_amount: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Max Amount"
                          value={newPlan.max_amount}
                          onChange={(e) => setNewPlan({ ...newPlan, max_amount: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Daily Profit %"
                          value={newPlan.daily_profit_percentage}
                          onChange={(e) => setNewPlan({ ...newPlan, daily_profit_percentage: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Duration (days)"
                          value={newPlan.duration_days}
                          onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Label className="text-gray-300 text-xs">Select Exchanges:</Label>
                        <ExchangeSelector 
                          exchanges={exchangeLogos} 
                          selected={selectedExchanges}
                          onToggle={toggleExchangeSelection}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleCreatePlan}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewPlan(null);
                            setSelectedExchanges([]);
                          }}
                          className="border-gray-600 text-gray-400"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {plans?.map((plan: any) => (
                  <TableRow key={plan.id} className="border-gray-700">
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingPlan.name}
                            onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Textarea
                            value={editingPlan.description}
                            onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-white">{plan.name}</p>
                          <p className="text-sm text-gray-400">{plan.description}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={editingPlan.min_amount}
                            onChange={(e) => setEditingPlan({ ...editingPlan, min_amount: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Input
                            type="number"
                            value={editingPlan.max_amount}
                            onChange={(e) => setEditingPlan({ ...editingPlan, max_amount: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-white">${Number(plan.min_amount).toLocaleString()}</p>
                          <p className="text-white">${Number(plan.max_amount).toLocaleString()}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editingPlan.daily_profit_percentage}
                            onChange={(e) => setEditingPlan({ ...editingPlan, daily_profit_percentage: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Input
                            type="number"
                            value={editingPlan.duration_days}
                            onChange={(e) => setEditingPlan({ ...editingPlan, duration_days: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-green-400 font-semibold">{plan.daily_profit_percentage}% daily</p>
                          <p className="text-gray-400">{plan.duration_days} days</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-xs">Select Exchanges:</Label>
                          <ExchangeSelector 
                            exchanges={exchangeLogos} 
                            selected={selectedExchanges}
                            onToggle={toggleExchangeSelection}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {plan.plan_exchange_logos?.map((pel: any) => (
                            <img
                              key={pel.exchange_logos.id}
                              src={pel.exchange_logos.logo_url}
                              alt={pel.exchange_logos.name}
                              className="w-6 h-6 object-contain"
                              title={pel.exchange_logos.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={plan.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingPlan?.id === plan.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSavePlan}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPlan(null);
                                setSelectedExchanges([]);
                              }}
                              className="border-gray-600 text-gray-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPlan(plan)}
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
