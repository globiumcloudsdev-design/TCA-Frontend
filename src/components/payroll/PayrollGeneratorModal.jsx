// src/components/payroll/PayrollGeneratorModal.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import MultiSelectField from '@/components/common/MultiSelectField';
import { payrollService } from '@/services/payrollService';
import { staffService } from '@/services/staffService';
import { teacherService } from '@/services/teacherService';

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All (Teachers + Staff)' },
  { value: 'teacher', label: 'Teachers Only' },
  { value: 'staff', label: 'Staff Only' },
  { value: 'specific', label: 'Select Specific People' },
];

export default function PayrollGeneratorModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();

  // month string rakha gaya hai taake dropdown perfectly work kare
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear));
  const [category, setCategory] = useState('all');

  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [staffOptions, setStaffOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Previous 3 years + current year
  const YEAR_OPTIONS = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const y = currentYear - 3 + i;
      return {
        value: String(y),
        label: String(y),
      };
    });
  }, [currentYear]);

  useEffect(() => {
    if (category === 'specific' && open) {
      const loadData = async () => {
        setLoadingPeople(true);

        try {
          const [teachersRes, staffRes] = await Promise.all([
            teacherService.getOptions({ limit: 500, is_active: true }),
            staffService.getAll({ limit: 500, is_active: true }),
          ]);

          const teachers = (teachersRes.data || []).map((t) => ({
            value: t.value,
            label: t.label,
          }));

          const staff = (staffRes.data || []).map((s) => ({
            value: s.id,
            label: `${s.first_name} ${s.last_name}`,
          }));

          setTeacherOptions(teachers);
          setStaffOptions(staff);
        } catch (error) {
          toast.error('Failed to load staff/teachers list');
        } finally {
          setLoadingPeople(false);
        }
      };

      loadData();
    }
  }, [category, open]);

  const generateMutation = useMutation({
    mutationFn: (payload) => payrollService.generatePayroll(payload),

    onSuccess: (res) => {
      const { generated, skipped, failed, errors } = res.data;

      toast.success(
        `Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`
      );

      if (errors?.length) {
        console.error(errors);
        toast.warning(`${errors.length} records failed. Check console.`);
      }

      queryClient.invalidateQueries(['payroll']);
      queryClient.invalidateQueries(['payroll-years']);

      handleClose();
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Generation failed'
      );
    },
  });

  const handleSubmit = () => {
    if (!month || !year) {
      toast.error('Please select month and year');
      return;
    }

    const payload = {
      month: Number(month),
      year: Number(year),
    };

    if (category === 'specific') {
      const ids = [...selectedStaffIds, ...selectedTeacherIds];

      if (!ids.length) {
        toast.error('Please select at least one staff or teacher');
        return;
      }

      payload.staff_ids = ids;
    } else {
      payload.category = category;
    }

    generateMutation.mutate(payload);
  };

  const handleClose = () => {
    setSelectedStaffIds([]);
    setSelectedTeacherIds([]);
    setCategory('all');
    setMonth(String(new Date().getMonth() + 1));
    setYear(String(currentYear));
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Generate Payroll (Bulk)"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={generateMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {generateMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Generate'
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Month + Year */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Month"
            value={month}
            onChange={setMonth}
            options={MONTH_OPTIONS}
            required
          />

          <SelectField
            label="Year"
            value={year}
            onChange={setYear}
            options={YEAR_OPTIONS}
            required
          />
        </div>

        {/* Category */}
        <SelectField
          label="Category"
          value={category}
          onChange={(val) => {
            setCategory(val);

            if (val !== 'specific') {
              setSelectedStaffIds([]);
              setSelectedTeacherIds([]);
            }
          }}
          options={CATEGORY_OPTIONS}
        />

        {/* Specific Selection */}
        {category === 'specific' && (
          <div className="space-y-4 border-t pt-3">
            {loadingPeople ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Loading staff and teachers...
              </div>
            ) : (
              <>
                <MultiSelectField
                  label="👔 Select Staff"
                  value={selectedStaffIds}
                  onChange={setSelectedStaffIds}
                  options={staffOptions}
                  placeholder="Choose staff members..."
                  maxHeight="180px"
                />

                <MultiSelectField
                  label="👩‍🏫 Select Teachers"
                  value={selectedTeacherIds}
                  onChange={setSelectedTeacherIds}
                  options={teacherOptions}
                  placeholder="Choose teachers..."
                  maxHeight="180px"
                />
              </>
            )}
          </div>
        )}

        {/* Info */}
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          <p>
            ⚠️ Only staff with no existing payslip for selected month will be
            processed.
          </p>
          <p>
            💰 Salary uses active Payroll Policy (attendance, overtime,
            allowances).
          </p>
        </div>
      </div>
    </AppModal>
  );
}