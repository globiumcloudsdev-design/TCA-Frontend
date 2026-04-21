// src/components/settings/PolicyManagement.jsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw, QrCode, Settings, Info, User, Users, Palette, Layout, Type } from 'lucide-react';
import { toast } from 'sonner';

import { policyService } from '@/services/policyService';
import { POLICY_TYPES, POLICY_TYPE_LABELS, POLICY_TYPE_ICONS, POLICY_CONFIG_TEMPLATES, getFieldsByCardType } from '@/constants/policy.constants';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import { cn } from '@/lib/utils';
import IDCardViewer from '@/components/common/IDCard';

// ==================== ID CARD PREVIEW ====================
const IDCardPreview = ({ config }) => {
  const cardType = config?.card_type || 'student';
  const layout = config?.layout || 'vertical';
  
  const sampleStudent = {
    full_name: 'Shoaib Raza',
    parent_name: 'Muhammad Nasir',
    roll_number: 'SCH-1234-567',
    class: '10',
    section: 'A',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
  };

  const sampleStaff = {
    full_name: 'Sajood Ali',
    designation: 'Senior Teacher',
    employee_id: 'EMP-2024-001',
    department: 'Science Department',
    blood_group: 'O+',
    valid_upto: '31 Dec 2025',
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          {cardType === 'staff' ? '👨‍🏫 Staff ID Card Preview' : '👨‍🎓 Student ID Card Preview'}
        </h4>
        <span className="text-xs text-muted-foreground">{config?.size || 'CR80'} • {layout}</span>
      </div>

      <IDCardViewer 
        studentData={sampleStudent}
        staffData={sampleStaff}
        policyOverride={{ config, policy_name: 'Preview', version: 1 }}
        hideControls={false}
      />

      {config?.terms_list?.length > 0 && (
        <div className="mt-3 text-center text-[9px] text-muted-foreground bg-amber-50 p-2 rounded-md">
          <Info size={12} className="inline mr-1 text-amber-600" />
          {config.terms_list.length} Terms & Conditions configured
        </div>
      )}
    </div>
  );
};

// ==================== SALARY STRUCTURE EXPLANATION ====================
const SalaryStructureExplanation = ({ config }) => {
  const basicPercentage = config.salary_calculation?.basic_percentage || 50;
  const allowances = config.salary_calculation?.allowances || [];
  const totalAllowancePercentage = allowances.reduce((sum, a) => sum + (a.percentage || 0), 0);

  return (
    <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Settings size={14} /> Salary Calculation</h4>
      <div className="bg-white rounded p-2 text-xs">
        <p><strong>Example:</strong> Total Salary = 50,000</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>Basic ({basicPercentage}%) = {50000 * basicPercentage / 100} Rs</li>
          {allowances.map((a, i) => <li key={i}>{a.name} ({a.percentage}%) = {50000 * a.percentage / 100} Rs</li>)}
          <li className="font-bold mt-1">Total = {basicPercentage + totalAllowancePercentage}% = 50,000 Rs</li>
        </ul>
      </div>
      <p className="text-xs mt-2">💡 Teacher entry time pe sirf <strong>Total Salary</strong> dalni hai. Allowances auto calculate hongy.</p>
    </div>
  );
};

const POLICY_TYPE_OPTIONS = [
  { value: POLICY_TYPES.ID_CARD, label: POLICY_TYPE_LABELS[POLICY_TYPES.ID_CARD] },
  { value: POLICY_TYPES.PAYROLL, label: POLICY_TYPE_LABELS[POLICY_TYPES.PAYROLL] }
];

const CARD_TYPE_OPTIONS = [
  { value: 'staff', label: '👨‍🏫 Staff ID Card' },
  { value: 'student', label: '👨‍🎓 Student ID Card' }
];

