'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Megaphone, Plus, Trash2, Edit, 
  Info, AlertTriangle, CheckCircle, 
  ShieldAlert, Eye, EyeOff, Search,
  Calendar, Building2, Globe
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { masterAdminService } from '@/services';
import { 
  PageHeader, DataTable, AppModal, 
  ConfirmDialog, InputField, TextareaField,
  SelectField, FormSubmitButton, DatePickerField
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ANNOUNCEMENT_TYPES = [
  { value: 'info', label: 'Information (Blue)', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'warning', label: 'Warning (Amber)', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'success', label: 'Success (Emerald)', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'urgent', label: 'Urgent (Red)', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
];

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 1. Fetch Announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['global-announcements'],
    queryFn: () => masterAdminService.getAnnouncements(),
  });

  // 2. Fetch Institutes for targeting
  const { data: schoolsData } = useQuery({
    queryKey: ['master-schools-all'],
    queryFn: () => masterAdminService.getSchools({ limit: 1000 }),
  });
  const institutes = schoolsData?.data?.rows || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => masterAdminService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-announcements']);
      toast.success('Announcement published successfully');
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => masterAdminService.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-announcements']);
      toast.success('Announcement updated');
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => masterAdminService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-announcements']);
      toast.success('Announcement deleted');
      setDeletingId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => masterAdminService.updateAnnouncement(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['global-announcements'])
  });

  const columns = [
    {
      header: 'Title & Content',
      cell: ({ row }) => {
        const type = ANNOUNCEMENT_TYPES.find(t => t.value === row.original.type) || ANNOUNCEMENT_TYPES[0];
        const Icon = type.icon;
        return (
          <div className="flex items-start gap-3 max-w-md">
            <div className={cn("p-2 rounded-lg shrink-0 mt-1", type.bg)}>
              <Icon className={cn("w-4 h-4", type.color)} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{row.original.title}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{row.original.content}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Target',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold">
            {row.original.target_type === 'all' ? (
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> All Institutes</span>
            ) : (
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {row.original.target_institutes?.length || 0} Institutes</span>
            )}
          </Badge>
          {row.original.expires_at && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Exp: {new Date(row.original.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <button 
          onClick={() => toggleStatusMutation.mutate({ id: row.original.id, is_active: !row.original.is_active })}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
            row.original.is_active 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-slate-50 text-slate-400 border border-slate-100"
          )}
        >
          {row.original.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {row.original.is_active ? 'Active' : 'Draft'}
        </button>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              setEditingAnnouncement(row.original);
              setIsModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => setDeletingId(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Global Announcements" 
        description="Broadcast important updates, maintenance notices, or system-wide alerts to all institutes."
        icon={Megaphone}
        action={
          <Button onClick={() => {
            setEditingAnnouncement(null);
            setIsModalOpen(true);
          }} className="gap-2 font-bold rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> New Broadcast
          </Button>
        }
      />

      <DataTable 
        columns={columns}
        data={announcements?.data || []}
        isLoading={isLoading}
      />

      <AnnouncementModal 
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        institutes={institutes}
        onSubmit={(data) => {
          if (editingAnnouncement) {
            updateMutation.mutate({ id: editingAnnouncement.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        loading={createMutation.isPending || updateMutation.isPending}
        initialData={editingAnnouncement}
      />

      <ConfirmDialog 
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        loading={deleteMutation.isPending}
        title="Delete Announcement?"
        description="This action cannot be undone. The broadcast will be removed for all users."
        variant="destructive"
      />
    </div>
  );
}

function AnnouncementModal({ open, onClose, institutes, onSubmit, loading, initialData }) {
  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      type: 'info',
      target_type: 'all',
      target_institutes: [],
      is_active: true,
      expires_at: null
    }
  });

  const targetType = watch('target_type');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        title: '',
        content: '',
        type: 'info',
        target_type: 'all',
        target_institutes: [],
        is_active: true,
        expires_at: null
      });
    }
  }, [initialData, reset]);

  const instituteOptions = institutes.map(i => ({
    value: i.id,
    label: `${i.institute_name} (${i.institute_code})`
  }));

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AppModal 
      open={open} 
      onClose={handleClose}
      title={initialData ? "Edit Announcement" : "Create Global Announcement"}
      description="Fill in the details for your platform-wide broadcast."
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton 
            onClick={handleSubmit(onSubmit)} 
            loading={loading} 
            label={initialData ? "Save Changes" : "Publish Now"} 
          />
        </div>
      }
    >
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <InputField 
            label="Broadcast Title"
            name="title"
            register={register}
            placeholder="e.g. Scheduled Maintenance"
            required
          />
          <TextareaField 
            label="Detailed Message"
            name="content"
            register={register}
            placeholder="Write the full message here..."
            rows={5}
            required
          />
          <SelectField 
            label="Announcement Type"
            name="type"
            control={control}
            options={ANNOUNCEMENT_TYPES}
          />
        </div>

        <div className="space-y-5">
           <SelectField 
            label="Target Audience"
            name="target_type"
            control={control}
            options={[
              { value: 'all', label: 'All Institutes' },
              { value: 'specific', label: 'Specific Institutes' }
            ]}
          />

          {targetType === 'specific' && (
             <div className="space-y-2">
               <p className="text-xs font-bold text-slate-700">Select Institutes</p>
               <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                  {instituteOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        value={opt.value}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                        {...register('target_institutes')}
                      />
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                    </label>
                  ))}
               </div>
             </div>
          )}

          <DatePickerField 
            label="Expiry Date (Optional)"
            name="expires_at"
            control={control}
            placeholder="Announcment will hide after this date"
          />

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="is_active"
                className="rounded border-slate-300 text-primary h-4 w-4"
                {...register('is_active')}
              />
              <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                Publish immediately (Visible to users)
              </label>
            </div>
          </div>
        </div>
      </form>
    </AppModal>
  );
}
