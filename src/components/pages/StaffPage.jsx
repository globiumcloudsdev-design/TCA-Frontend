'use client';

/**
 * Staff Management Page
 * 
 * Complete CRUD for staff members with teacher-like fields
 * Permissions are loaded from institute's assigned role
 * Button visibility controlled by canDo() - NO backend restrictions
 */

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Plus, Pencil, Trash2, Users, UserCog, Mail, Phone,
    Loader2, RefreshCw, Upload, X, Calendar, Briefcase,
    GraduationCap, Banknote, MapPin, FileText, Shield, IdCard
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { staffService } from '@/services/staffService';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import InputField from '@/components/common/InputField';
import PhoneInputField from '@/components/common/PhoneInput';
import CnicInput from '@/components/common/CnicInput';
import SwitchField from '@/components/common/SwitchField';
import StatsCard from '@/components/common/StatsCard';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DatePickerField, TextareaField } from '../common';
import { GENDER_OPTIONS, RELATIONSHIP_OPTIONS, BLOOD_GROUP_OPTIONS, RELIGION_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, DOCUMENT_TYPES, STAFF_TYPES, STATUS_OPTS } from '@/constants';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// Status colors
const STATUS_COLORS = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200'
};

// Validation schema (same as Teacher but with staff_type)
const staffSchema = z.object({
    // Personal Info
    first_name: z.string().min(2, 'First name required'),
    last_name: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email required').optional().or(z.literal('')),
    phone: z.string().optional(),
    alternate_phone: z.string().optional(),

    // Identity
    employee_id: z.string().optional(),
    cnic: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    blood_group: z.string().optional(),
    religion: z.string().optional(),
    nationality: z.string().default('Pakistani'),

    // Address
    present_address: z.string().optional(),
    permanent_address: z.string().optional(),
    city: z.string().optional(),

    // Professional
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experience_years: z.string().optional(),
    previous_institution: z.string().optional(),

    // Employment
    staff_type: z.string().min(1, 'Staff type required'),
    designation: z.string().optional(),
    department: z.string().optional(),
    employment_type: z.string().optional(),
    joining_date: z.string().optional(),
    contract_start_date: z.string().optional(),
    contract_end_date: z.string().optional(),
    salary: z.string().optional(),

    // Bank
    bank_name: z.string().optional(),
    bank_account_no: z.string().optional(),
    bank_branch: z.string().optional(),

    // Emergency Contact
    emergency_contact_name: z.string().optional(),
    emergency_contact_relation: z.string().optional(),
    emergency_contact_phone: z.string().optional(),

    // Status
    is_active: z.boolean().default(true),

    // Password (for new accounts)
    password: z.string().optional(),

    // Permissions
    permissions: z.array(z.string()).default([]),

    // Documents
    documents: z.array(z.object({
        id: z.string().optional(),
        type: z.string().min(1, 'Document type required'),
        customType: z.string().optional(),
        title: z.string().min(1, 'Document title required'),
        file: z.any().optional(),
        file_url: z.string().optional(),
        file_name: z.string().optional(),
        verified: z.boolean().default(false),
    })).default([]),
});

// Status Badge Component
function StatusBadge({ status }) {
    return (
        <span className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
            STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
        )}>
            {status}
        </span>
    );
}

// Permission Checkbox Component
function PermissionCheckbox({ label, code, checked, onChange, disabled }) {
    return (
        <label className={cn(
            "flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
        )}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(code, e.target.checked)}
                disabled={disabled}
                className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{label}</span>
            <span className="text-xs text-muted-foreground ml-auto font-mono">{code}</span>
        </label>
    );
}