const LAYOUT_OPTIONS = [
  { value: 'vertical', label: 'Vertical (Portrait)' },
  { value: 'horizontal', label: 'Horizontal (Landscape)' }
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
  const refreshUserData = useAuthStore((s) => s.refreshUserData);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [policyTypeFilter, setPolicyTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: policiesData, isLoading, refetch } = useQuery({
    queryKey: ['policies', page, pageSize, search, policyTypeFilter, statusFilter],
    queryFn: () => policyService.getAll({ page, limit: pageSize, search: search || undefined, policy_type: policyTypeFilter || undefined, is_active: statusFilter !== '' ? statusFilter === 'active' : undefined, institute_id: institute?.id }),
    enabled: !!institute?.id
  });

  const policies = policiesData?.data || [];
  const total = policiesData?.pagination?.total || 0;
  const totalPages = policiesData?.pagination?.totalPages || 1;

  // Check existence of required policies
  const hasPayrollPolicy = policies.some(p => p.policy_type === POLICY_TYPES.PAYROLL);
  const hasStaffIdPolicy = policies.some(p => p.policy_type === POLICY_TYPES.ID_CARD && p.config?.card_type === 'staff');
  const hasStudentIdPolicy = policies.some(p => p.policy_type === POLICY_TYPES.ID_CARD && p.config?.card_type === 'student');
  const allRequiredExist = hasPayrollPolicy && hasStaffIdPolicy && hasStudentIdPolicy;

  const createMutation = useMutation({ 
    mutationFn: policyService.create, 
    onSuccess: async () => { 
      await queryClient.invalidateQueries(['policies']); 
      await refreshUserData(); // realtime sync
      toast.success('Policy created!'); 
      closeFormModal(); 
    }, 
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed') 
  });
  
  const updateMutation = useMutation({ 
    mutationFn: ({ id, data }) => policyService.update(id, data), 
    onSuccess: async () => { 
      await queryClient.invalidateQueries(['policies']); 
      await refreshUserData();
      toast.success('Policy updated!'); 
      closeFormModal(); 
    }, 
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed') 
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: policyService.delete, 
    onSuccess: async () => { 
      await queryClient.invalidateQueries(['policies']); 
      await refreshUserData();
      toast.success('Policy deleted'); 
      setDeleteModalOpen(false); 
    }, 
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed') 
  });
  
  const toggleStatusMutation = useMutation({ 
    mutationFn: ({ id, isActive }) => policyService.toggleStatus(id, isActive), 
    onSuccess: async (_, { isActive }) => { 
      await queryClient.invalidateQueries(['policies']); 
      await refreshUserData();
      toast.success(`Policy ${isActive ? 'activated' : 'deactivated'}`); 
    }, 
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed') 
  });

  const resetForm = () => { setForm(EMPTY_FORM); setFormStep(1); setEditingPolicy(null); };
  const openAdd = () => { resetForm(); setFormModalOpen(true); };
  const openEdit = (policy) => { setEditingPolicy(policy); setFormStep(1); setForm({ policy_type: policy.policy_type, policy_name: policy.policy_name, description: policy.description || '', config: policy.config, branch_id: policy.branch_id, is_active: policy.is_active }); setFormModalOpen(true); };
  const openView = (policy) => { setViewingPolicy(policy); setViewModalOpen(true); };
  const closeFormModal = () => { setFormModalOpen(false); resetForm(); };
  const handleNextStep = () => { if (!form.policy_type) { toast.error('Select Policy Type'); return; } if (!form.policy_name?.trim()) { toast.error('Enter Policy Name'); return; } setFormStep(2); };
  const handlePrevStep = () => setFormStep(1);
  
  const onSave = (e) => { 
    e.preventDefault(); 
    if (!form.policy_type || !form.policy_name) { toast.error('Fill required fields'); return; }
    
    // Validation: prevent duplicate policy per (type, card_type)
    if (!editingPolicy && form.policy_type === POLICY_TYPES.ID_CARD) {
      const existingSameCardType = policies.find(p => 
        p.policy_type === POLICY_TYPES.ID_CARD && 
        p.config?.card_type === form.config?.card_type
      );
      if (existingSameCardType) {
        toast.error(`A ${form.config?.card_type === 'staff' ? 'Staff' : 'Student'} ID Card policy already exists. Only edit allowed.`);
        return;
      }
    }
    if (!editingPolicy && form.policy_type === POLICY_TYPES.PAYROLL && hasPayrollPolicy) {
      toast.error('A Payroll policy already exists. Only edit allowed.');
      return;
    }
    
    if (editingPolicy) { 
      updateMutation.mutate({ id: editingPolicy.id, data: { policy_name: form.policy_name, description: form.description, config: form.config, branch_id: form.branch_id, is_active: form.is_active } }); 
    } else { 
      createMutation.mutate({ ...form, institute_id: institute?.id, config: form.config || POLICY_CONFIG_TEMPLATES[form.policy_type] || {} }); 
    } 
  };
  
  const onDelete = () => { if (deletingPolicy) deleteMutation.mutate(deletingPolicy.id); };
  const handleToggleStatus = (policy) => toggleStatusMutation.mutate({ id: policy.id, isActive: !policy.is_active });

  // ==================== ID CARD CONFIG FORM ====================
  const renderIDCardConfig = () => {
    const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.ID_CARD];
    const currentCardType = config.card_type || 'student';
    const currentFields = getFieldsByCardType(currentCardType);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Settings */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="text-lg">🎫</span> Card Type</h3>
              <SelectField label="Select Card Type" value={currentCardType} onChange={(v) => setForm({ ...form, config: { ...config, card_type: v } })} options={CARD_TYPE_OPTIONS} />
            </div>

            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Layout size={16} /> Layout Settings</h3>
              <SelectField label="Card Layout" value={config.layout || 'vertical'} onChange={(v) => setForm({ ...form, config: { ...config, layout: v } })} options={LAYOUT_OPTIONS} />
              <SelectField label="Card Size" value={config.size || 'CR80'} onChange={(v) => setForm({ ...form, config: { ...config, size: v } })} options={[{ value: 'CR80', label: 'CR80 (Standard)' }, { value: 'A4', label: 'A4 (Print Friendly)' }]} />
            </div>

            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2">🏫 School Information</h3>
              <input type="text" value={config.school_info?.name || institute?.name || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, name: e.target.value } } })} className="input-base text-sm mb-2" placeholder="School Name" />
              <input type="text" value={config.school_info?.tagline || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, tagline: e.target.value } } })} className="input-base text-sm mb-2" placeholder="Tagline" />
              <input type="text" value={config.school_info?.phone || institute?.phone || ''} onChange={(e) => setForm({ ...form, config: { ...config, school_info: { ...config.school_info, phone: e.target.value } } })} className="input-base text-sm" placeholder="Phone" />
            </div>

            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette size={16} /> Design Settings</h3>
              <div className="space-y-2"><label className="text-sm font-medium">Background Color</label><input type="color" value={config.design?.background_color || '#0f172a'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, background_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="space-y-2 mt-2"><label className="text-sm font-medium">Accent Color</label><input type="color" value={config.design?.accent_color || '#f97316'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, accent_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="space-y-2 mt-2"><label className="text-sm font-medium">Text Color</label><input type="color" value={config.design?.text_color || '#ffffff'} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, text_color: e.target.value } } })} className="input-base h-10" /></div>
              <div className="flex items-center gap-3 mt-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.design?.show_border !== false} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, show_border: e.target.checked } } })} /><span className="text-sm">Show Border</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.design?.card_shadow !== false} onChange={(e) => setForm({ ...form, config: { ...config, design: { ...config.design, card_shadow: e.target.checked } } })} /><span className="text-sm">Card Shadow</span></label>
              </div>
            </div>

            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Type size={16} /> Card Fields</h3>
              <div className="space-y-2">
                {currentFields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.visible !== false} onChange={(e) => { const newFields = [...currentFields]; newFields[idx] = { ...newFields[idx], visible: e.target.checked }; if (currentCardType === 'staff') { setForm({ ...form, config: { ...config, staff_config: { ...config.staff_config, fields: newFields } } }); } else { setForm({ ...form, config: { ...config, student_config: { ...config.student_config, fields: newFields } } }); } }} /><span>{field.label}</span></label>
                    {field.required && <span className="text-xs text-red-500">Required</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b pb-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span>📜</span> Terms & Conditions</h3>
              <div className="space-y-2">
                {(config.terms_list || []).map((term, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea value={term} onChange={(e) => { const newTerms = [...(config.terms_list || [])]; newTerms[idx] = e.target.value; setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="input-base text-sm flex-1" placeholder={`Term ${idx + 1}`} rows={1} />
                    <button type="button" onClick={() => { const newTerms = (config.terms_list || []).filter((_, i) => i !== idx); setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="text-destructive hover:bg-destructive/10 rounded p-1">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => { const newTerms = [...(config.terms_list || []), '']; setForm({ ...form, config: { ...config, terms_list: newTerms } }); }} className="text-xs text-primary hover:underline">+ Add Term</button>
              </div>
            </div>

            {/* Extra Features - QR removed as per requirement (always enabled) */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><QrCode size={14} /> Extra Features</h3>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.show_watermark !== false} onChange={(e) => setForm({ ...form, config: { ...config, show_watermark: e.target.checked } })} /><span>Show Watermark on Card</span></label>
              <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={config.show_photo !== false} onChange={(e) => setForm({ ...form, config: { ...config, show_photo: e.target.checked } })} /><span>Show Photo on Card</span></label>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div><IDCardPreview config={config} /></div>
        </div>
      </div>
    );
  };

  // ==================== PAYROLL CONFIG FORM (Updated with Attendance Rules) ====================
  const renderPayrollConfig = () => {
    const config = form.config || POLICY_CONFIG_TEMPLATES[POLICY_TYPES.PAYROLL];
    return (
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-3">💰 Salary Structure</h3>
          <div><label className="text-sm font-medium">Basic Salary Percentage (%)</label><input type="number" min="0" max="100" value={config.salary_calculation?.basic_percentage || 50} onChange={(e) => { let val = parseInt(e.target.value) || 0; val = Math.max(0, Math.min(100, val)); setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, basic_percentage: val } } }); }} className="input-base mt-1" title="Enter percentage between 0-100" /></div>
          <div className="mt-3"><label className="text-sm font-medium">Percentage Allowances</label>
            {(config.salary_calculation?.allowances || []).map((allowance, idx) => (<div key={idx} className="flex gap-2 mt-2"><input type="text" value={allowance.name} onChange={(e) => { const newAllowances = [...(config.salary_calculation?.allowances || [])]; newAllowances[idx] = { ...newAllowances[idx], name: e.target.value }; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="input-base text-sm flex-1" placeholder="Name" /><input type="number" min="0" max="100" value={allowance.percentage} onChange={(e) => { let val = parseInt(e.target.value) || 0; val = Math.max(0, Math.min(100, val)); const newAllowances = [...(config.salary_calculation?.allowances || [])]; newAllowances[idx] = { ...newAllowances[idx], percentage: val }; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="input-base text-sm w-24" placeholder="0-100%" title="Enter percentage between 0-100" /><button onClick={() => { const newAllowances = (config.salary_calculation?.allowances || []).filter((_, i) => i !== idx); setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="text-destructive">✕</button></div>))}
            <button onClick={() => { const newAllowances = [...(config.salary_calculation?.allowances || []), { name: '', percentage: 0 }]; setForm({ ...form, config: { ...config, salary_calculation: { ...config.salary_calculation, allowances: newAllowances } } }); }} className="text-xs text-primary hover:underline mt-2">+ Add Allowance</button>
          </div>
          <SalaryStructureExplanation config={config} />
        </div>

        {/* Updated Attendance Rules Section */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">⏱️ Attendance & Deduction Rules (As per School Policy)</h3>
          
          {/* Late Arrival */}
          <div className="mb-4 p-3 border rounded-md">
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={config.attendance_rules?.late_arrival?.enabled ?? true} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, late_arrival: { ...config.attendance_rules?.late_arrival, enabled: e.target.checked } } } })} />
              <span>Late Arrival Penalty (3 times late → 1 day salary deduction)</span>
            </label>
            {config.attendance_rules?.late_arrival?.enabled && (
              <div className="ml-6 mt-2 grid grid-cols-2 gap-3">
                <div><label className="text-xs">Threshold Count (times)</label><input type="number" value={config.attendance_rules?.late_arrival?.threshold_count ?? 3} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, late_arrival: { ...config.attendance_rules?.late_arrival, threshold_count: parseInt(e.target.value) || 1 } } } })} className="input-base text-sm" /></div>
                <div><label className="text-xs">Deduction (days)</label><input type="number" value={config.attendance_rules?.late_arrival?.deduction_value ?? 1} step="0.5" onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, late_arrival: { ...config.attendance_rules?.late_arrival, deduction_value: parseFloat(e.target.value) || 0 } } } })} className="input-base text-sm" /></div>
              </div>
            )}
          </div>

          {/* Full Day Absent */}
          <div className="mb-4 p-3 border rounded-md">
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={config.attendance_rules?.full_day_absent?.enabled ?? true} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, full_day_absent: { ...config.attendance_rules?.full_day_absent, enabled: e.target.checked } } } })} />
              <span>Full Day Absent (without approved leave) → Full day salary deduction</span>
            </label>
            {config.attendance_rules?.full_day_absent?.enabled && (
              <div className="ml-6 mt-2"><label className="text-xs">Deduction (days)</label><input type="number" value={config.attendance_rules?.full_day_absent?.deduction_value ?? 1} step="0.5" onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, full_day_absent: { ...config.attendance_rules?.full_day_absent, deduction_value: parseFloat(e.target.value) || 0 } } } })} className="input-base text-sm w-32" /></div>
            )}
          </div>

          {/* Half Day Leave */}
          <div className="mb-4 p-3 border rounded-md">
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={config.attendance_rules?.half_day_absent?.enabled ?? true} onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, half_day_absent: { ...config.attendance_rules?.half_day_absent, enabled: e.target.checked } } } })} />
              <span>Half Day Leave → Half day salary deduction</span>
            </label>
            {config.attendance_rules?.half_day_absent?.enabled && (
              <div className="ml-6 mt-2"><label className="text-xs">Deduction (days)</label><input type="number" value={config.attendance_rules?.half_day_absent?.deduction_value ?? 0.5} step="0.5" onChange={(e) => setForm({ ...form, config: { ...config, attendance_rules: { ...config.attendance_rules, half_day_absent: { ...config.attendance_rules?.half_day_absent, deduction_value: parseFloat(e.target.value) || 0 } } } })} className="input-base text-sm w-32" /></div>
            )}
          </div>
        </div>

        <div><h3 className="font-semibold mb-3">⏰ Overtime</h3>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.overtime?.enabled || false} onChange={(e) => setForm({ ...form, config: { ...config, overtime: { ...config.overtime, enabled: e.target.checked } } })} /><span>Enable Overtime</span></label>
          {config.overtime?.enabled && <div className="ml-6 mt-2"><input type="number" value={config.overtime?.rate_per_hour || 200} onChange={(e) => setForm({ ...form, config: { ...config, overtime: { ...config.overtime, rate_per_hour: parseInt(e.target.value) || 0 } } })} className="input-base w-32" placeholder="Rate per hour" /></div>}
        </div>
      </div>
    );
  };

  const renderConfigForm = () => {
    switch (form.policy_type) {
      case POLICY_TYPES.ID_CARD: return renderIDCardConfig();
      case POLICY_TYPES.PAYROLL: return renderPayrollConfig();
      default: return <p className="text-muted-foreground">Select a policy type to configure</p>;
    }
  };

  const columns = useMemo(() => [
    { accessorKey: 'policy_name', header: 'Policy Name', cell: ({ getValue, row }) => (<div className="flex items-center gap-2"><span className="text-xl">{POLICY_TYPE_ICONS[row.original.policy_type]}</span><div><span className="font-medium">{getValue()}</span>{row.original.description && <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>}</div></div>) },
    { accessorKey: 'policy_type', header: 'Type', cell: ({ getValue, row }) => {
      let displayType = POLICY_TYPE_LABELS[getValue()];
      if (getValue() === POLICY_TYPES.ID_CARD && row.original.config?.card_type) {
        displayType += ` (${row.original.config.card_type === 'staff' ? 'Staff' : 'Student'})`;
      }
      return (<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{displayType}</span>);
    } },
    { accessorKey: 'version', header: 'Version', cell: ({ getValue }) => <span className="text-sm">v{getValue()}</span> },
    { accessorKey: 'is_active', header: 'Status', cell: ({ getValue, row }) => (<div className="flex items-center gap-2"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue() ? 'Active' : 'Inactive'}</span>{canDo('policies.activate') && <button onClick={() => handleToggleStatus(row.original)} className="rounded p-1 hover:bg-accent">{getValue() ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}</button>}</div>) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (<div className="flex items-center gap-1">{canDo('policies.read') && <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent"><Eye size={14} /></button>}{canDo('policies.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent"><Edit size={14} /></button>}{canDo('policies.delete') && <button onClick={() => { setDeletingPolicy(row.original); setDeleteModalOpen(true); }} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>}</div>) }
  ], [canDo]);

  const canReadPolicies = canDo('policies.read');
  const canCreatePolicies = canDo('policies.create');

  if (!canReadPolicies) return <div className="py-20 text-center text-muted-foreground">No permission to view policies.</div>;

  return (
    <div className="space-y-5">
      <PageHeader 
        title="Policy Management" 
        description={`${total} policy records`} 
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>
            {/* Add button hidden when all required policies exist */}
            {canCreatePolicies && !allRequiredExist && (
              <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
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
        onSearch={(v) => { setSearch(v); setPage(1); }} 
        searchPlaceholder="Search policies..." 
        filters={[
          { name: 'policy_type', label: 'Policy Type', value: policyTypeFilter, onChange: (v) => { setPolicyTypeFilter(v); setPage(1); }, options: POLICY_TYPE_OPTIONS }, 
          { name: 'status', label: 'Status', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
        ]} 
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} 
      />

      {/* Add/Edit Modal - same as before but with validation on save */}
      <AppModal open={formModalOpen} onClose={closeFormModal} title={`${editingPolicy ? 'Edit' : 'Create'} ${form.policy_type ? POLICY_TYPE_LABELS[form.policy_type] : 'Policy'}`} size="xl" footer={<div className="flex items-center justify-between w-full">{formStep === 2 && <button onClick={handlePrevStep} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">← Previous</button>}<div className="flex gap-2 ml-auto"><button onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>{formStep === 1 ? <button onClick={handleNextStep} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Next →</button> : <button onClick={onSave} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90" disabled={createMutation.isPending || updateMutation.isPending}>{(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingPolicy ? 'Update' : 'Create')}</button>}</div></div>}>
        <div className="mb-6 flex items-center justify-center gap-4"><div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>1</div><div className={cn('h-1 w-12', formStep >= 2 ? 'bg-primary' : 'bg-muted')} /><div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>2</div></div>
        <div className="space-y-4">
          {formStep === 1 && (<div className="space-y-5"><h3 className="font-semibold text-base">Step 1: Basic Information</h3><SelectField label="Policy Type *" value={form.policy_type} onChange={(value) => { setForm({ ...form, policy_type: value, config: POLICY_CONFIG_TEMPLATES[value] || {} }); }} options={POLICY_TYPE_OPTIONS} required /><div className="space-y-1.5"><label className="text-sm font-medium">Policy Name *</label><input value={form.policy_name} onChange={(e) => setForm({ ...form, policy_name: e.target.value })} className="input-base" placeholder="e.g., Student ID Card Policy" /></div><div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base min-h-20" placeholder="Brief description..." rows={3} /></div><SelectField label="Status" value={form.is_active ? 'active' : 'inactive'} onChange={(value) => setForm({ ...form, is_active: value === 'active' })} options={[{ value: 'active', label: '✅ Active' }, { value: 'inactive', label: '⏸️ Inactive' }]} /></div>)}
          {formStep === 2 && (<div className="space-y-5"><div><h3 className="font-semibold text-base">Step 2: Configure {POLICY_TYPE_LABELS[form.policy_type]}</h3><p className="text-xs text-muted-foreground">Set up the specific settings for this policy</p></div>{renderConfigForm()}</div>)}
        </div>
      </AppModal>

      {/* View Modal - unchanged */}
      <AppModal open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewingPolicy(null); }} title="Policy Details" size="xl" footer={<button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>Close</button>}>
        {viewingPolicy && (<div className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><p className="text-muted-foreground">Policy Name</p><p className="font-medium">{viewingPolicy.policy_name}</p></div><div><p className="text-muted-foreground">Policy Type</p><p className="font-medium">{POLICY_TYPE_LABELS[viewingPolicy.policy_type]}</p></div><div><p className="text-muted-foreground">Version</p><p className="font-medium">v{viewingPolicy.version}</p></div><div><p className="text-muted-foreground">Status</p><span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', viewingPolicy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{viewingPolicy.is_active ? 'Active' : 'Inactive'}</span></div><div className="sm:col-span-2"><p className="text-muted-foreground">Description</p><p className="whitespace-pre-wrap">{viewingPolicy.description || '—'}</p></div></div>{viewingPolicy.policy_type === POLICY_TYPES.ID_CARD && <div><p className="text-muted-foreground mb-2">ID Card Preview</p><IDCardPreview config={viewingPolicy.config} /></div>}{viewingPolicy.policy_type === POLICY_TYPES.PAYROLL && <SalaryStructureExplanation config={viewingPolicy.config} />}<div><p className="text-muted-foreground">Full Configuration (JSON)</p><pre className="mt-2 rounded-lg bg-muted p-3 text-xs overflow-auto max-h-96">{JSON.stringify(viewingPolicy.config, null, 2)}</pre></div></div>)}
      </AppModal>

      {/* Delete Modal */}
      <AppModal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeletingPolicy(null); }} title="Delete Policy" size="sm" footer={<><button onClick={() => { setDeleteModalOpen(false); setDeletingPolicy(null); }} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button onClick={onDelete} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90" disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}</button></>}>
        <div className="space-y-2"><p className="text-sm">Are you sure you want to delete this policy?</p>{deletingPolicy && <p className="text-xs text-muted-foreground">"{deletingPolicy.policy_name}" (v{deletingPolicy.version})</p>}<p className="text-xs text-destructive">This action cannot be undone.</p></div>
      </AppModal>
    </div>
  );
}