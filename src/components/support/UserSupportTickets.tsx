
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const UserSupportTickets = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-600/20 text-red-400';
      case 'replied': return 'bg-blue-600/20 text-blue-400';
      case 'closed': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'replied': return <MessageCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-600/20 text-gray-400';
      case 'normal': return 'bg-blue-600/20 text-blue-400';
      case 'high': return 'bg-orange-600/20 text-orange-400';
      case 'urgent': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Your Support Tickets</h3>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading tickets...</div>
      ) : tickets && tickets.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Subject</TableHead>
                <TableHead className="text-gray-300">Priority</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Reply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: any) => (
                <TableRow key={ticket.id} className="border-gray-700">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{ticket.subject}</p>
                      <p className="text-sm text-gray-400 truncate max-w-xs">
                        {ticket.message.substring(0, 50)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.admin_reply ? (
                      <div className="bg-blue-600/10 p-2 rounded border border-blue-600/30">
                        <p className="text-sm text-white">{ticket.admin_reply}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No reply yet</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No support tickets yet</p>
          <p className="text-sm">Submit a ticket above if you need help</p>
        </div>
      )}
    </Card>
  );
};
