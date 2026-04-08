// src/components/settings/PolicyManagement.jsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { policyService } from '@/services/policyService';
import { POLICY_TYPES, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, POLICY_CONFIG_TEMPLATES } from '@/constants/policy.constants';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import { CreatableSelectField } from '@/components/common';
import { cn } from '@/lib/utils';

// ID Card Preview Component
const IDCardPreview = ({ config }) => {
  const {
    layout = 'vertical',
    size = 'CR80',
    design = { background_color: '#0f172a', text_color: '#ffffff', logo_position: 'top' },
    qr_enabled = false,
    barcode_enabled = false,
  } = config || {};

  const cardStyles = {
    CR80: { width: '320px', height: '200px' },
    A4: { width: '100%', height: 'auto', minHeight: '200px' },
  };
  const cardSize = cardStyles[size] || cardStyles.CR80;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Live Preview</h4>
        <span className="text-xs text-muted-foreground">{size} • {layout}</span>
      </div>
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          ...cardSize,
          backgroundColor: design.background_color,
          color: design.text_color,
          padding: '12px',
          display: 'flex',
          flexDirection: layout === 'vertical' ? 'column' : 'row',
          gap: '12px',
        }}
      >
        {design.logo_position === 'top' && (
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🏫</div>
          </div>
        )}
        <div className="flex-1 space-y-2 text-center">
          <div className="text-lg font-bold">Student ID Card</div>
          <div className="text-sm">John Doe</div>
          <div className="text-xs">ID: STD-12345</div>
          <div className="text-xs">Class: 10th Grade</div>
        </div>
        {design.logo_position === 'right' && (
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🏫</div>
          </div>
        )}
        {(qr_enabled || barcode_enabled) && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {qr_enabled && <div className="h-8 w-8 bg-black/20 rounded">QR</div>}
            {barcode_enabled && <div className="h-6 w-16 bg-black/20 rounded">|| || ||</div>}
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        *Preview only – actual card may vary based on data
      </p>
    </div>
  );
};

// Policy Type Options
const POLICY_TYPE_OPTIONS = [
  { value: POLICY_TYPES.ID_CARD, label: POLICY_TYPE_LABELS[POLICY_TYPES.ID_CARD] },
  { value: POLICY_TYPES.PAYROLL, label: POLICY_TYPE_LABELS[POLICY_TYPES.PAYROLL] }
];

const EMPTY_FORM = {
  policy_type: '',
  policy_name: '',
  description: '',
  config: {},
  branch_id: null,
  is_active: true
};

