'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Download, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import TableRowActions from '@/components/common/TableRowActions';
import { CreatableSelectField } from '@/components/common';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { expenseService } from '@/services/expenseService';
import { vendorService } from '@/services/vendorService';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const DEFAULT_CATEGORIES = [
  { value: 'utilities', label: 'Utilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'books', label: 'Books & Stationery' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'salary', label: 'Salary & Wages' },
  { value: 'rent', label: 'Rent' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'training', label: 'Training & Development' },
  { value: 'furniture', label: 'Furniture & Equipment' },
  { value: 'misc', label: 'Miscellaneous' },
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  title: '',
  amount: '',
  category: '',
  vendor_id: '',
  vendor_name: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  status: 'pending',
  receipt_url: '',
  payment_reference: '',
};

export default function Expense() {
  const canDo = useAuthStore((s) => s.canDo);
  const queryClient = useQueryClient();

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selected items
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  // Fetch categories from API
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      try {
        const res = await expenseService.getCategories?.({ onlyActive: true });
        const apiCategories = res?.data || [];
        const allCategories = [...DEFAULT_CATEGORIES, ...apiCategories];
        const unique = new Map();
        allCategories.forEach(cat => {
          if (!unique.has(cat.value)) unique.set(cat.value, cat);
        });
        return Array.from(unique.values());
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return DEFAULT_CATEGORIES;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch vendors for dropdown
  const { data: vendorsData = [] } = useQuery({
    queryKey: ['vendor-options'],
    queryFn: async () => {
      try {
        const res = await vendorService.getOptions?.({ status: 'active' });
        return res?.data || [];
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch expenses with filters
  const {
    data: expensesData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['expenses', page, pageSize, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      };
      try {
        const res = await expenseService.getAll(params);
        console.log('Fetched expenses response:', res);
        // Backend returns: { success, message, data: [...], pagination: {...} }
        return {
          rows: res?.data || [],
          pagination: res?.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 0 }
        };
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        return { rows: [], pagination: { total: 0, page: 1, limit: pageSize, totalPages: 0 } };
      }
    },
    placeholderData: { rows: [], pagination: { total: 0, page: 1, limit: pageSize, totalPages: 0 } },
  });

  const expenses = expensesData?.rows || [];
  const total = expensesData?.pagination?.total || 0;
  const totalPages = expensesData?.pagination?.totalPages || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense created successfully');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create expense');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update expense');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
      setDeleteModalOpen(false);
      setDeletingExpense(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete expense');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => expenseService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense status updated');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });

  const resetForm = () => setForm(EMPTY_FORM);

  const openAdd = () => {
    setEditingExpense(null);
    resetForm();
    setFormModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingExpense(row);
    setForm({
      title: row.title,
      amount: String(row.amount),
      category: row.category,
      vendor_id: row.vendor_id || '',
      vendor_name: row.vendor_name || '',
      date: row.date,
      description: row.description || '',
      status: row.status,
      receipt_url: row.receipt_url || '',
      payment_reference: row.payment_reference || '',
    });
    setFormModalOpen(true);
  };

  const openView = (row) => {
    setViewingExpense(row);
    setViewModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const onSave = (e) => {
    e.preventDefault();

    if (!form.title || !form.amount || !form.category || !form.date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      description: form.description?.trim() || '',
      status: form.status,
      receipt_url: form.receipt_url?.trim() || null,
      payment_reference: form.payment_reference?.trim() || null,
    };

    // Handle vendor: either vendor_id or vendor_name
    if (form.vendor_id) {
      payload.vendor_id = form.vendor_id;
    } else if (form.vendor_name?.trim()) {
      payload.vendor_name = form.vendor_name.trim();
    }

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const onDelete = () => {
    if (deletingExpense) {
      deleteMutation.mutate(deletingExpense.id);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const handleExport = () => {
    if (!expenses.length) {
      toast.error('No data to export');
      return;
    }

    const exportData = expenses.map(exp => ({
      'Expense #': exp.expense_number || exp.id,
      'Title': exp.title,
      'Amount': exp.amount,
      'Category': categoriesData.find(c => c.value === exp.category)?.label || exp.category,
      'Vendor': exp.vendor_name || exp.vendor?.name || '',
      'Date': new Date(exp.date).toLocaleDateString('en-PK'),
      'Status': exp.status,
      'Description': (exp.description || '').replace(/\n/g, ' '),
    }));

    const headers = Object.keys(exportData[0] || {});
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(h => {
          const val = row[h];
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export started');
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'expense_number',
      header: 'Expense #',
      cell: ({ getValue }) => (
        <span className="font-medium text-xs bg-primary/10 px-2 py-1 rounded">
          {getValue() || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ getValue, row }) => (
        <div>
          <span className="font-medium block">{getValue()}</span>
          {row.original.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
          )}
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => {
        const category = getValue();
        const label = categoriesData.find((opt) => opt.value === category)?.label || category;
        return <span className="text-sm">{label}</span>;
      },
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => {
        const vendor = row.original.vendor_name || row.original.vendor?.name;
        return <span className="text-sm">{vendor || '—'}</span>;
      }
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm">PKR {Number(getValue() || 0).toLocaleString()}</span>
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm">
          {new Date(getValue()).toLocaleDateString('en-PK')}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[value] || STATUS_COLORS.pending)}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const extraActions = [];

        // Add Paid/Unpaid toggle button if user can update
        if (canDo('expenses.update') && (row.original.status === 'approved' || row.original.status === 'paid')) {
          extraActions.push({
            label: row.original.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid',
            icon: row.original.status === 'paid' ? <XCircle size={14} /> : <CheckCircle size={14} />,
            onClick: () => handleStatusChange(
              row.original.id,
              row.original.status === 'paid' ? 'approved' : 'paid'
            ),
            className: row.original.status === 'paid' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700',
          });
        }

        return (
          <TableRowActions
            onView={() => openView(row.original)}
            onEdit={canDo('expenses.update') ? () => openEdit(row.original) : null}
            onDelete={canDo('expenses.delete') ? () => {
              setDeletingExpense(row.original);
              setDeleteModalOpen(true);
            } : null}
            extra={extraActions}
          />
        );
      },
    },
  ], [canDo, categoriesData, handleStatusChange]);

  if (!canDo('expenses.read')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to view expenses.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Expense Management"
        description={`Total ${total} expense records`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"
              disabled={isFetching}
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={expenses.length === 0}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        emptyMessage="No expenses found"
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by title, vendor, or description..."
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setPage(1);
            },
            options: STATUS_OPTIONS,
          },
          {
            name: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: (v) => {
              setCategoryFilter(v);
              setPage(1);
            },
            options: categoriesData,
          },
        ]}
        action={canDo('expenses.create') ? (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} /> Add Expense
          </button>
        ) : null}
        enableColumnVisibility
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={formModalOpen}
        onClose={closeFormModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeFormModal}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-form"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingExpense ? 'Update' : 'Save')}
            </button>
          </>
        }
      >
        <form id="expense-form" onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expense Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="input-base"
                placeholder="e.g., Science Lab Supplies"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (PKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="input-base"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <CreatableSelectField
                label="Category"
                name="category"
                value={form.category}
                onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                options={categoriesData}
                required
              />
            </div>

            <CreatableSelectField
              label="Vendor"
              value={form.vendor_id}
              onChange={(value) => setForm((prev) => ({
                ...prev,
                vendor_id: value,
                vendor_name: ''
              }))}
              options={vendorsData}
              placeholder="Select vendor or type new name"
            />
          </div>

          {/* Show manual vendor name input if no vendor selected */}
          {!form.vendor_id && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vendor Name</label>
              <input
                value={form.vendor_name}
                onChange={(e) => setForm((prev) => ({ ...prev, vendor_name: e.target.value }))}
                className="input-base"
                placeholder="Enter vendor name"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="input-base"
                required
              />
            </div>
            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              options={STATUS_OPTIONS}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="input-base min-h-24"
              placeholder="Additional details about this expense..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Receipt URL</label>
              <input
                type="url"
                value={form.receipt_url}
                onChange={(e) => setForm((prev) => ({ ...prev, receipt_url: e.target.value }))}
                className="input-base"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Reference</label>
              <input
                value={form.payment_reference}
                onChange={(e) => setForm((prev) => ({ ...prev, payment_reference: e.target.value }))}
                className="input-base"
                placeholder="Cheque #, Transaction ID, etc."
              />
            </div>
          </div>
        </form>
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingExpense(null);
        }}
        title="Expense Details"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <button
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        {viewingExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {viewingExpense.expense_number && (
                <div>
                  <p className="text-muted-foreground">Expense #</p>
                  <p className="font-medium">{viewingExpense.expense_number}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Expense Title</p>
                <p className="font-medium">{viewingExpense.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-lg">PKR {Number(viewingExpense.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{categoriesData.find((opt) => opt.value === viewingExpense.category)?.label || viewingExpense.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendor</p>
                <p className="font-medium">{viewingExpense.vendor_name || viewingExpense.vendor?.name || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(viewingExpense.date).toLocaleDateString('en-PK')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[viewingExpense.status])}>
                  {viewingExpense.status}
                </span>
              </div>
              {viewingExpense.payment_reference && (
                <div>
                  <p className="text-muted-foreground">Payment Reference</p>
                  <p className="font-medium">{viewingExpense.payment_reference}</p>
                </div>
              )}
              {viewingExpense.receipt_url && (
                <div>
                  <p className="text-muted-foreground">Receipt</p>
                  <a href={viewingExpense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    View Receipt
                  </a>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium whitespace-pre-wrap">{viewingExpense.description || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Confirmation Modal */}
      <AppModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{deletingExpense?.title}</strong>? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
