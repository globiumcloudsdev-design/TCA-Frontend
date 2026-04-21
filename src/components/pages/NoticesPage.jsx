'use client';
/**
 * NotificationsPage — Send & View Notifications
 * Perfect cascading audience selection with dropdown-based UI
 */
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Bell, Eye } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';

const AUDIENCE_OPTS = [
  { value: 'all', label: '📢 Everyone' },
  { value: 'students', label: '👨‍🎓 Students' },
  { value: 'teachers', label: '👨‍🏫 Teachers' },
  { value: 'parents', label: '👨‍👩‍👧 Parents' },
  { value: 'staff', label: '👥 Staff' },
];

const NOTIF_TYPE_OPTS = [
  { value: 'fee', label: 'Fee' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'exam', label: 'Exam' },
  { value: 'general', label: 'General' },
  { value: 'alert', label: 'Alert' },
  { value: 'system', label: 'System' },
];

const schema = z.object({
  title: z.string().min(5, 'Title required (min 5 chars)'),
  body: z.string().min(10, 'Message required (min 10 chars)'),
  audience: z.string().min(1, 'Select audience'),
  notification_type: z.string().default('general'),
});

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotificationForView, setSelectedNotificationForView] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { audience: 'all', notification_type: 'general' },
  });

  const watchAudience = useWatch({ control, name: 'audience' });

  // Fetch users by audience type and build dropdown options
  const loadRecipientOptions = async (audienceType) => {
    try {
      let users = [];
      const { studentService, teacherService, parentService, staffService } = await import('@/services');

      if (audienceType === 'students') {
        const res = await studentService.getAll({ limit: 1000 });
        users = res.data?.rows || res.data || [];
      } else if (audienceType === 'teachers') {
        const res = await teacherService.getAll({ limit: 1000 });
        users = res.data?.rows || res.data || [];
      } else if (audienceType === 'parents') {
        const res = await parentService.getAll({ limit: 1000 });
        users = res.data?.rows || res.data || [];
      } else if (audienceType === 'staff') {
        const res = await staffService.getAll({ limit: 1000 });
        users = res.data?.rows || res.data || [];
      }

      console.log(`Loaded ${audienceType}:`, users);

      // Build options: "All {Type}" + individual users
      const allOption = {
        value: `all_${audienceType}`,
        label: `📢 All ${audienceType.charAt(0).toUpperCase() + audienceType.slice(1)}`,
      };
      const userOptions = users.map((u) => ({
        value: u.id,
        label: `👤 ${u.first_name || u.name} ${u.last_name || ''}`.trim(),
      }));

      const options = [allOption, ...userOptions];
      console.log('Recipient options:', options);
      return options;
    } catch (error) {
      console.error('Error loading recipient options:', error);
      toast.error('Failed to load users');
      return [];
    }
  };

  // Update recipient options when audience changes
  useEffect(() => {
    if (watchAudience && watchAudience !== 'all') {
      loadRecipientOptions(watchAudience).then((options) => {
        setRecipientOptions(options);
        setSelectedRecipient(options[0]?.value || 'all');
      });
    } else {
      setRecipientOptions([]);
      setSelectedRecipient('all');
    }
  }, [watchAudience]);

  // Fetch notifications
  const { data: notificationsData, isLoading: notifLoading, refetch } = useQuery({
    queryKey: ['notifications', page, pageSize],
    queryFn: async () => {
      try {
        const { notificationService } = await import('@/services');
        const result = await notificationService.getAll({ page, limit: pageSize });
        // console.log('Notifications fetched:', result);
        return result;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications');
        return { rows: [], pagination: { total: 0, pages: 1 } };
      }
    },
    placeholderData: (p) => p,
  });

  const notifications = Array.isArray(notificationsData?.data)
    ? notificationsData.data
    : notificationsData?.rows ?? [];
  const pagination = notificationsData?.pagination ?? { total: 0, pages: 1 };

  // Send notification
  const sendNotification = useMutation({
    mutationFn: async (vals) => {
      try {
        const { notificationService } = await import('@/services');

        const notifData = {
          title: vals.title,
          body: vals.body,
          type: vals.notification_type,
          channel: 'in_app',
          data: {},
        };

        if (vals.audience === 'all') {
          // Broadcast to everyone
          await Promise.all([
            notificationService.broadcast({ recipient_type: 'ALL_STUDENTS', ...notifData }),
            notificationService.broadcast({ recipient_type: 'ALL_TEACHERS', ...notifData }),
            notificationService.broadcast({ recipient_type: 'ALL_PARENTS', ...notifData }),
            notificationService.broadcast({ recipient_type: 'ALL_STAFF', ...notifData }),
            notificationService.broadcast({ recipient_type: 'ALL_ADMINS', ...notifData }),
          ]);
        } else {
          // Send based on recipient selection
          const typeMap = {
            students: 'ALL_STUDENTS',
            teachers: 'ALL_TEACHERS',
            parents: 'ALL_PARENTS',
            staff: 'ALL_STAFF',
          };

          if (selectedRecipient?.startsWith('all_')) {
            // Send to all of that type
            const type = selectedRecipient.replace('all_', '');
            const recipientType = typeMap[type] || `ALL_${type.toUpperCase()}`;
            await notificationService.broadcast({
              recipient_type: recipientType,
              ...notifData,
            });
          } else {
            // Send to specific user
            await notificationService.send({
              user_id: selectedRecipient,
              ...notifData,
            });
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('✅ Notification sent successfully!');
      reset({ audience: 'all', notification_type: 'general' });
      setSelectedRecipient('all');
      setRecipientOptions([]);
      setSendModalOpen(false);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    },
    onError: (error) => {
      toast.error(`❌ Failed to send: ${error.message}`);
    },
  });

  const notificationColumns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row: { original: n } }) => (
          <div>
            <p className="font-medium text-sm">{n.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const t = getValue();
          const colors = {
            fee: 'bg-green-100 text-green-700',
            attendance: 'bg-blue-100 text-blue-700',
            exam: 'bg-purple-100 text-purple-700',
            alert: 'bg-red-100 text-red-700',
            general: 'bg-gray-100 text-gray-700',
            system: 'bg-yellow-100 text-yellow-700',
          };
          return (
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', colors[t])}>
              {t}
            </span>
          );
        },
      },
      {
        accessorKey: 'is_read',
        header: 'Status',
        cell: ({ getValue }) => (getValue() ? '✅ Read' : '📬 Unread'),
      },
      {
        accessorKey: 'created_at',
        header: 'Sent At',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return date.toLocaleString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableHiding: false,
        cell: ({ row: { original: n } }) => (
          <button
            onClick={() => {
              setSelectedNotificationForView(n);
              setViewModalOpen(true);
            }}
            className="rounded p-1.5 hover:bg-accent"
            title="View Details"
          >
            <Eye size={14} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader 
        title="📢 Notifications" 
        description="Send & manage notifications" 
        action={
          <button
            onClick={() => setSendModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Send size={16} />
            Send Notification
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard label="Total Notifications" value={pagination.total || 0} icon={<Bell size={18} />} />
        <StatsCard label="Unread" value={notifications.filter((n) => !n.is_read).length} icon={<Send size={18} />} />
      </div>

      {/* Notifications Table */}
      <div className="rounded-lg border bg-card">
        <DataTable
          columns={notificationColumns}
          data={notifications}
          loading={notifLoading}
          emptyMessage="No notifications yet"
          pagination={{
            page,
            totalPages: pagination.pages,
            onPageChange: setPage,
            total: pagination.total,
            pageSize,
            onPageSizeChange: (s) => {
              setPageSize(s);
              setPage(1);
            },
          }}
        />
      </div>

      {/* Send Notification Modal */}
      <AppModal
        open={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          reset({ audience: 'all', notification_type: 'general' });
          setSelectedRecipient('all');
        }}
        title="📤 Send Notification"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setSendModalOpen(false);
                reset({ audience: 'all', notification_type: 'general' });
                setSelectedRecipient('all');
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="send-notification-form"
              disabled={sendNotification.isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Send size={14} />
              {sendNotification.isPending ? 'Sending...' : 'Send Notification'}
            </button>
          </>
        }
      >
        <form id="send-notification-form" onSubmit={handleSubmit((v) => sendNotification.mutate(v))} className="space-y-4">
          {/* Row 1: Title & Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <input
                {...register('title')}
                placeholder="Notification title"
                className="input-base"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <SelectField
              label="Type *"
              name="notification_type"
              control={control}
              options={NOTIF_TYPE_OPTS}
            />
          </div>

          {/* Row 2: Audience & Recipient */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Send To *"
                name="audience"
                control={control}
                error={errors.audience}
                options={AUDIENCE_OPTS}
                required
              />

              {watchAudience && watchAudience !== 'all' && recipientOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Select Recipient *</label>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {recipientOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {selectedRecipient?.startsWith('all_')
                      ? `📢 Will broadcast to all ${watchAudience}`
                      : '👤 Will send to this specific person'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message *</label>
            <textarea
              {...register('body')}
              placeholder="Notification message..."
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>
        </form>
      </AppModal>

      {/* View Notification Details Modal */}
      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedNotificationForView(null);
        }}
        title="📋 Notification Details"
        size="md"
        footer={
          <button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedNotificationForView(null);
            }}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Close
          </button>
        }
      >
        {selectedNotificationForView && (
          <div className="space-y-4">
            {/* Title & Body */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{selectedNotificationForView.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedNotificationForView.body}</p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Type Badge */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Type</p>
                <div>
                  {(() => {
                    const t = selectedNotificationForView.type;
                    const colors = {
                      fee: 'bg-green-100 text-green-700',
                      attendance: 'bg-blue-100 text-blue-700',
                      exam: 'bg-purple-100 text-purple-700',
                      alert: 'bg-red-100 text-red-700',
                      general: 'bg-gray-100 text-gray-700',
                      system: 'bg-yellow-100 text-yellow-700',
                    };
                    return (
                      <span className={cn('rounded-full px-2 py-1 text-xs font-medium capitalize', colors[t])}>
                        {t}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className="text-sm font-medium">
                  {selectedNotificationForView.is_read ? '✅ Read' : '📬 Unread'}
                </p>
              </div>

              {/* Sent At */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Sent At</p>
                <p className="text-sm font-medium">
                  {new Date(selectedNotificationForView.created_at).toLocaleString('en-PK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Channel */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Channel</p>
                <p className="text-sm font-medium capitalize">{selectedNotificationForView.channel}</p>
              </div>

              {/* Read At (if read) */}
              {selectedNotificationForView.read_at && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Read At</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedNotificationForView.read_at).toLocaleString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Data (if present) */}
            {selectedNotificationForView.data && Object.keys(selectedNotificationForView.data).length > 0 && (
              <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-medium">Additional Information</p>
                <div className="space-y-1">
                  {Object.entries(selectedNotificationForView.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ID */}
            <div className="space-y-1 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">Notification ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{selectedNotificationForView.id}</p>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
