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
import teacherPortalService from '@/services/teacherPortalService';

export default function LeaveRequestForm({ leaveBalance, onSuccess, onCancel }) {
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
  const reason = watch('reason');

  // Parse leave balance to extract leave types
  const leaveTypes = useMemo(() => {
    if (!leaveBalance) return [];
    
    if (Array.isArray(leaveBalance)) {
      return leaveBalance;
    }

    // Convert object to array format
    return Object.entries(leaveBalance)
      .filter(([key]) => !['success', 'message', 'data'].includes(key))
      .map(([leaveTypeId, data]) => ({
        id: leaveTypeId,
        value: leaveTypeId,
        label: `${data.leave_type_name || data.name || leaveTypeId} (${data.remaining_days ?? data.remaining ?? 0} days)`,
        leave_type_name: data.leave_type_name || data.name || leaveTypeId,
        remaining_days: data.remaining_days ?? data.remaining ?? 0,
        max_days_per_year: data.max_days_per_year ?? data.max ?? 0,
        can_take_more: data.can_take_more ?? (data.remaining_days > 0),
      }))
      .filter(lt => lt.can_take_more);
  }, [leaveBalance]);

  // Get selected leave type info
  const selectedLeaveType = useMemo(() => {
    if (!leaveTypeId) return null;
    return leaveTypes.find(lt => lt.id === leaveTypeId);
  }, [leaveTypeId, leaveTypes]);

  // Calculate number of days
  const numberOfDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    try {
      const start = parseISO(fromDate);
      const end = parseISO(toDate);
      return differenceInDays(end, start) + 1; // +1 to include both start and end date
    } catch {
      return 0;
    }
  }, [fromDate, toDate]);

  // Validate custom rules
  const validateCustomRules = (data) => {
    const customErrors = [];

    // Validate sufficient balance
    if (selectedLeaveType && numberOfDays > selectedLeaveType.remaining_days) {
      customErrors.push(
        `Insufficient leave balance. You have ${selectedLeaveType.remaining_days} days remaining but requesting ${numberOfDays} days.`
      );
    }

    return customErrors;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    // Validate custom rules
    const customErrors = validateCustomRules(data);
    if (customErrors.length > 0) {
      customErrors.forEach((msg) => toast.error(msg));
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

      console.log('📝 Submitting leave request:', payload);

      const response = await teacherPortalService.createLeaveRequest(payload);

      console.log('✅ Leave request created:', response);
      
      toast.success('Leave request submitted successfully!');
      
      // Reset form
      reset();

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('❌ Error creating leave request:', error);
      const message = error?.response?.data?.message || error.message || 'Failed to submit leave request';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Leave Balance Summary */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
        <p className="text-xs font-bold text-blue-900">📊 Your Leave Balance:</p>
        <div className="grid grid-cols-2 gap-2">
          {leaveTypes.slice(0, 4).map((lt) => (
            <div key={lt.id} className="text-xs">
              <span className="text-blue-700 font-medium">{lt.leave_type_name}:</span>
              <span className="ml-1 font-bold text-blue-900">{lt.remaining_days} days</span>
            </div>
          ))}
        </div>
        {leaveTypes.length > 4 && (
          <p className="text-[10px] text-blue-600 italic">+{leaveTypes.length - 4} more leave types available</p>
        )}
      </div>

      {/* Leave Type Selection */}
      <SelectField
        label="Leave Type"
        name="leave_type_id"
        control={control}
        error={errors.leave_type_id}
        options={leaveTypes}
        placeholder="Select a leave type..."
        required
        rules={{
          required: 'Leave type is required',
        }}
      />

      {/* Start Date */}
      <DatePickerField
        label="Start Date"
        name="from_date"
        control={control}
        error={errors.from_date}
        placeholder="Pick a date"
        required
        disablePastDates
        rules={{
          required: 'Start date is required',
        }}
      />

      {/* End Date */}
      <DatePickerField
        label="End Date"
        name="to_date"
        control={control}
        error={errors.to_date}
        placeholder="Pick a date"
        required
        disablePastDates
        minDate={fromDate || format(new Date(), 'yyyy-MM-dd')}
        rules={{
          required: 'End date is required',
          validate: {
            afterStart: (value) => {
              if (!fromDate || !value) return true;
              try {
                const start = parseISO(fromDate);
                const end = parseISO(value);
                return end >= start || 'End date must be on or after start date';
              } catch {
                return 'Invalid date format';
              }
            },
            sufficientBalance: (value) => {
              if (!fromDate || !value || !leaveTypeId) return true;
              const days = differenceInDays(parseISO(value), parseISO(fromDate)) + 1;
              if (selectedLeaveType && days > selectedLeaveType.remaining_days) {
                return `Insufficient balance. You have ${selectedLeaveType.remaining_days} days but requesting ${days} days.`;
              }
              return true;
            },
          },
        }}
      />

      {/* Number of Days Display */}
      {numberOfDays > 0 && (
        <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Total Days:</span>
          <Badge
            className={`text-xs px-3 py-1 ${
              selectedLeaveType && numberOfDays > selectedLeaveType.remaining_days
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {numberOfDays} day{numberOfDays !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Balance Check */}
      {selectedLeaveType && numberOfDays > 0 && (
        <div
          className={`p-3 rounded-lg flex items-start gap-2 text-xs ${
            numberOfDays <= selectedLeaveType.remaining_days
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {numberOfDays <= selectedLeaveType.remaining_days ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">
                ✅ You have sufficient balance. Remaining after this leave: <strong>{selectedLeaveType.remaining_days - numberOfDays} days</strong>
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">
                ⚠️ Insufficient leave balance. You need <strong>{numberOfDays - selectedLeaveType.remaining_days} more days</strong>
              </p>
            </>
          )}
        </div>
      )}

      {/* Reason/Remarks */}
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
          Reason/Remarks *
        </label>
        <Controller
          name="reason"
          control={control}
          rules={{
            required: 'Reason is required',
            minLength: {
              value: 5,
              message: 'Reason must be at least 5 characters',
            },
            maxLength: {
              value: 500,
              message: 'Reason must not exceed 500 characters',
            },
          }}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                placeholder="Explain the reason for your leave request..."
                rows={3}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.reason
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-slate-200 bg-white focus:ring-blue-200'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-500">
                  {field.value?.length ?? 0}/500 characters
                  {(field.value?.length ?? 0) < 5 ? ' (minimum 5 required)' : ''}
                </p>
                {errors.reason && (
                  <p className="text-xs text-red-600">{errors.reason.message}</p>
                )}
              </div>
            </>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={submitting || leaveTypes.length === 0 || !fromDate || !toDate || !leaveTypeId}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {submitting ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Leave Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
