'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/services/supportService';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import InputField from '@/components/common/InputField';
import TextareaField from '@/components/common/TextareaField';

export default function SupportPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type || 'school';
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', category: 'GENERAL', priority: 'LOW', description: '' });

  const { data: ticketsResponse, isLoading } = useQuery({
    queryKey: ['my-support-tickets'],
    queryFn: () => supportService.getMyTickets(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => supportService.createTicket(data),
    onSuccess: () => {
      toast.success('Ticket created successfully');
      setIsModalOpen(false);
      setFormData({ subject: '', category: 'GENERAL', priority: 'LOW', description: '' });
      queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    }
  });

  const tickets = ticketsResponse?.data?.data || [];

  console.log('tickets', ticketsResponse);  

  const columns = [
    { accessorKey: 'id', header: 'Ticket ID', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()?.slice(0, 8).toUpperCase()}</span> },
    { accessorKey: 'subject', header: 'Subject', cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span> },
    { 
      accessorKey: 'category', 
      header: 'Category', 
      cell: ({ getValue }) => (
        <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium">
          {getValue()?.replace('_', ' ')}
        </span>
      ) 
    },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: ({ getValue }) => {
        const val = getValue();
        const colors = {
          LOW: 'bg-slate-100 text-slate-600',
          MEDIUM: 'bg-blue-100 text-blue-700',
          HIGH: 'bg-orange-100 text-orange-700',
          URGENT: 'bg-rose-100 text-rose-700'
        };
        return <span className={`text-xs px-2 py-1 rounded-md font-bold ${colors[val]}`}>{val}</span>;
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue();
        const colors = {
          OPEN: 'bg-amber-100 text-amber-700',
          IN_PROGRESS: 'bg-blue-100 text-blue-700',
          RESOLVED: 'bg-emerald-100 text-emerald-700',
          CLOSED: 'bg-slate-100 text-slate-600'
        };
        return <span className={`text-xs px-2 py-1 rounded-full font-bold ${colors[val]}`}>{val.replace('_', ' ')}</span>;
      }
    },
    { accessorKey: 'created_at', header: 'Created On', cell: ({ getValue }) => format(new Date(getValue()), 'dd MMM yyyy, hh:mm a') },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/${type}/support/${row.original.id}`)}
          className="text-primary hover:text-primary/90"
        >
          <MessageSquare className="w-4 h-4 mr-2" /> View Chat
        </Button>
      )
    }
  ];



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      return toast.error('Subject and description are required');
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Help & Support"
        description="Raise a ticket if you need technical assistance or have questions."
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Ticket
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        emptyMessage="No support tickets found."
      />

      <AppModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Support Ticket"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <InputField 
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="E.g., Unable to generate payroll"
              required
            />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SelectField 
                label="Category"
                name="category"
                value={formData.category}
                onChange={(val) => setFormData({...formData, category: val})}
                options={[
                  { value: 'GENERAL', label: 'General Query' },
                  { value: 'TECHNICAL', label: 'Technical Issue' },
                  { value: 'BILLING', label: 'Billing / Invoice' },
                  { value: 'FEATURE_REQUEST', label: 'Feature Request' }
                ]}
              />
            </div>
            <div>
              <SelectField 
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={(val) => setFormData({...formData, priority: val})}
                options={[
                  { value: 'LOW', label: 'Low (Not urgent)' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High (Blocking work)' },
                  { value: 'URGENT', label: 'Urgent (Critical failure)' }
                ]}
              />
            </div>
          </div>

          <div className="pt-2">
            <TextareaField
              label="Description"
              name="description"
              content={formData.description}
              onContentChange={(html) => setFormData({...formData, description: html})}
              placeholder="Describe your issue in detail..."
              isTiptap={true}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Our support team usually responds within 2-4 hours during business hours.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