export default function StaffManagementPage({ instituteType }) {
    const qc = useQueryClient();
    const canDo = useAuthStore((s) => s.canDo);
    const user = useAuthStore((s) => s.user);

    // State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingStaff, setDeletingStaff] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [activeTab, setActiveTab] = useState('personal');
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [showCustomType, setShowCustomType] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    // Permissions state
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [useCustomPermissions, setUseCustomPermissions] = useState(false);

    // Check permissions for buttons
    const canCreate = canDo('staff.create') || canDo('users.create') || user?.user_type === 'MASTER_ADMIN';
    const canUpdate = canDo('staff.update') || canDo('users.update') || user?.user_type === 'MASTER_ADMIN';
    const canDelete = canDo('staff.delete') || canDo('users.delete') || user?.user_type === 'MASTER_ADMIN';

    const resolveCardRole = (staffMember) => {
        const typeValue = String(staffMember?.staff_type || '').toLowerCase();
        if (typeValue.includes('admin')) return 'admin';
        return 'staff';
    };

    // Fetch staff members
    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['staff', page, pageSize, search, statusFilter, typeFilter],
        queryFn: () => staffService.getAll({
            page,
            limit: pageSize,
            search: search || undefined,
            is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
            staff_type: typeFilter || undefined
        }),
    });

    const staffMembers = data?.data ?? [];
    const total = data?.pagination.total ?? 0;
    const totalPages = data?.pagination?.totalPages ?? 1;
    const availableRoles = user?.permissions ?? [];

    // Get default permissions - ALL permissions from institute role
    const getDefaultPermissions = (staffType) => {
        // Sirf permissions return karo, bina staff type filter ke
        return availableRoles || [];  // ✅ Saari permissions
    };

    // Transform API data to form structure
    const transformStaffData = (data) => {
        if (!data) return {};

        const staffDetails = data.details || {};

        return {
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            alternate_phone: staffDetails.alternate_phone || '',
            employee_id: staffDetails.employee_id || '',
            cnic: staffDetails.cnic || '',
            dob: staffDetails.dob || '',
            gender: staffDetails.gender || '',
            blood_group: staffDetails.blood_group || '',
            religion: staffDetails.religion || '',
            nationality: staffDetails.nationality || 'Pakistani',
            present_address: staffDetails.present_address || '',
            permanent_address: staffDetails.permanent_address || '',
            city: staffDetails.city || '',
            qualification: staffDetails.qualification || '',
            specialization: staffDetails.specialization || '',
            experience_years: staffDetails.experience_years || '',
            previous_institution: staffDetails.previous_institution || '',
            staff_type: data.staff_type || '',
            designation: staffDetails.designation || '',
            department: staffDetails.department || '',
            employment_type: staffDetails.employment_type || '',
            joining_date: staffDetails.joining_date || '',
            contract_start_date: staffDetails.contract_start_date || '',
            contract_end_date: staffDetails.contract_end_date || '',
            salary: staffDetails.salary ? String(staffDetails.salary) : '',
            bank_name: staffDetails.bank_name || '',
            bank_account_no: staffDetails.bank_account_no || '',
            bank_branch: staffDetails.bank_branch || '',
            emergency_contact_name: staffDetails.emergency_contact_name || '',
            emergency_contact_relation: staffDetails.emergency_contact_relation || '',
            emergency_contact_phone: staffDetails.emergency_contact_phone || '',
            is_active: data.is_active !== false,
            permissions: data.permissions || [],
            documents: data.documents || [],
        };
    };

    // Form setup
    const { register, handleSubmit, control, reset, watch, setValue, getValues, formState: { errors } } = useForm({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            is_active: true,
            staff_type: '',
            nationality: 'Pakistani',
            permissions: [],
            documents: [],
        }
    });

    const selectedStaffType = watch('staff_type');
    const watchDocuments = watch('documents');

    // Update permissions when staff type changes (if not using custom)
    useEffect(() => {
        if (selectedStaffType && !useCustomPermissions && !editingStaff) {
            const defaultPerms = getDefaultPermissions(selectedStaffType);
            setSelectedPermissions(defaultPerms);
            setValue('permissions', defaultPerms);
        }
    }, [selectedStaffType, useCustomPermissions, editingStaff]);

    // Reset form when modal opens
    useEffect(() => {
        if (modalOpen) {
            if (editingStaff) {
                const formData = transformStaffData(editingStaff);
                reset(formData);
                setSelectedPermissions(editingStaff.permissions || []);
                setAvatarPreview(editingStaff.avatar_url || '');

                // Check if permissions match default
                const defaultPerms = getDefaultPermissions(editingStaff.staff_type);
                const isCustom = JSON.stringify(editingStaff.permissions) !== JSON.stringify(defaultPerms);
                setUseCustomPermissions(isCustom);
            } else {
                reset({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    alternate_phone: '',
                    employee_id: '',
                    cnic: '',
                    dob: '',
                    gender: '',
                    blood_group: '',
                    religion: '',
                    nationality: 'Pakistani',
                    present_address: '',
                    permanent_address: '',
                    city: '',
                    qualification: '',
                    specialization: '',
                    experience_years: '',
                    previous_institution: '',
                    staff_type: '',
                    designation: '',
                    department: '',
                    employment_type: '',
                    joining_date: '',
                    contract_start_date: '',
                    contract_end_date: '',
                    salary: '',
                    bank_name: '',
                    bank_account_no: '',
                    bank_branch: '',
                    emergency_contact_name: '',
                    emergency_contact_relation: '',
                    emergency_contact_phone: '',
                    is_active: true,
                    password: '',
                    permissions: [],
                    documents: [],
                });
                setSelectedPermissions([]);
                setAvatarPreview('');
                setUseCustomPermissions(false);
            }
            setAvatarFile(null);
            setActiveTab('personal');
            setUploadingFiles({});
            setShowCustomType({});
        }
    }, [modalOpen, editingStaff]);

    // Check mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle permission toggle
    const handlePermissionToggle = (code, checked) => {
        let newPermissions;
        if (checked) {
            newPermissions = [...selectedPermissions, code];
        } else {
            newPermissions = selectedPermissions.filter(p => p !== code);
        }
        setSelectedPermissions(newPermissions);
        setValue('permissions', newPermissions);
    };

    // Select all permissions
    const handleSelectAll = () => {
        if (availableRoles.length > 0 && selectedStaffType) {
            const role = availableRoles.find(r => r.type === selectedStaffType);
            if (role) {
                setSelectedPermissions(role.permissions);
                setValue('permissions', role.permissions);
            }
        }
    };

    // Clear all permissions
    const handleClearAll = () => {
        setSelectedPermissions([]);
        setValue('permissions', []);
    };

    // Handle document upload
    const handleDocumentUpload = (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_BYTES) {
            toast.error(`File size must be less than ${MAX_FILE_MB}MB`);
            return;
        }

        const currentDocs = getValues('documents') || [];
        const updatedDocs = [...currentDocs];

        if (updatedDocs[index]) {
            updatedDocs[index] = {
                ...updatedDocs[index],
                file: file,
                file_name: file.name,
                title: updatedDocs[index].title || file.name,
            };
        }

        setValue('documents', updatedDocs);
        setUploadingFiles(prev => ({ ...prev, [index]: file.name }));
    };

    // Add new document
    const addDocument = () => {
        const currentDocs = getValues('documents') || [];
        setValue('documents', [...currentDocs, { type: '', title: '', verified: false }]);
    };

    // Remove document
    const removeDocument = (index) => {
        const currentDocs = getValues('documents') || [];
        setValue('documents', currentDocs.filter((_, i) => i !== index));
        setUploadingFiles(prev => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
        });
    };

    // Handle document type change
    const handleDocumentTypeChange = (index, value) => {
        const currentDocs = getValues('documents') || [];
        const updatedDocs = [...currentDocs];
        if (!updatedDocs[index]) updatedDocs[index] = {};
        updatedDocs[index].type = value;
        setValue('documents', updatedDocs);

        setShowCustomType(prev => ({ ...prev, [index]: value === 'other' }));
    };

    // Navigation for mobile
    const nextTab = () => {
        const tabs = ['personal', 'employment', 'permissions', 'documents'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
    };

    const prevTab = () => {
        const tabs = ['personal', 'employment', 'permissions', 'documents'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => staffService.create(data),
        onSuccess: () => {
            toast.success('Staff member created successfully');
            qc.invalidateQueries({ queryKey: ['staff'] });
            setModalOpen(false);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create staff');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => staffService.update(id, data),
        onSuccess: () => {
            toast.success('Staff member updated successfully');
            qc.invalidateQueries({ queryKey: ['staff'] });
            setModalOpen(false);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update staff');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => staffService.delete(id),
        onSuccess: () => {
            toast.success('Staff member deleted');
            qc.invalidateQueries({ queryKey: ['staff'] });
            setDeletingStaff(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete staff');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, is_active }) => staffService.toggleStatus(id, is_active),
        onSuccess: () => {
            toast.success('Status updated');
            qc.invalidateQueries({ queryKey: ['staff'] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update status');
        }
    });

    // Handle form submit
    const onSubmit = (formData) => {
        // Prepare staff details object
        const staffDetails = {
            employee_id: formData.employee_id,
            cnic: formData.cnic,
            dob: formData.dob,
            gender: formData.gender,
            blood_group: formData.blood_group,
            religion: formData.religion,
            nationality: formData.nationality,
            present_address: formData.present_address,
            permanent_address: formData.permanent_address,
            city: formData.city,
            alternate_phone: formData.alternate_phone,
            qualification: formData.qualification,
            specialization: formData.specialization,
            experience_years: formData.experience_years,
            previous_institution: formData.previous_institution,
            designation: formData.designation,
            department: formData.department,
            employment_type: formData.employment_type,
            joining_date: formData.joining_date,
            contract_start_date: formData.contract_start_date,
            contract_end_date: formData.contract_end_date,
            salary: formData.salary ? Number(formData.salary) : null,
            bank_name: formData.bank_name,
            bank_account_no: formData.bank_account_no,
            bank_branch: formData.bank_branch,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_relation: formData.emergency_contact_relation,
            emergency_contact_phone: formData.emergency_contact_phone,
        };

        // Prepare documents
        const formattedDocuments = (formData.documents || []).map(doc => ({
            ...doc,
            type: doc.type === 'other' ? doc.customType : doc.type,
            customType: undefined,
            file: undefined,
        }));

        // Prepare submit data
        const submitData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            staff_type: formData.staff_type,
            is_active: formData.is_active,
            password: formData.password,
            permissions: selectedPermissions,
            staff_details: staffDetails,
            documents: formattedDocuments,
        };

        // Remove empty password
        if (!submitData.password) {
            delete submitData.password;
        }

        // Handle file upload
        if (avatarFile || formData.documents?.some(d => d.file)) {
            const fd = new FormData();

            // Add avatar
            if (avatarFile) {
                fd.append('avatar', avatarFile);
            }

            // Separate docs with new file attachments from already-saved docs
            const docsWithFiles = (formData.documents || []).filter(doc => doc.file instanceof File);
            const savedDocs = formattedDocuments.filter((_, idx) => !(formData.documents?.[idx]?.file instanceof File));

            // Metadata for new docs (type, title) so backend can enrich the upload result
            const newDocsMeta = docsWithFiles.map(doc => ({
                type: doc.type === 'other' ? doc.customType : doc.type,
                title: doc.title,
                file_name: doc.file.name,
                verified: doc.verified || false,
            }));

            // Add all scalar/JSON fields — skip 'documents', handled below
            Object.entries(submitData).forEach(([k, v]) => {
                if (k === 'documents') return;
                if (v !== undefined && v !== null && v !== '') {
                    if (k === 'staff_details' || k === 'permissions') {
                        fd.append(k, JSON.stringify(v));
                    } else {
                        fd.append(k, String(v));
                    }
                }
            });

            // Send existing saved docs as JSON metadata
            fd.append('documents', JSON.stringify(savedDocs));

            // Send new doc metadata so backend can merge type/title with upload results
            if (newDocsMeta.length > 0) {
                fd.append('new_documents_meta', JSON.stringify(newDocsMeta));
            }

            // Append actual files under 'documents' field (multer.fields accepts up to 10)
            docsWithFiles.forEach((doc) => {
                fd.append('documents', doc.file, doc.file.name);
            });

            if (editingStaff) {
                updateMutation.mutate({ id: editingStaff.id, data: fd });
            } else {
                createMutation.mutate(fd);
            }
        } else {
            if (editingStaff) {
                updateMutation.mutate({ id: editingStaff.id, data: submitData });
            } else {
                createMutation.mutate(submitData);
            }
        }
    };

    // Handle avatar change
    const handleAvatarChange = (files) => {
        if (!files?.length) return;
        if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
        const file = files[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Table columns
    const columns = useMemo(() => [
        {
            id: 'name',
            accessorFn: (row) =>            // ← yeh add karo
                `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            header: 'Staff Member',
            cell: ({ row }) => {
                const s = row.original;
                return (
                    <div className="flex items-center gap-2.5">
                        {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.first_name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                {s.first_name?.[0]}{s.last_name?.[0]}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{s.first_name} {s.last_name}</p>
                            <p className="text-xs text-muted-foreground">{s.staff_type}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            cell: ({ row }) => (
                <div>
                    <p className="text-xs flex items-center gap-1"><Mail size={10} /> {row.original.email || '—'}</p>
                    <p className="text-xs flex items-center gap-1 mt-1"><Phone size={10} /> {row.original.phone || '—'}</p>
                </div>
            ),
        },
        {
            accessorKey: 'details.employee_id',
            header: 'Employee ID',
            cell: ({ row }) => row.original.details?.employee_id || '—',
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({ row }) => {
                const perms = row.original.permissions || [];
                return (
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">
                        {perms.length} permissions
                    </span>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const s = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                            <button
                                onClick={() => {
                                    setEditingStaff(s);
                                    setModalOpen(true);
                                }}
                                className="rounded p-1.5 hover:bg-accent"
                                title="Edit"
                            >
                                <Pencil size={13} />
                            </button>
                        )}
                        {canUpdate && (
                            <button
                                onClick={() => toggleStatusMutation.mutate({ id: s.id, is_active: !s.is_active })}
                                className="rounded p-1.5 hover:bg-accent"
                                title={s.is_active ? 'Deactivate' : 'Activate'}
                            >
                                <UserCog size={13} />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => setDeletingStaff(s)}
                                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                                title="Delete"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                        {(canDo('staff.read') || canDo('users.read')) && (
                            <button
                                onClick={() => generateAndDownloadIdCard({
                                    role: resolveCardRole(s),
                                    person: s,
                                    institute: user?.institute || user?.school || {}
                                })}
                                className="rounded p-1.5 hover:bg-accent"
                                title="Generate ID Card"
                            >
                                <IdCard size={13} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ], [canUpdate, canDelete, canDo, user]);

    // Stats
    const activeCount = staffMembers.filter(s => s.is_active).length;

    // Get current role permissions for selected staff type
    const currentRole = availableRoles.find(r => r.type === selectedStaffType);
    const availablePermissions = availableRoles || [];

    return (
        <div className="space-y-5">
            <PageHeader
                title={`${instituteType ? instituteType.charAt(0).toUpperCase() + instituteType.slice(1) : ''} Staff Management`}
                description={`${total} staff members`}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCw size={13} className={cn('mr-1', isFetching && 'animate-spin')} /> Refresh
                        </Button>
                        {canCreate && (
                            <Button onClick={() => {
                                setEditingStaff(null);
                                setModalOpen(true);
                            }} className="gap-1.5">
                                <Plus size={15} /> Add Staff
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard label="Total Staff" value={total} icon={<Users size={18} />} />
                <StatsCard label="Active" value={activeCount} icon={<UserCog size={18} />} />
                <StatsCard label="Inactive" value={total - activeCount} icon={<UserCog size={18} />} />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={staffMembers}
                loading={isLoading}
                emptyMessage="No staff members found"
                search={search}
                enableColumnVisibility
                exportConfig={{
                    fileName: 'staff-members',
                    dateField: 'created_at'
                }}
                onSearch={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Search by name, email, phone..."
                filters={[
                    {
                        name: 'status',
                        label: 'Status',
                        value: statusFilter,
                        onChange: (v) => { setStatusFilter(v); setPage(1); },
                        options: STATUS_OPTS,
                    },
                    {
                        name: 'type',
                        label: 'Staff Type',
                        value: typeFilter,
                        onChange: (v) => { setTypeFilter(v); setPage(1); },
                        options: STAFF_TYPES.map(t => ({ value: t, label: t })),
                    },
                ]}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage,
                    total,
                    pageSize,
                    onPageSizeChange: (s) => { setPageSize(s); setPage(1); }
                }}
            />

            {/* Create/Edit Modal - Full Teacher-like Form with Permissions Tab */}
            <AppModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                size="xl"
                className="max-w-6xl"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        {activeTab !== 'personal' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevTab}
                            >
                                Previous
                            </Button>
                        )}
                        {activeTab !== 'documents' ? (
                            <Button
                                type="button"
                                onClick={nextTab}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                form="staff-form"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <Loader2 size={14} className="animate-spin mr-1" />
                                ) : null}
                                {editingStaff ? 'Update' : 'Add Staff'}
                            </Button>
                        )}
                    </div>
                }
            >
                <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tabs List */}
                        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-4'} mb-4 sm:mb-6`}>
                                <TabsTrigger value="personal" className="gap-2">
                                    <UserCog size={14} />
                                    <span className="hidden sm:inline">Personal</span>
                                </TabsTrigger>
                                <TabsTrigger value="employment" className="gap-2">
                                    <Briefcase size={14} />
                                    <span className="hidden sm:inline">Employment</span>
                                </TabsTrigger>
                                <TabsTrigger value="permissions" className="gap-2">
                                    <Shield size={14} />
                                    <span className="hidden sm:inline">Permissions</span>
                                    {selectedPermissions.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {selectedPermissions.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="gap-2">
                                    <FileText size={14} />
                                    <span className="hidden sm:inline">Documents</span>
                                    {watchDocuments?.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {watchDocuments.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Mobile Navigation */}
                        {isMobile && (
                            <div className="flex items-center justify-between mb-4">
                                <Button type="button" variant="outline" size="sm" onClick={prevTab} disabled={activeTab === 'personal'}>
                                    Previous
                                </Button>
                                <span className="text-sm font-medium capitalize">{activeTab}</span>
                                <Button type="button" variant="outline" size="sm" onClick={nextTab} disabled={activeTab === 'documents'}>
                                    Next
                                </Button>
                            </div>
                        )}

                        {/* Tab 1: Personal Information (Same as Teacher) */}
                        <TabsContent value="personal">
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Personal Information</h3>

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <InputField
                                                label="First Name *"
                                                name="first_name"
                                                register={register}
                                                error={errors.first_name}
                                                required
                                                placeholder="John"
                                            />

                                            <InputField
                                                label="Last Name *"
                                                name="last_name"
                                                register={register}
                                                error={errors.last_name}
                                                required
                                                placeholder="Doe"
                                            />

                                            <InputField
                                                label="Employee ID"
                                                name="employee_id"
                                                register={register}
                                                error={errors.employee_id}
                                                placeholder="EMP-2024-001"
                                            />

                                            <DatePickerField
                                                label="Date of Birth"
                                                name="dob"
                                                control={control}
                                                error={errors.dob}
                                            />

                                            <SelectField
                                                label="Gender"
                                                name="gender"
                                                control={control}
                                                error={errors.gender}
                                                options={GENDER_OPTIONS}
                                                placeholder="Select gender"
                                            />

                                            <SelectField
                                                label="Blood Group"
                                                name="blood_group"
                                                control={control}
                                                error={errors.blood_group}
                                                options={BLOOD_GROUP_OPTIONS}
                                                placeholder="Select"
                                            />

                                            <SelectField
                                                label="Religion"
                                                name="religion"
                                                control={control}
                                                error={errors.religion}
                                                options={RELIGION_OPTIONS}
                                                placeholder="Select"
                                            />

                                            <CnicInput
                                                label="CNIC / B-Form"
                                                value={watch('cnic') || ''}
                                                onChange={val => setValue('cnic', val)}
                                                error={errors.cnic}
                                            />
                                        </div>

                                        <Separator />

                                        <h3 className="text-lg font-semibold">Contact Information</h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <InputField
                                                label="Email"
                                                name="email"
                                                register={register}
                                                error={errors.email}
                                                type="email"
                                                placeholder="john@institute.com"
                                            />

                                            <PhoneInputField
                                                label="Phone Number"
                                                value={watch('phone') || ''}
                                                onChange={val => setValue('phone', val)}
                                                error={errors.phone}
                                            />

                                            <PhoneInputField
                                                label="Alternate Phone"
                                                value={watch('alternate_phone') || ''}
                                                onChange={val => setValue('alternate_phone', val)}
                                                error={errors.alternate_phone}
                                            />

                                            <InputField
                                                label="City"
                                                name="city"
                                                register={register}
                                                error={errors.city}
                                                placeholder="Karachi"
                                            />
                                        </div>

                                        <TextareaField
                                            label="Present Address"
                                            name="present_address"
                                            register={register}
                                            error={errors.present_address}
                                            placeholder="Full residential address"
                                            rows={2}
                                        />

                                        <TextareaField
                                            label="Permanent Address"
                                            name="permanent_address"
                                            register={register}
                                            error={errors.permanent_address}
                                            placeholder="If different from present address"
                                            rows={2}
                                        />

                                        <Separator />

                                        <h3 className="text-lg font-semibold">Emergency Contact</h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <InputField
                                                label="Contact Person"
                                                name="emergency_contact_name"
                                                register={register}
                                                error={errors.emergency_contact_name}
                                                placeholder="Kamran Khan"
                                            />

                                            <SelectField
                                                label="Relation"
                                                name="emergency_contact_relation"
                                                control={control}
                                                error={errors.emergency_contact_relation}
                                                options={RELATIONSHIP_OPTIONS}
                                                placeholder="Select"
                                            />

                                            <PhoneInputField
                                                label="Emergency Contact Phone"
                                                value={watch('emergency_contact_phone') || ''}
                                                onChange={val => setValue('emergency_contact_phone', val)}
                                                error={errors.emergency_contact_phone}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2: Employment Information (Same as Teacher) */}
                        <TabsContent value="employment">
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Staff Details</h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <SelectField
                                                label="Staff Type *"
                                                name="staff_type"
                                                control={control}
                                                error={errors.staff_type}
                                                options={STAFF_TYPES.map(t => ({ value: t, label: t }))}
                                                placeholder="Select staff type"
                                                required
                                            />

                                            <InputField
                                                label="Designation"
                                                name="designation"
                                                register={register}
                                                error={errors.designation}
                                                placeholder="e.g. Senior Accountant"
                                            />

                                            <SelectField
                                                label="Employment Type"
                                                name="employment_type"
                                                control={control}
                                                error={errors.employment_type}
                                                options={EMPLOYMENT_TYPE_OPTIONS}
                                                placeholder="Select type"
                                            />

                                            <DatePickerField
                                                label="Joining Date"
                                                name="joining_date"
                                                control={control}
                                                error={errors.joining_date}
                                            />

                                            <DatePickerField
                                                label="Contract Start"
                                                name="contract_start_date"
                                                control={control}
                                                error={errors.contract_start_date}
                                            />

                                            <DatePickerField
                                                label="Contract End"
                                                name="contract_end_date"
                                                control={control}
                                                error={errors.contract_end_date}
                                            />

                                            <InputField
                                                label="Monthly Salary (PKR)"
                                                name="salary"
                                                register={register}
                                                error={errors.salary}
                                                type="number"
                                                placeholder="50000"
                                            />
                                        </div>

                                        <Separator />

                                        <h3 className="text-lg font-semibold">Bank Details</h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <InputField
                                                label="Bank Name"
                                                name="bank_name"
                                                register={register}
                                                error={errors.bank_name}
                                                placeholder="e.g. HBL"
                                            />

                                            <InputField
                                                label="Account Number"
                                                name="bank_account_no"
                                                register={register}
                                                error={errors.bank_account_no}
                                                placeholder="1234567890"
                                            />

                                            <InputField
                                                label="Branch"
                                                name="bank_branch"
                                                register={register}
                                                error={errors.bank_branch}
                                                placeholder="Main Branch"
                                            />
                                        </div>

                                        {!editingStaff && (
                                            <>
                                                <Separator />
                                                <h3 className="text-lg font-semibold">Account Access</h3>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <InputField
                                                        label="Password (Leave empty to auto-generate)"
                                                        name="password"
                                                        register={register}
                                                        error={errors.password}
                                                        type="password"
                                                        placeholder="Enter password or leave blank"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Status */}
                                        <Separator />
                                        <div className="flex items-center space-x-2">
                                            <SwitchField
                                                label="Active"
                                                name="is_active"
                                                control={control}
                                                hint="Inactive users cannot login"
                                            />
                                        </div>

                                        {/* Avatar Upload */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Profile Picture</label>
                                            <div className="flex items-center gap-4">
                                                {avatarPreview && (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Preview"
                                                        className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                                                    />
                                                )}
                                                <FileUpload
                                                    accept="image/*"
                                                    maxSize={2 * 1024 * 1024}
                                                    onChange={handleAvatarChange}
                                                    onError={(msg) => toast.error(msg)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3: Permissions */}
                        <TabsContent value="permissions">
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Staff Permissions</h3>
                                            {selectedStaffType && (
                                                <Badge variant="outline" className="text-sm">
                                                    Role: {selectedStaffType}
                                                </Badge>
                                            )}
                                        </div>

                                        {!selectedStaffType ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">Please select Staff Type first</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Go to Employment tab and select Staff Type
                                                </p>
                                            </div>
                                        ) : availablePermissions.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No permissions defined for {selectedStaffType}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Contact admin to configure role permissions
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Custom permissions toggle */}
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={useCustomPermissions}
                                                            onChange={(e) => {
                                                                setUseCustomPermissions(e.target.checked);
                                                                if (!e.target.checked && selectedStaffType) {
                                                                    const defaultPerms = getDefaultPermissions(selectedStaffType);
                                                                    setSelectedPermissions(defaultPerms);
                                                                    setValue('permissions', defaultPerms);
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-sm font-medium">Customize permissions</span>
                                                    </label>

                                                    {useCustomPermissions && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                Select All
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleClearAll}
                                                            >
                                                                Clear All
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Permissions count */}
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {selectedPermissions.length} of {availablePermissions.length} selected
                                                    </Badge>
                                                    {!useCustomPermissions && (
                                                        <Badge variant="outline" className="text-primary">
                                                            Using default permissions
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Permissions list */}
                                                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                                                    {availablePermissions.map((perm) => (
                                                        <PermissionCheckbox
                                                            key={perm}
                                                            label={perm.split('.').join(' ').replace(/_/g, ' ')}
                                                            code={perm}
                                                            checked={selectedPermissions.includes(perm)}
                                                            onChange={handlePermissionToggle}
                                                            disabled={!useCustomPermissions}
                                                        />
                                                    ))}
                                                </div>

                                                <p className="text-xs text-muted-foreground">
                                                    {useCustomPermissions
                                                        ? `You can customize permissions for this staff member`
                                                        : `Using default permissions for ${selectedStaffType}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 4: Documents (Same as Teacher) */}
                        <TabsContent value="documents">
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Documents</h3>
                                            <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Document
                                            </Button>
                                        </div>

                                        {watchDocuments?.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No documents added yet</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Click "Add Document" to upload files
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {watchDocuments.map((doc, index) => (
                                                    <div key={index} className="border rounded-lg p-4">
                                                        <div className="flex justify-between mb-3">
                                                            <h4 className="font-medium">Document {index + 1}</h4>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-destructive"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            <div>
                                                                <SelectField
                                                                    label="Document Type *"
                                                                    name={`documents.${index}.type`}
                                                                    control={control}
                                                                    error={errors.documents?.[index]?.type}
                                                                    options={DOCUMENT_TYPES}
                                                                    placeholder="Select type"
                                                                    onChange={(value) => handleDocumentTypeChange(index, value)}
                                                                    required
                                                                />

                                                                {showCustomType[index] && (
                                                                    <div className="mt-2">
                                                                        <InputField
                                                                            label="Specify Document Type"
                                                                            name={`documents.${index}.customType`}
                                                                            register={register}
                                                                            error={errors.documents?.[index]?.customType}
                                                                            placeholder="e.g. Training Certificate"
                                                                            required
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <InputField
                                                                label="Document Title *"
                                                                name={`documents.${index}.title`}
                                                                register={register}
                                                                error={errors.documents?.[index]?.title}
                                                                placeholder="e.g. CNIC, Degree"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="mt-3">
                                                            <Label>Upload File (Max {MAX_FILE_MB}MB)</Label>

                                                            {doc.file_url && !uploadingFiles[index] && (
                                                                <div className="flex items-center gap-2 text-sm bg-accent/30 rounded px-3 py-2 mb-2">
                                                                    <span className="truncate">{doc.file_name || 'Current file'}</span>
                                                                    <a
                                                                        href={doc.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline ml-auto"
                                                                    >
                                                                        View
                                                                    </a>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    id={`doc-${index}`}
                                                                    className="hidden"
                                                                    onChange={(e) => handleDocumentUpload(e, index)}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById(`doc-${index}`).click()}
                                                                    className="flex-1"
                                                                >
                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                    {uploadingFiles[index] || 'Choose File'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {editingStaff && doc.file_url && (
                                                            <div className="mt-3 flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`verified-${index}`}
                                                                    checked={doc.verified || false}
                                                                    onChange={(e) => {
                                                                        const currentDocs = getValues('documents') || [];
                                                                        const updatedDocs = [...currentDocs];
                                                                        updatedDocs[index].verified = e.target.checked;
                                                                        setValue('documents', updatedDocs);
                                                                    }}
                                                                    className="h-4 w-4 rounded border-gray-300"
                                                                />
                                                                <Label htmlFor={`verified-${index}`}>Verified</Label>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </AppModal>

            {/* Delete Confirmation Modal */}
            <AppModal
                open={!!deletingStaff}
                onClose={() => setDeletingStaff(null)}
                title="Delete Staff Member"
                size="sm"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setDeletingStaff(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(deletingStaff.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin mr-1" />
                            ) : null}
                            Delete
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete{' '}
                    <strong>{deletingStaff?.first_name} {deletingStaff?.last_name}</strong>?
                    This action cannot be undone.
                </p>
            </AppModal>
        </div>
    );
}