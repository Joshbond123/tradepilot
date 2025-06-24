
import React from 'react';
import { SupportTicketForm } from './SupportTicketForm';
import { UserSupportTickets } from './UserSupportTickets';

export const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
          <p className="text-gray-400">
            Need help? Submit a support ticket and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <SupportTicketForm />
          </div>
          <div>
            <UserSupportTickets />
          </div>
        </div>
      </div>
    </div>
  );
};