export default function PolicyManagement() {
  const canDo = useAuthStore((s) => s.canDo);
  const institute = useAuthStore((s) => s.getInstitute());
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState('');
  const [policyTypeFilter, setPolicyTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Selected items
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  // Fetch policies
  const { data: policiesData, isLoading, refetch } = useQuery({
    queryKey: ['policies', page, pageSize, search, policyTypeFilter, statusFilter],
    queryFn: () => policyService.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      policy_type: policyTypeFilter || undefined,
      is_active: statusFilter !== '' ? statusFilter === 'active' : undefined,
      institute_id: institute?.id
    }),
    enabled: !!institute?.id
  });

  const policies = policiesData?.data || [];
  const total = policiesData?.pagination?.total || 0;
  const totalPages = policiesData?.pagination?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: policyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      toast.success('🎉 Policy created successfully!');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create policy');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => policyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      toast.success('✅ Policy updated successfully!');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update policy');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: policyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      toast.success('🗑️ Policy deleted successfully');
      setDeleteModalOpen(false);
      setDeletingPolicy(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete policy');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => policyService.toggleStatus(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries(['policies']);
      toast.success(`✅ Policy ${isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle policy status');
    }
  });

  // Form handlers
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormStep(1);
    setEditingPolicy(null);
  };

  const openAdd = () => {
    resetForm();
    setFormModalOpen(true);
  };

  const openEdit = (policy) => {
    setEditingPolicy(policy);
    setFormStep(1);
    setForm({
      policy_type: policy.policy_type,
      policy_name: policy.policy_name,
      description: policy.description || '',
      config: policy.config,
      branch_id: policy.branch_id,
      is_active: policy.is_active
    });
    setFormModalOpen(true);
  };

  const openView = (policy) => {
    setViewingPolicy(policy);
    setViewModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    resetForm();
  };

  const handleNextStep = () => {
    // Validation for step 1
    if (!form.policy_type) {
      toast.error('Please select a Policy Type');
      return;
    }
    if (!form.policy_name || form.policy_name.trim() === '') {
      toast.error('Please enter a Policy Name');
      return;
    }
    setFormStep(2);
  };

  const handlePrevStep = () => {
    setFormStep(1);
  };

  const onSave = (e) => {
    e.preventDefault(); // Prevent any accidental submit

    if (!form.policy_type || !form.policy_name) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingPolicy) {
      const updatePayload = {
        policy_name: form.policy_name,
        description: form.description,
        config: form.config,
        branch_id: form.branch_id,
        is_active: form.is_active
      };
      updateMutation.mutate({ id: editingPolicy.id, data: updatePayload });
    } else {
      const createPayload = {
        ...form,
        institute_id: institute?.id,
        config: form.config || POLICY_CONFIG_TEMPLATES[form.policy_type] || {}
      };
      createMutation.mutate(createPayload);
    }
  };

  const onDelete = () => {
    if (deletingPolicy) {
      deleteMutation.mutate(deletingPolicy.id);
    }
  };

  const handleToggleStatus = (policy) => {
    toggleStatusMutation.mutate({
      id: policy.id,
      isActive: !policy.is_active
    });
  };

  // Config form renderers
  const renderConfigForm = () => {
    const policyType = form.policy_type;
    const config = form.config || {};

    switch (policyType) {
      case POLICY_TYPES.ID_CARD:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold">Card Settings</h3>
                <SelectField
                  label="Layout"
                  value={config.layout || 'vertical'}
                  onChange={(v) => setForm({ ...form, config: { ...config, layout: v } })}
                  options={[
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertical' }
                  ]}
                />
                <SelectField
                  label="Card Size"
                  value={config.size || 'CR80'}
                  onChange={(v) => setForm({ ...form, config: { ...config, size: v } })}
                  options={[
                    { value: 'CR80', label: 'CR80 (Standard)' },
                    { value: 'A4', label: 'A4' }
                  ]}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Color</label>
                  <input
                    type="color"
                    value={config.design?.background_color || '#0f172a'}
                    onChange={(e) => setForm({
                      ...form,
                      config: { ...config, design: { ...config.design, background_color: e.target.value } }
                    })}
                    className="input-base h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Color</label>
                  <input
                    type="color"
                    value={config.design?.text_color || '#ffffff'}
                    onChange={(e) => setForm({
                      ...form,
                      config: { ...config, design: { ...config.design, text_color: e.target.value } }
                    })}
                    className="input-base h-10"
                  />
                </div>
                <SelectField
                  label="Logo Position"
                  value={config.design?.logo_position || 'top'}
                  onChange={(v) => setForm({
                    ...form,
                    config: { ...config, design: { ...config.design, logo_position: v } }
                  })}
                  options={[
                    { value: 'top', label: 'Top' },
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' }
                  ]}
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.qr_enabled || false}
                      onChange={(e) => setForm({ ...form, config: { ...config, qr_enabled: e.target.checked } })}
                    />
                    <span>Enable QR Code</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.barcode_enabled || false}
                      onChange={(e) => setForm({ ...form, config: { ...config, barcode_enabled: e.target.checked } })}
                    />
                    <span>Enable Barcode</span>
                  </label>
                </div>
              </div>
              <div>
                <IDCardPreview config={config} />
              </div>
            </div>
          </div>
        );

      case POLICY_TYPES.PAYROLL:
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Salary Structure</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Basic Salary Percentage (%)</label>
                  <input
                    type="number"
                    value={config.salary_structure?.basic_percentage || 50}
                    onChange={(e) => setForm({
                      ...form,
                      config: {
                        ...config,
                        salary_structure: {
                          ...config.salary_structure,
                          basic_percentage: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="input-base mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Allowances</label>
                  <div className="space-y-2 pl-2 border-l-2 border-muted">
                    {(config.salary_structure?.allowances || []).map((allowance, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={allowance.name}
                          onChange={(e) => {
                            const newAllowances = [...(config.salary_structure?.allowances || [])];
                            newAllowances[idx] = { ...newAllowances[idx], name: e.target.value };
                            setForm({
                              ...form,
                              config: {
                                ...config,
                                salary_structure: { ...config.salary_structure, allowances: newAllowances }
                              }
                            });
                          }}
                          placeholder="Allowance name"
                          className="input-base text-sm flex-1"
                        />
                        <input
                          type="number"
                          value={allowance.percentage}
                          onChange={(e) => {
                            const newAllowances = [...(config.salary_structure?.allowances || [])];
                            newAllowances[idx] = { ...newAllowances[idx], percentage: parseInt(e.target.value) || 0 };
                            setForm({
                              ...form,
                              config: {
                                ...config,
                                salary_structure: { ...config.salary_structure, allowances: newAllowances }
                              }
                            });
                          }}
                          placeholder="%"
                          className="input-base text-sm w-24"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newAllowances = (config.salary_structure?.allowances || []).filter((_, i) => i !== idx);
                            setForm({
                              ...form,
                              config: {
                                ...config,
                                salary_structure: { ...config.salary_structure, allowances: newAllowances }
                              }
                            });
                          }}
                          className="text-destructive hover:bg-destructive/10 rounded p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newAllowances = [...(config.salary_structure?.allowances || []), { name: '', percentage: 0 }];
                        setForm({
                          ...form,
                          config: {
                            ...config,
                            salary_structure: { ...config.salary_structure, allowances: newAllowances }
                          }
                        });
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      + Add Allowance
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Deductions</h3>
              <div className="space-y-2 pl-2 border-l-2 border-muted">
                {(config.deductions || []).map((deduction, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={deduction.name}
                      onChange={(e) => {
                        const newDeductions = [...(config.deductions || [])];
                        newDeductions[idx] = { ...newDeductions[idx], name: e.target.value };
                        setForm({ ...form, config: { ...config, deductions: newDeductions } });
                      }}
                      placeholder="Deduction name"
                      className="input-base text-sm flex-1"
                    />
                    <input
                      type="number"
                      value={deduction.amount}
                      onChange={(e) => {
                        const newDeductions = [...(config.deductions || [])];
                        newDeductions[idx] = { ...newDeductions[idx], amount: parseInt(e.target.value) || 0 };
                        setForm({ ...form, config: { ...config, deductions: newDeductions } });
                      }}
                      placeholder="Amount"
                      className="input-base text-sm w-24"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDeductions = (config.deductions || []).filter((_, i) => i !== idx);
                        setForm({ ...form, config: { ...config, deductions: newDeductions } });
                      }}
                      className="text-destructive hover:bg-destructive/10 rounded p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newDeductions = [...(config.deductions || []), { name: '', amount: 0 }];
                    setForm({ ...form, config: { ...config, deductions: newDeductions } });
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  + Add Deduction
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Overtime Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.overtime?.enabled || false}
                    onChange={(e) => setForm({
                      ...form,
                      config: {
                        ...config,
                        overtime: { ...config.overtime, enabled: e.target.checked }
                      }
                    })}
                  />
                  <span>Enable Overtime</span>
                </label>
                {config.overtime?.enabled && (
                  <div>
                    <label className="text-sm font-medium">Rate per Hour (₨)</label>
                    <input
                      type="number"
                      value={config.overtime?.rate_per_hour || 200}
                      onChange={(e) => setForm({
                        ...form,
                        config: {
                          ...config,
                          overtime: { ...config.overtime, rate_per_hour: parseInt(e.target.value) || 0 }
                        }
                      })}
                      className="input-base mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Select a policy type to configure</p>;
    }
  };

  // DataTable columns (unchanged, keep as is)
  const columns = useMemo(() => [
    {
      accessorKey: 'policy_name',
      header: 'Policy Name',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{POLICY_TYPE_ICONS[row.original.policy_type]}</span>
          <div>
            <span className="font-medium">{getValue()}</span>
            {row.original.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'policy_type',
      header: 'Type',
      cell: ({ getValue }) => (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {POLICY_TYPE_LABELS[getValue()] || getValue()}
        </span>
      )
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ getValue }) => <span className="text-sm">v{getValue()}</span>
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          )}>
            {getValue() ? 'Active' : 'Inactive'}
          </span>
          {canDo('policies.activate') && (
            <button
              onClick={() => handleToggleStatus(row.original)}
              className="rounded p-1 hover:bg-accent"
              title={getValue() ? 'Deactivate' : 'Activate'}
            >
              {getValue() ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
            </button>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canDo('policies.read') && (
            <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent" title="View">
              <Eye size={14} />
            </button>
          )}
          {canDo('policies.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit">
              <Edit size={14} />
            </button>
          )}
          {canDo('policies.delete') && (
            <button
              onClick={() => {
                setDeletingPolicy(row.original);
                setDeleteModalOpen(true);
              }}
              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ], [canDo]);

  const canReadPolicies = canDo('policies.read');
  const canCreatePolicies = canDo('policies.create');

  if (!canReadPolicies) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to view policies.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Policy Management"
        description={`${total} policy records`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            {canCreatePolicies && (
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus size={14} /> Add Policy
              </button>
            )}
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={policies}
        loading={isLoading}
        emptyMessage="No policies found"
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search policies..."
        filters={[
          {
            name: 'policy_type',
            label: 'Policy Type',
            value: policyTypeFilter,
            onChange: (v) => {
              setPolicyTypeFilter(v);
              setPage(1);
            },
            options: POLICY_TYPE_OPTIONS
          },
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setPage(1);
            },
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          }
        }}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={formModalOpen}
        onClose={closeFormModal}
        title={`${editingPolicy ? 'Edit' : 'Create'} ${form.policy_type ? POLICY_TYPE_LABELS[form.policy_type] : 'Policy'}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            {formStep === 2 && (
              <button type="button" onClick={handlePrevStep} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
                ← Previous
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
                Cancel
              </button>
              {formStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"  // IMPORTANT: type="button" to avoid any automatic submission
                  onClick={onSave}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
            formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            1
          </div>
          <div className={cn('h-1 w-12', formStep >= 2 ? 'bg-primary' : 'bg-muted')} />
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
            formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            2
          </div>
        </div>

        {/* No <form> tag to prevent accidental submit on Enter */}
        <div className="space-y-4">
          {formStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="font-semibold text-base">Step 1: Basic Information</h3>
              <SelectField
                label="Policy Type *"
                value={form.policy_type}
                onChange={(value) => {
                  setForm({
                    ...form,
                    policy_type: value,
                    config: POLICY_CONFIG_TEMPLATES[value] || {}
                  });
                }}
                options={POLICY_TYPE_OPTIONS}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Policy Name *</label>
                <input
                  value={form.policy_name}
                  onChange={(e) => setForm({ ...form, policy_name: e.target.value })}
                  className="input-base"
                  placeholder={form.policy_type === POLICY_TYPES.ID_CARD ? "e.g., Student ID Card Policy" : "e.g., Staff Payroll Policy"}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent accidental submit when pressing Enter
                      handleNextStep();
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-base min-h-20"
                  placeholder="Brief description of the policy purpose and scope..."
                  rows={3}
                />
              </div>
              <SelectField
                label="Status"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(value) => setForm({ ...form, is_active: value === 'active' })}
                options={[
                  { value: 'active', label: '✅ Active' },
                  { value: 'inactive', label: '⏸️ Inactive' }
                ]}
              />
              {form.policy_type && (
                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                  <p className="text-sm text-foreground">
                    <strong>📋 Next Step:</strong> Configure {POLICY_TYPE_LABELS[form.policy_type]} settings
                  </p>
                </div>
              )}
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="font-semibold text-base">Step 2: Configure {POLICY_TYPE_LABELS[form.policy_type]}</h3>
                <p className="text-xs text-muted-foreground">Set up the specific settings for this policy</p>
              </div>
              {renderConfigForm()}
            </div>
          )}
        </div>
      </AppModal>

      {/* View Modal with Preview for ID Card */}
      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingPolicy(null);
        }}
        title="Policy Details"
        size="lg"
        footer={
          <button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>
            Close
          </button>
        }
      >
        {viewingPolicy && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Policy Name</p>
                <p className="font-medium">{viewingPolicy.policy_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Policy Type</p>
                <p className="font-medium">{POLICY_TYPE_LABELS[viewingPolicy.policy_type]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">v{viewingPolicy.version}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                  viewingPolicy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                )}>
                  {viewingPolicy.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap">{viewingPolicy.description || '—'}</p>
              </div>
            </div>
            {viewingPolicy.policy_type === POLICY_TYPES.ID_CARD && (
              <div className="mt-4">
                <p className="text-muted-foreground mb-2">ID Card Preview</p>
                <IDCardPreview config={viewingPolicy.config} />
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Full Configuration (JSON)</p>
              <pre className="mt-2 rounded-lg bg-muted p-3 text-xs overflow-auto max-h-96">
                {JSON.stringify(viewingPolicy.config, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Confirmation Modal */}
      <AppModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingPolicy(null);
        }}
        title="Delete Policy"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingPolicy(null);
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm">Are you sure you want to delete this policy?</p>
          {deletingPolicy && (
            <p className="text-xs text-muted-foreground">
              "{deletingPolicy.policy_name}" (v{deletingPolicy.version})
            </p>
          )}
          <p className="text-xs text-destructive">This action cannot be undone.</p>
        </div>
      </AppModal>
    </div>
  );
}