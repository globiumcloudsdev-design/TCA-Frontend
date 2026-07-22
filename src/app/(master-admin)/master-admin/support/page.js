'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { masterAdminSupportService } from '@/services/masterAdminSupportService';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import SelectField from '@/components/common/SelectField';

export default function MasterAdminSupportPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ status: 'OPEN' });

  const { data: ticketsResponse, isLoading, refetch } = useQuery({
    queryKey: ['master-admin-tickets', filters],
    queryFn: () => masterAdminSupportService.getAllTickets(filters),
  });

  const tickets = ticketsResponse?.data?.data || [];

  const columns = [
    { accessorKey: 'id', header: 'Ticket ID', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()?.slice(0, 8).toUpperCase()}</span> },
    { 
      id: 'institute', 
      header: 'Institute', 
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.Institute?.institute_logo_url && <img src={row.original.Institute.institute_logo_url} alt="Logo" className="w-6 h-6 rounded object-contain bg-white" />}
          <span className="font-medium text-slate-800">{row.original.Institute?.institute_name || 'Unknown'}</span>
        </div>
      )
    },
    { accessorKey: 'subject', header: 'Subject', cell: ({ getValue }) => <span className="text-slate-700 max-w-[200px] truncate block" title={getValue()}>{getValue()}</span> },
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
          onClick={() => router.push(`/master-admin/support/${row.original.id}`)}
          className="text-primary hover:text-primary/90"
        >
          <MessageSquare className="w-4 h-4 mr-2" /> View & Reply
        </Button>
      )
    }
  ];



  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Support Tickets"
        description="Manage and resolve issues reported by institutes."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 text-slate-500 shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by Status:</span>
        </div>
        <div className="w-64">
          <SelectField
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val === 'ALL' ? '' : val })}
            options={[
              { value: 'ALL', label: 'All Tickets' },
              { value: 'OPEN', label: 'OPEN' },
              { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
              { value: 'RESOLVED', label: 'RESOLVED' },
              { value: 'CLOSED', label: 'CLOSED' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        emptyMessage="No tickets found in this category."
      />
    </div>
  );
}
