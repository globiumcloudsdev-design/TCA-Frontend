'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import AppModal from '@/components/common/AppModal';
import { SelectField, DatePickerField } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { studentService, classService, academicYearService } from '@/services';
import useInstituteStore from '@/store/instituteStore';
import useBranchAccess from '@/hooks/useBranchAccess';
import {
  generateMonthlyAttendanceSheetPDF,
  generateDailyAttendanceSheetPDF,
  exportAttendanceSheetExcel,
} from '@/lib/pdf/blankAttendanceSheetPdf';

export default function DownloadAttendanceSheetModal({
  open,
  onClose,
  initialClassId = '',
  initialSectionId = '',
  initialAcademicYearId = '',
  type = 'school',
  terms = {},
}) {
  const { currentInstitute } = useInstituteStore();
  const { activeBranchId } = useBranchAccess();

  // Modal Form State
  const [academicYearId, setAcademicYearId] = useState(initialAcademicYearId);
  const [classId, setClassId] = useState(initialClassId);
  const [sectionId, setSectionId] = useState(initialSectionId);
  const [sheetFormat, setSheetFormat] = useState('monthly'); // 'monthly' | 'daily'
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sortBy, setSortBy] = useState('roll_no'); // 'roll_no' | 'gr_number' | 'name'
  const [isExporting, setIsExporting] = useState(false);

  // Sync initial props when modal opens
  useEffect(() => {
    if (open) {
      if (initialClassId && initialClassId !== 'all') {
        setClassId(String(initialClassId));
      }
      if (initialSectionId) {
        setSectionId(String(initialSectionId));
      }
      if (initialAcademicYearId) {
        setAcademicYearId(String(initialAcademicYearId));
      }
    }
  }, [open, initialClassId, initialSectionId, initialAcademicYearId]);

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years-sheet', currentInstitute?.id, activeBranchId],
    queryFn: () => academicYearService.getOptions(currentInstitute?.id, true, activeBranchId),
    enabled: open,
  });

  // Set current academic year if not set
  useEffect(() => {
    if (yearsData?.data && !academicYearId) {
      const currentYear =
        yearsData.data.find((y) => y.is_current === true || String(y.is_current) === '1') ||
        yearsData.data[0];
      if (currentYear) {
        setAcademicYearId(String(currentYear.value || currentYear.id));
      }
    }
  }, [yearsData?.data, academicYearId]);

  // Fetch Classes
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes-sheet', currentInstitute?.id, academicYearId],
    queryFn: () =>
      classService.getAll({
        institute_id: currentInstitute?.id,
        academic_year_id: academicYearId || undefined,
        is_active: true,
        limit: 500,
        fetchAll: true,
      }),
    enabled: open,
  });

  // Normalized classes list
  const classesList = useMemo(() => {
    const data = classesData?.data || classesData;
    const list = data?.rows || (Array.isArray(data) ? data : (Array.isArray(classesData?.rows) ? classesData.rows : []));
    return Array.isArray(list) ? list : [];
  }, [classesData]);

  const classOptions = useMemo(() => {
    return classesList.map((c) => ({
      value: String(c.id),
      label: c.name || `Class ${c.id}`,
    }));
  }, [classesList]);

  // Auto select first class if none selected and classes are loaded
  useEffect(() => {
    if (classesList.length > 0 && !classId) {
      setClassId(String(classesList[0].id));
    }
  }, [classesList, classId]);

  // Selected Class details & sections
  const selectedClassObj = useMemo(() => {
    if (!classId) return null;
    return classesList.find((c) => String(c.id) === String(classId)) || null;
  }, [classId, classesList]);

  const sectionsList = useMemo(() => {
    if (!selectedClassObj?.sections) return [];
    return Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : [];
  }, [selectedClassObj]);

  const sectionOptions = useMemo(() => {
    return [
      { value: '', label: 'All Sections' },
      ...sectionsList.map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    ];
  }, [sectionsList]);

  // Reset section if not part of new class
  useEffect(() => {
    if (sectionId && sectionsList.length > 0) {
      const exists = sectionsList.some((s) => String(s.id) === String(sectionId));
      if (!exists) setSectionId('');
    }
  }, [classId, sectionsList, sectionId]);

  // Selected Section Object
  const selectedSectionObj = useMemo(() => {
    if (!sectionId) return null;
    return sectionsList.find((s) => String(s.id) === String(sectionId)) || null;
  }, [sectionId, sectionsList]);

  // Selected Academic Year Object
  const selectedYearObj = useMemo(() => {
    if (!academicYearId || !yearsData?.data) return null;
    return yearsData.data.find((y) => String(y.value || y.id) === String(academicYearId)) || null;
  }, [academicYearId, yearsData?.data]);

  // Fetch Students for selected Class & Section
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-sheet', classId, sectionId, academicYearId],
    queryFn: async () => {
      if (!classId) return [];
      const params = {
        class_id: classId,
        section_id: sectionId || undefined,
        academic_year_id: academicYearId || undefined,
        limit: 1000,
        is_active: true,
      };
      const res = await studentService.getAll(params, type);
      const rows = res?.data?.rows || res?.rows || (Array.isArray(res?.data) ? res.data : []) || (Array.isArray(res) ? res : []);
      return Array.isArray(rows) ? rows : [];
    },
    enabled: open && !!classId,
  });

  // Sorted Students List with normalized GR number & roll number
  const sortedStudents = useMemo(() => {
    const raw = studentsData || [];
    const formatted = raw.map((s) => {
      const details = s.details?.studentDetails || {};
      const activeSession = details.academicSessions?.find((sess) => sess.status === 'active') || {};
      const grNum = s.registration_no || s.gr_number || s.gr_no || '—';
      const rollNum = s.roll_no || activeSession.roll_no || details.roll_no || '—';
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || 'Unnamed Student';

      return {
        ...s,
        gr_number: grNum,
        registration_no: grNum,
        roll_no: rollNum,
        name: fullName,
        fullName,
      };
    });

    return formatted.sort((a, b) => {
      if (sortBy === 'roll_no') {
        const rollA = parseInt(a.roll_no, 10) || 999999;
        const rollB = parseInt(b.roll_no, 10) || 999999;
        return rollA - rollB;
      }
      if (sortBy === 'gr_number') {
        return String(a.gr_number).localeCompare(String(b.gr_number), undefined, { numeric: true });
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }, [studentsData, sortBy]);

  // Handler for PDF Download or Print
  const handleGeneratePDF = async (action = 'download') => {
    if (!classId) {
      toast.error('Please select a class to generate the attendance sheet.');
      return;
    }

    setIsExporting(true);
    try {
      const exportParams = {
        students: sortedStudents,
        className: selectedClassObj?.name || 'Class',
        sectionName: selectedSectionObj?.name || (sectionId ? '' : 'All Sections'),
        academicYearName: selectedYearObj?.label || selectedYearObj?.name || '',
        month: selectedMonth,
        date: selectedDate,
        institute: currentInstitute || {},
        action,
      };

      if (sheetFormat === 'monthly') {
        await generateMonthlyAttendanceSheetPDF(exportParams);
      } else {
        await generateDailyAttendanceSheetPDF(exportParams);
      }

      if (action === 'download') {
        toast.success(`Blank attendance sheet for ${selectedClassObj?.name || 'Class'} downloaded successfully!`);
        onClose();
      } else if (action === 'print') {
        toast.success('Attendance sheet sent to print preview.');
      }
    } catch (error) {
      console.error('Failed to generate attendance sheet:', error);
      toast.error('Failed to generate attendance sheet. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handler for Excel Export
  const handleExportExcel = () => {
    if (!classId) {
      toast.error('Please select a class to generate the attendance sheet.');
      return;
    }

    try {
      exportAttendanceSheetExcel({
        students: sortedStudents,
        className: selectedClassObj?.name || 'Class',
        sectionName: selectedSectionObj?.name || (sectionId ? '' : 'All Sections'),
        academicYearName: selectedYearObj?.label || selectedYearObj?.name || '',
        month: selectedMonth,
        sheetType: sheetFormat,
        institute: currentInstitute || {},
      });

      toast.success(`Blank attendance sheet exported to Excel successfully!`);
      onClose();
    } catch (error) {
      console.error('Failed to export Excel sheet:', error);
      toast.error('Failed to export Excel sheet. Please try again.');
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Download Blank Attendance Sheet"
      description="Generate a printable or downloadable blank attendance register with student names & GR numbers for classroom marking."
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{sortedStudents.length}</span> students ready in sheet
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGeneratePDF('print')}
              disabled={isExporting || !classId}
              className="gap-1.5 border-slate-300 dark:border-slate-700"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting || !classId}
              className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Excel (.xlsx)
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleGeneratePDF('download')}
              disabled={isExporting || !classId}
              className="gap-1.5 bg-primary text-primary-foreground shadow-sm hover:opacity-90"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Format Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sheet Format
          </label>
          <Tabs
            value={sheetFormat}
            onValueChange={setSheetFormat}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full h-11 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <TabsTrigger
                value="monthly"
                className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all"
              >
                📅 Monthly Register (Landscape A4)
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all"
              >
                📋 Daily Checklist (Portrait A4)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Configuration Filters Grid */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Academic Year */}
            <SelectField
              label="Academic Year"
              options={yearsData?.data || []}
              value={academicYearId}
              onChange={setAcademicYearId}
              placeholder="Select Academic Year"
            />

            {/* Class Selection */}
            <SelectField
              label={terms.class || 'Class'}
              options={classOptions}
              value={classId}
              onChange={(val) => {
                setClassId(val);
                setSectionId('');
              }}
              placeholder={`Select ${terms.class || 'Class'}`}
              required
            />

            {/* Section Selection */}
            <SelectField
              label={terms.section || 'Section'}
              options={sectionOptions}
              value={sectionId}
              onChange={setSectionId}
              placeholder="All Sections"
              disabled={!classId || sectionsList.length === 0}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Month Picker or Date Picker */}
            {sheetFormat === 'monthly' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Month & Year
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            ) : (
              <DatePickerField
                label="Attendance Date"
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full"
              />
            )}

            {/* Sort Order */}
            <SelectField
              label="Sort Students By"
              options={[
                { value: 'roll_no', label: 'Roll Number (Default)' },
                { value: 'gr_number', label: 'GR Number / Reg No' },
                { value: 'name', label: 'Student Name (A-Z)' },
              ]}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort order"
            />
          </div>
        </div>

        {/* Student Preview Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Class Enrolled Students Preview
              </h4>
              <Badge variant="outline" className="text-xs font-normal">
                {sortedStudents.length} Students
              </Badge>
            </div>
            {selectedClassObj && (
              <span className="text-xs text-muted-foreground font-medium">
                {selectedClassObj.name} {selectedSectionObj ? `• Section ${selectedSectionObj.name}` : '• All Sections'}
              </span>
            )}
          </div>

          {/* Student Table Preview */}
          <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-sm">
            {isLoadingStudents ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-medium">Loading enrolled students...</p>
              </div>
            ) : sortedStudents.length > 0 ? (
              <div className="max-h-[220px] overflow-y-auto divide-y divide-border/50 text-xs">
                <div className="bg-muted/60 px-4 py-2.5 grid grid-cols-12 gap-2 font-semibold text-muted-foreground sticky top-0 backdrop-blur-sm z-10">
                  <div className="col-span-1 text-center">Sr#</div>
                  <div className="col-span-3 text-left">GR Number</div>
                  <div className="col-span-2 text-center">Roll No</div>
                  <div className="col-span-4 text-left">Student Name</div>
                  <div className="col-span-2 text-center">Gender</div>
                </div>
                {sortedStudents.slice(0, 50).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="px-4 py-2 grid grid-cols-12 gap-2 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-1 text-center font-mono text-muted-foreground">
                      {idx + 1}
                    </div>
                    <div className="col-span-3 text-left">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {s.gr_number}
                      </span>
                    </div>
                    <div className="col-span-2 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                      {s.roll_no}
                    </div>
                    <div className="col-span-4 text-left font-semibold text-foreground truncate">
                      {s.fullName}
                    </div>
                    <div className="col-span-2 text-center capitalize text-muted-foreground">
                      {s.gender || '—'}
                    </div>
                  </div>
                ))}
                {sortedStudents.length > 50 && (
                  <div className="py-2 px-4 text-center text-xs text-muted-foreground bg-muted/20 font-medium">
                    + {sortedStudents.length - 50} more students will be included in the complete downloaded sheet
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-amber-500 opacity-80" />
                <p className="text-xs font-semibold text-foreground">No Students Found</p>
                <p className="text-[11px]">
                  No active students enrolled in this {terms.class || 'class'}/{terms.section || 'section'}. A blank template sheet will still be generated for manual entry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Hint Note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>GR Numbers Prominently Displayed:</strong> The downloaded attendance register places every student's official GR / Registration Number directly adjacent to their Full Name with day-by-day marking squares for easy identification and manual teacher logging.
          </p>
        </div>
      </div>
    </AppModal>
  );
}
