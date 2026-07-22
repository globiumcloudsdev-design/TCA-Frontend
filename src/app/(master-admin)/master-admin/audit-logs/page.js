'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { masterAdminService } from '@/services/masterAdminService';
import toast from 'react-hot-toast';
import { 
  Activity, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, DataTable, AppModal } from '@/components/common';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (currentPage = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await masterAdminService.getAuditLogs({
        page: currentPage,
        limit: 15,
        search: searchQuery
      });
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setPage(res.data?.pagination?.page || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    const delayDebounceFn = setTimeout(() => {
      fetchLogs(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage, search);
    }
  };

  const getActionColor = (action) => {
    if (!action) return 'bg-gray-100 text-gray-800';
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'bg-green-100 text-green-800';
    if (a.includes('delete') || a.includes('remove')) return 'bg-red-100 text-red-800';
    if (a.includes('update') || a.includes('edit')) return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const columns = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div>
            <div className="text-gray-900 font-medium">
              {format(new Date(log.created_at), 'MMM dd, yyyy')}
            </div>
            <div className="text-gray-500 text-xs">
              {format(new Date(log.created_at), 'hh:mm a')}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {log.User?.first_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {log.User?.first_name} {log.User?.last_name}
              </div>
              <div className="text-xs text-gray-500">{log.ip_address || 'System'}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
            {log.action}
          </span>
        );
      }
    },
    {
      accessorKey: 'entity',
      header: 'Entity',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {log.entity || 'System'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Details',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex justify-end">
            <button 
              onClick={() => setSelectedLog(log)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Global Audit Logs"
        description="Track system-wide administrative activities and data changes."
        icon={Activity}
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search action, entity or IP..."
        pagination={{
          page,
          totalPages,
          onPageChange: handlePageChange
        }}
        emptyMessage="No activity logs found."
      />

      {/* View Details Modal */}
      <AppModal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={
          <div className="flex items-center gap-2">
            Log Details
            {selectedLog && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                {selectedLog.action}
              </span>
            )}
          </div>
        }
        size="lg"
      >
        {selectedLog && (
          <div className="p-2 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entity</span>
                <p className="font-mono text-sm mt-1 text-gray-800">{selectedLog.entity || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entity ID</span>
                <p className="font-mono text-sm mt-1 text-gray-800">{selectedLog.entity_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">IP Address</span>
                <p className="font-mono text-sm mt-1 text-gray-800">{selectedLog.ip_address || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User Agent</span>
                <p className="text-sm mt-1 text-gray-800 line-clamp-2" title={selectedLog.user_agent}>{selectedLog.user_agent || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous State (old_values)</h4>
                  <pre className="bg-red-50 text-red-900 border border-red-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">New State (new_values)</h4>
                  <pre className="bg-green-50 text-green-900 border border-green-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
