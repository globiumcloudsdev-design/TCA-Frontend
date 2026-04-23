'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, differenceInDays, parseISO } from 'date-fns';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import studentPortalService from '@/services/studentPortalService';

export default function StudentLeaveRequestForm({ leaveBalance, onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      leave_type_id: '',
      from_date: '',
      to_date: '',
      reason: '',
    },
  });

  const fromDate = watch('from_date');
  const toDate = watch('to_date');
  const leaveTypeId = watch('leave_type_id');

  // Parse leave balance to extract leave types
  const leaveTypes = useMemo(() => {
    if (!leaveBalance) return [];
    
    // In some cases, the API might return an array or an object
    const balanceData = leaveBalance?.data || leaveBalance;

    if (Array.isArray(balanceData)) {
      return balanceData.map(lt => ({
        id: lt.id || lt.leave_type_id,
        value: lt.id || lt.leave_type_id,
        label: `${lt.leave_type_name || lt.name} (${lt.remaining_days ?? 0} days)`,
        leave_type_name: lt.leave_type_name || lt.name,
        remaining_days: lt.remaining_days ?? 0,
      }));
    }

    // If it's the standard balance object { "Sick Leave": { remaining_days: x }, ... }
    return Object.entries(balanceData)
      .filter(([key]) => !['success', 'message', 'data'].includes(key))
      .map(([name, data]) => ({
        id: data.id || data.leave_type_id || name,
        value: data.id || data.leave_type_id || name,
        label: `${data.leave_type_name || name} (${data.remaining_days ?? 0} days)`,
        leave_type_name: data.leave_type_name || name,
        remaining_days: data.remaining_days ?? 0,
      }));
  }, [leaveBalance]);

  const selectedLeaveType = useMemo(() => {
    if (!leaveTypeId) return null;
    return leaveTypes.find(lt => lt.id === leaveTypeId);
  }, [leaveTypeId, leaveTypes]);

  const numberOfDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    try {
      const start = parseISO(fromDate);
      const end = parseISO(toDate);
      const diff = differenceInDays(end, start) + 1;
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [fromDate, toDate]);

  const onSubmit = async (data) => {
    if (numberOfDays <= 0) {
      toast.error('Invalid date range');
      return;
    }

    if (selectedLeaveType && numberOfDays > selectedLeaveType.remaining_days) {
      toast.error(`Insufficient balance. Available: ${selectedLeaveType.remaining_days} days`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        from_date: data.from_date,
        to_date: data.to_date,
        leave_type_id: data.leave_type_id,
        reason: data.reason.trim(),
        number_of_days: numberOfDays,
      };

      await studentPortalService.createLeaveRequest(payload);
      toast.success('Leave request submitted successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to submit leave request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-2">
        <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Leave Balance</p>
        <div className="grid grid-cols-2 gap-3">
          {leaveTypes.length > 0 ? leaveTypes.map((lt) => (
            <div key={lt.id} className="bg-white/50 p-2 rounded-xl border border-emerald-200/50">
              <p className="text-[10px] text-emerald-600 font-bold uppercase truncate">{lt.leave_type_name}</p>
              <p className="text-sm font-black text-emerald-950">{lt.remaining_days} <span className="text-[9px] font-bold opacity-50">DAYS</span></p>
            </div>
          )) : (
            <p className="col-span-2 text-[10px] text-emerald-400 italic">Loading balance...</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <SelectField
          name="leave_type_id"
          label="Leave Type"
          control={control}
          placeholder="Select reason"
          options={leaveTypes}
          rules={{ required: 'Required' }}
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePickerField
            name="from_date"
            label="Start Date"
            control={control}
            rules={{ required: 'Required' }}
          />
          <DatePickerField
            name="to_date"
            label="End Date"
            control={control}
            rules={{ required: 'Required' }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Reason for Leave</label>
          <textarea
            {...control.register('reason', { required: 'Required' })}
            placeholder="Technical reason for absence..."
            rows={3}
            className={`w-full bg-slate-50 border ${errors.reason ? 'border-rose-300' : 'border-slate-200'} rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none`}
          />
          {errors.reason && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.reason.message}</p>}
        </div>
      </div>

      {numberOfDays > 0 && (
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
          <div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Total Duration</p>
            <p className="text-xl font-black">{numberOfDays} <span className="text-xs opacity-70">Working Day(s)</span></p>
          </div>
          <Badge className="bg-emerald-500 text-white border-0 font-bold px-3 py-1">READY</Badge>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 text-slate-500"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-[2] h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}
