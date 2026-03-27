'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

import { branchService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import { BranchForm } from '@/components/forms';
import { Button } from '@/components/ui/button';

// ── helpers ────────────────────────────────────────────────────────────────────
const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

// ── columns ────────────────────────────────────────────────────────────────────
const buildColumns = (onEdit, onDelete) => [
  {
    id: 'name', header: 'Branch Name',
    cell: ({ row }) => {
      const b = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-sm leading-tight">{b.name}</p>
            {b.email && <p className="text-xs text-muted-foreground">{b.email}</p>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'address', header: 'Address',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'phone', header: 'Phone',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'is_active', header: 'Status',
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} />
    ),
  },
  {
    accessorKey: 'created_at', header: 'Created',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>
    ),
  },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const b = row.original;
      return (
        <TableRowActions
          onEdit={() => onEdit(b)}
          onDelete={() => onDelete(b)}
        />
      );
    },
  },
];

// ── page ───────────────────────────────────────────────────────────────────────
export default function BranchesPage() {
  const { canDo } = useAuthStore();
  const qc        = useQueryClient();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // modal / dialog state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [selected,    setSelected]    = useState(null);

  // pagination + search
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['branches', { page, pageSize, search }],
    queryFn:  () => branchService.getAll({ page, limit: pageSize, search }),
  });

  const rows       = extractRows(data);
  const totalPages = extractPages(data);

  // ── mutations ────────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['branches'] });

  const createMutation = useMutation({
    mutationFn: branchService.create,
    onSuccess: () => { invalidate(); setModalOpen(false); toast.success('Branch created'); },
    onError:   () => toast.error('Failed to create branch'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => branchService.update(id, body),
    onSuccess: () => { invalidate(); setModalOpen(false); toast.success('Branch updated'); },
    onError:   () => toast.error('Failed to update branch'),
  });

  const deleteMutation = useMutation({
    mutationFn: branchService.delete,
    onSuccess: () => { invalidate(); setDeleteOpen(false); toast.success('Branch deleted'); },
    onError:   () => toast.error('Failed to delete branch'),
  });

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleAdd    = () => { setSelected(null); setModalOpen(true); };
  const handleEdit   = (b) => { setSelected(b);   setModalOpen(true); };
  const handleDelete = (b) => { setSelected(b);   setDeleteOpen(true); };

  const handleSubmit = (values) => {
    if (selected?.id) updateMutation.mutate({ id: selected.id, body: values });
    else              createMutation.mutate(values);
  };

  const columns = buildColumns(handleEdit, handleDelete);

  return (
    <>
      <PageHeader
        title="Branches"
        description="Manage your school&apos;s branch campuses"
        action={
          mounted && canDo(PERMISSIONS.BRANCH_CREATE) && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Branch
            </Button>
          )
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search branches…"
        pagination={{ page, totalPages, onPageChange: setPage, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'branches' }}
      />

      {/* Create / Edit modal */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Edit Branch' : 'New Branch'}
        description={selected ? 'Update branch details' : 'Fill in the details to create a new branch'}
      >
        <BranchForm
          defaultValues={selected}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(selected?.id)}
        title="Delete Branch"
        description={`Are you sure you want to delete "${selected?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
