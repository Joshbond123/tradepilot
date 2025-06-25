
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Clock, CheckCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type TicketStatus = 'open' | 'replied' | 'closed';

export const AdminSupportTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles (email, full_name, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const replyToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_reply: reply,
          status: 'replied' as TicketStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({ title: "Reply Sent", description: "Your reply has been sent to the user." });
      setReplyMessage('');
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status,
          resolved_at: status === 'closed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({ title: "Status Updated", description: "Ticket status has been updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  const filterTicketsByStatus = (status: string) => {
    return tickets?.filter(ticket => ticket.status === status) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
        <Badge className="bg-blue-600/20 text-blue-400">
          {tickets?.length || 0} Total
        </Badge>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">
            All ({tickets?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="open" className="data-[state=active]:bg-red-600">
            Open ({filterTicketsByStatus('open').length})
          </TabsTrigger>
          <TabsTrigger value="replied" className="data-[state=active]:bg-blue-600">
            Replied ({filterTicketsByStatus('replied').length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="data-[state=active]:bg-green-600">
            Closed ({filterTicketsByStatus('closed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <TicketTable 
              tickets={tickets || []} 
              onSelectTicket={setSelectedTicket}
              onUpdateStatus={updateTicketStatusMutation.mutate}
              isLoading={isLoading}
            />
          </Card>
        </TabsContent>

        <TabsContent value="open">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <TicketTable 
              tickets={filterTicketsByStatus('open')} 
              onSelectTicket={setSelectedTicket}
              onUpdateStatus={updateTicketStatusMutation.mutate}
              isLoading={isLoading}
            />
          </Card>
        </TabsContent>

        <TabsContent value="replied">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <TicketTable 
              tickets={filterTicketsByStatus('replied')} 
              onSelectTicket={setSelectedTicket}
              onUpdateStatus={updateTicketStatusMutation.mutate}
              isLoading={isLoading}
            />
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <TicketTable 
              tickets={filterTicketsByStatus('closed')} 
              onSelectTicket={setSelectedTicket}
              onUpdateStatus={updateTicketStatusMutation.mutate}
              isLoading={isLoading}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Reply to Ticket</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-300"><strong>From:</strong> {selectedTicket.profiles?.full_name || selectedTicket.profiles?.username} ({selectedTicket.profiles?.email})</p>
                <p className="text-gray-300"><strong>Subject:</strong> {selectedTicket.subject}</p>
                <p className="text-gray-300"><strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="ml-1 capitalize">{selectedTicket.status}</span>
                  </Badge>
                </p>
              </div>
              
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-300"><strong>User Message:</strong></p>
                <p className="text-white mt-2">{selectedTicket.message}</p>
              </div>
              
              {selectedTicket.admin_reply && (
                <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-600/30">
                  <p className="text-gray-300"><strong>Previous Reply:</strong></p>
                  <p className="text-white mt-2">{selectedTicket.admin_reply}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="bg-gray-700/50 border-gray-600 text-white min-h-[120px]"
                rows={6}
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => replyToTicketMutation.mutate({ 
                    ticketId: selectedTicket.id, 
                    reply: replyMessage 
                  })}
                  disabled={!replyMessage.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
                <Button
                  onClick={() => updateTicketStatusMutation.mutate({ 
                    ticketId: selectedTicket.id, 
                    status: 'closed' as TicketStatus
                  })}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600/10"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Ticket
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const TicketTable = ({ tickets, onSelectTicket, onUpdateStatus, isLoading }: any) => {
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

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading tickets...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300">User</TableHead>
            <TableHead className="text-gray-300">Subject</TableHead>
            <TableHead className="text-gray-300">Priority</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-gray-300">Created</TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket: any) => (
            <TableRow key={ticket.id} className="border-gray-700">
              <TableCell>
                <div>
                  <p className="font-semibold text-white">
                    {ticket.profiles?.full_name || ticket.profiles?.username || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-400">{ticket.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-white font-semibold">{ticket.subject}</p>
                <p className="text-sm text-gray-400 truncate max-w-xs">
                  {ticket.message.substring(0, 50)}...
                </p>
              </TableCell>
              <TableCell>
                <Badge className="bg-yellow-600/20 text-yellow-400 capitalize">
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Reply
                  </Button>
                  {ticket.status !== 'closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus({ ticketId: ticket.id, status: 'closed' as TicketStatus })}
                      className="border-green-600 text-green-400 hover:bg-green-600/10"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
