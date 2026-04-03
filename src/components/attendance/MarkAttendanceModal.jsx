'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Users, UserSquare, CheckCircle, Search, Save, AlertCircle, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField, DatePickerField, AppModal } from '@/components/common';
import QRScanner from '@/components/attendance/QRScanner';
import AttendanceFilter from '@/components/attendance/AttendanceFilter';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import {
  studentAttendanceService,
  classService,
  studentService,
  academicYearService
} from '@/services';

export default function MarkAttendanceModal({ open, onClose, defaultMode = 'class', type = 'school' }) {
  const queryClient = useQueryClient();
  const { terms } = useInstituteConfig();
  const [activeTab, setActiveTab] = useState(defaultMode);

  // Sync tab with defaultMode when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultMode);
    }
  }, [open, defaultMode]);

  const isScanOnly = defaultMode === 'scan';

  return (
    <AppModal 
      open={open} 
      onClose={onClose} 
      title={isScanOnly ? "Scan QR Attendance" : "Manual Attendance"} 
      description={isScanOnly ? "Rapidly scan student ID cards to mark bulk attendance." : "Mark bulk attendance by class or search for an individual student."}
      size="xl"
    >
      <div className="space-y-6">
        {isScanOnly ? (
          <InstantScanTab />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full h-auto mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl gap-1">
              <TabsTrigger value="bulk-scan" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <QrCode className="w-4 h-4 mr-2" /> Bulk Scan Mode
              </TabsTrigger>
              <TabsTrigger value="class" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" /> By {terms.class || 'Class'}
              </TabsTrigger>
              <TabsTrigger value="student" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <UserSquare className="w-4 h-4 mr-2" /> By {terms.student || 'Student'}
              </TabsTrigger>
            </TabsList>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <TabsContent value="bulk-scan" className="mt-0 outline-none">
                <BulkScanTab terms={terms} />
              </TabsContent>

              <TabsContent value="class" className="mt-0 outline-none">
                <ClassAttendanceTab terms={terms} type={type} />
              </TabsContent>

              <TabsContent value="student" className="mt-0 outline-none">
                <StudentSearchTab terms={terms} type={type} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </AppModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Instant Scan Tab
// ─────────────────────────────────────────────────────────────────────────────
function InstantScanTab() {
  const queryClient = useQueryClient();
  const [scanHistory, setScanHistory] = useState([]);
  const [scanType, setScanType] = useState('regular');
  
  // Hand to hand matching uses strictly current local date
  const todayDate = new Date().toISOString().slice(0, 10);

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    // Prevent double scanning the exact same code within short intervals
    const lastScan = scanHistory[0];
    if (lastScan && lastScan.id === studentId && (Date.now() - lastScan.timestamp < 3000)) {
      return false; 
    }
    
    try {
      await studentAttendanceService.scanQR({
        student_id: studentId,
        date: todayDate,
        type: scanType
      });
      
      toast.success(`Successfully marked attendance for ${studentId}`);
      setScanHistory(prev => [{ id: studentId, status: 'success', timestamp: Date.now() }, ...prev].slice(0, 50));
      return true; 
    } catch(err) {
      toast.error(err.response?.data?.message || `Failed to mark attendance for ${studentId}`);
      setScanHistory(prev => [{ 
        id: studentId, 
        status: 'error', 
        error: err.response?.data?.message || 'Error occurred', 
        timestamp: Date.now() 
      }, ...prev].slice(0, 50));
      return false;
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
      <div className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              Instant QR Scanner
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Scan student ID cards to mark them present instantly. Uses today's date automatically.
            </p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 relative group">
          <QRScanner onScan={handleScan} bulkMode={true} />
        </div>
      </div>
      
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <SelectField
            label="Attendance Type"
            options={[
              { value: 'regular', label: 'Regular Classes' },
              { value: 'exam', label: 'Examinations' },
              { value: 'extra_class', label: 'Extra Classes' },
              { value: 'event', label: 'Special Event' }
            ]}
            value={scanType}
            onChange={(val) => setScanType(val)}
          />
          <div className="space-y-1.5 flex flex-col justify-end pointer-events-none opacity-80">
            <DatePickerField
              label="Date (Fixed)"
              value={todayDate}
              onChange={() => {}}
            />
          </div>
        </div>

        <div className="min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Recent Scans
            </h4>
            {scanHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-500 h-6 px-2">
                Clear List
              </Button>
            )}
          </div>
          
          {scanHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 transition-all">
              <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-500">Camera is ready</p>
              <p className="text-xs text-slate-400">Scan QR to log directly to the server</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {scanHistory.map((item, idx) => (
                <li key={`${item.id}-${item.timestamp}-${idx}`} className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-950 border ${item.status === 'success' ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'} shadow-sm animate-in slide-in-from-right-4 transition-colors`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                    item.status === 'success' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {item.status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold font-mono tracking-wider text-slate-800 dark:text-slate-200 text-lg block leading-none truncate">
                      {item.id}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider mt-1 block ${item.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.status === 'success' ? `Logged at ${new Date(item.timestamp).toLocaleTimeString()}` : item.error}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1b. Bulk Scan Tab (Queue-based)
// ─────────────────────────────────────────────────────────────────────────────
function BulkScanTab({ terms }) {
  const [scannedIds, setScannedIds] = useState([]);
  const scannedIdsRef = useRef([]);
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    scannedIdsRef.current = scannedIds;
  }, [scannedIds]);

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    if (scannedIdsRef.current.includes(studentId)) {
      return false; 
    }
    
    setScannedIds(prev => [...prev, studentId]);
    return true; 
  };

  const removeScannedId = (id) => {
    setScannedIds(prev => prev.filter(item => item !== id));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        section_id: filters.section_id,
        date: filters.date,
        type: 'regular',
        skip_existing: true,
        records: scannedIds.map(id => ({ student_id: id, status: 'present', remarks: '' })),
      };
      
      try {
        return await studentAttendanceService.bulkMarkAttendance(payload);
      } catch (err) {
        console.warn('Bulk API failed, falling back to sequential scans...', err);
        const promises = scannedIds.map(id => 
          studentAttendanceService.scanQR({ student_id: id, date: filters.date, type: 'regular' }).catch(e => ({ error: e, id }))
        );
        const results = await Promise.all(promises);
        return { data: results, fallback: true };
      }
    },
    onSuccess: () => {
      toast.success(`Successfully marked attendance for ${scannedIds.length} students!`);
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['existing-attendance']);
      setScannedIds([]);
    },
    onError: (err) => {
      toast.error('Failed to submit bulk attendance. Please try again.');
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
      <div className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <div>
          <h3 className="font-extrabold text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <QrCode size={18} />
            </div>
            Queue Scanner
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Scan continuously and save IDs locally. Then submit all of them at once.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 relative group">
          <QRScanner onScan={handleScan} bulkMode={true} />
        </div>
      </div>
      
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
        <div className="grid grid-cols-1 gap-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <AttendanceFilter 
            filters={filters} 
            setFilters={setFilters} 
            terms={terms} 
            showDate={true} 
          />
          <div className="w-full flex justify-end mt-4">
            <Button 
              disabled={scannedIds.length === 0 || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg shadow-primary/20 font-bold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {submitMutation.isPending ? 'Submitting...' : `Submit Batch (${scannedIds.length})`}
            </Button>
          </div>
        </div>

        <div className="min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Scan Queue
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 py-0.5 px-2.5 rounded-full text-xs font-black">
                {scannedIds.length}
              </span>
            </h4>
            {scannedIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setScannedIds([])} className="text-xs text-slate-500 hover:text-red-500 h-6 px-2">
                Clear All
              </Button>
            )}
          </div>
          
          {scannedIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 transition-all">
              <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-500">Camera is ready</p>
              <p className="text-xs text-slate-400">Scan QR codes to add to queue</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {scannedIds.map((id, idx) => (
                <li key={`${id}-${idx}`} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-bold font-mono tracking-wider text-slate-800 dark:text-slate-200 text-lg block leading-none">
                        {id}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Pending Submit</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeScannedId(id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Class/Section Filter Tab
// ─────────────────────────────────────────────────────────────────────────────
const flattenStudent = (s) => {
  if (!s) return s;
  const details = s.details?.studentDetails || s.studentDetails || {};
  const academic = s.details?.academicInfo || s.academicInfo || s.academic_info || {};
  const flat = { ...s, ...details, ...academic, id: s.id }; // Ensure ID is preserved
  
  // Normalize objects
  flat.class = flat.class || s.class;
  flat.section = flat.section || s.section;
  
  // Normalize roll number
  flat.roll_no = flat.roll_no || flat.roll_number || flat.candidate_id || flat.trainee_id || flat.reg_number || '';
  
  return flat;
};

function ClassAttendanceTab({ terms, type = 'school' }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    date: new Date().toISOString().slice(0, 10),
  });
  
  const [attendanceState, setAttendanceState] = useState({});

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });

  // Fetch student roster
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-for-attendance', filters.class_id, filters.section_id, filters.academic_year_id],
    queryFn: async () => {
      const classList = classesData?.data?.rows ?? classesData?.data ?? [];
      const selectedClass = classList.find(c => String(c.id) === String(filters.class_id));

      const enrich = (stu, section = null) => {
        const flat = flattenStudent(stu);
        return {
          ...flat,
          class: flat.class || selectedClass,
          section: flat.section || section || (selectedClass?.sections?.find(sec => String(sec.id) === String(flat.section_id)))
        };
      };

      // Try bulk fetch for the whole class if no section is selected
      if (!filters.section_id) {
         try {
           const res = await studentService.getAll({ 
             academic_year_id: filters.academic_year_id,
             class_id: filters.class_id,
             limit: 1000
           }, type);
           const rows = res?.data?.rows ?? res?.data ?? [];
           return { data: { rows: rows.map(r => enrich(r)) } };
         } catch (err) {
           console.warn("Class-wide fetch failed, using section parallel fetch", err);
         }
      }

      // Fallback: Fetch by specific section
      if (filters.section_id) {
        const res = await studentService.getAll({ 
          academic_year_id: filters.academic_year_id,
          class_id: filters.class_id, 
          section_id: filters.section_id,
          limit: 1000
        }, type);
        const rows = res?.data?.rows ?? res?.data ?? [];
        const currentSec = selectedClass?.sections?.find(sec => String(sec.id) === String(filters.section_id));
        return { data: { rows: rows.map(r => enrich(r, currentSec)) } };
      }
      
      // Parallel section fetch (last resort)
      const targetSections = selectedClass?.sections || [];
      const promises = targetSections.map(sec => studentService.getAll({
          academic_year_id: filters.academic_year_id,
          class_id: filters.class_id,
          section_id: sec.id,
          limit: 1000
      }, type));
      
      const results = await Promise.all(promises);
      let allStudents = [];
      results.forEach((res, idx) => {
          const rows = res?.data?.rows ?? res?.data ?? [];
          allStudents = [...allStudents, ...rows.map(r => enrich(r, targetSections[idx]))];
      });
      return { data: { rows: allStudents } };
    },
    enabled: !!filters.class_id && !!classesData,
  });

  // Fetch Existing Attendance for the selected criteria
  const { data: existingAttendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['existing-attendance', filters.class_id, filters.section_id, filters.date],
    queryFn: async () => {
      const res = await studentAttendanceService.getAttendance({
        class_id: filters.class_id,
        section_id: filters.section_id === '' ? undefined : filters.section_id,
        date: filters.date,
        limit: 1000
      });
      return res?.data?.rows ?? res?.data ?? [];
    },
    enabled: !!filters.class_id && !!filters.date
  });

  const students = studentsData?.data?.rows ?? studentsData?.data ?? [];

  // Update attendanceState whenever students OR existing attendance data is loaded
  useEffect(() => {
    if (students.length > 0) {
      const newState = {};
      
      // 1. Fetch existing attendance records from database
      const existingRecords = existingAttendanceData || [];
      existingRecords.forEach(rec => {
        if (students.find(s => s.id === rec.student_id)) {
          newState[rec.student_id] = rec.status;
        }
      });
      
      setAttendanceState(newState);
    } else {
      setAttendanceState({});
    }
  }, [studentsData, existingAttendanceData, filters.date]);

  const markAll = (status) => {
    const nextState = {};
    students.forEach(s => { nextState[s.id] = status; });
    setAttendanceState(nextState);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Only include students that have a status set (status must be truthy)
      const records = Object.entries(attendanceState)
        .filter(([_, status]) => !!status) 
        .map(([student_id, status]) => {
          const student = students.find(s => s.id === student_id);
          return {
            student_id,
            roll_no: student?.roll_no,
            class_id: student?.class_id || student?.class?.id || filters.class_id,
          section_id: student?.section_id || student?.section?.id || filters.section_id,
          status,
          remarks: ''
        };
      });

      const payload = {
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        section_id: filters.section_id,
        date: filters.date,
        type: 'regular',
        skip_existing: true,
        records
      };

      console.log('API Request [studentAttendanceService.bulkMarkAttendance]:');
      console.log('Payload:', payload);

      const response = await studentAttendanceService.bulkMarkAttendance(payload);
      
      console.log('API Response:', response);
      return response;
    },
    onSuccess: () => {
      toast.success('Attendance submitted successfully!');
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['existing-attendance']);
    },
    onError: (err) => {
      toast.error('Failed to submit attendance.');
      console.error(err);
    }
  });

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    Object.values(attendanceState).forEach(val => {
      if (counts[val] !== undefined) counts[val]++;
    });
    return counts;
  }, [attendanceState]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold tracking-tight">Bulk Class Mark</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Filter students by {terms.class || 'class'} and {terms.section || 'section'} to mark bulk attendance.</p>
        </div>
        
        <AttendanceFilter 
          filters={filters} 
          setFilters={setFilters} 
          terms={terms} 
          showDate={true} 
        />
      </div>

      {!filters.class_id ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No {terms.class || 'Class'} Selected</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please select a {terms.class || 'class'} from the filters above to load the student list.</p>
        </div>
      ) : (isLoadingStudents || isLoadingAttendance) ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-pulse">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Loading records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold">No Students Found</h3>
          <p className="text-slate-500">There are no students matching the selected {terms.class} and {terms.section}.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex flex-col lg:flex-row items-center justify-between bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-6">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 divide-x divide-slate-200 dark:divide-slate-800 w-full lg:w-auto">
              <div className="pl-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{students.length}</p>
              </div>
              <div className="pl-6">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Present</p>
                <p className="text-2xl font-black text-emerald-500 leading-none">{stats.present}</p>
              </div>
              <div className="pl-6 hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Absent</p>
                <p className="text-2xl font-black text-red-500 leading-none">{stats.absent}</p>
              </div>
              <div className="pl-6 hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Late</p>
                <p className="text-2xl font-black text-amber-500 leading-none">{stats.late}</p>
              </div>
              <div className="pl-6 hidden lg:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Leave</p>
                <p className="text-2xl font-black text-blue-500 leading-none">{stats.leave}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
              <Button onClick={() => markAll('present')} variant="outline" className="flex-1 sm:flex-none border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-700 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40">
                Mark All Present
              </Button>
              <Button onClick={() => markAll('absent')} variant="outline" className="flex-1 sm:flex-none border-red-200 bg-red-50/50 hover:bg-red-100 hover:text-red-700 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40">
                All Absent
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Student Details</th>
                    <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs w-[130px]">Reg / Roll No</th>
                    <th className="px-5 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-xs min-w-[320px]">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {students.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800 shrink-0">
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{s.first_name} {s.last_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {s.class?.name || 'No Class'}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                                {s.section?.name || 'No Section'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-[9px] uppercase font-bold tracking-tighter">Reg</span>
                            <span className="text-slate-600 dark:text-slate-400 font-semibold">{s.registration_no || s.id.substring(0,8)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary/70 text-[9px] uppercase font-bold tracking-tighter">Roll</span>
                            <span className="text-primary dark:text-primary-foreground font-black text-sm">{s.roll_no || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex sm:inline-flex flex-wrap justify-end rounded-2xl sm:p-1 gap-1.5 sm:gap-1 sm:bg-slate-100/80 sm:dark:bg-slate-900/80 sm:border border-slate-200 dark:border-slate-800 sm:backdrop-blur-sm sm:shadow-inner">
                          {[
                            { id: 'present', color: 'emerald' },
                            { id: 'late', color: 'amber' },
                            { id: 'absent', color: 'red' },
                            { id: 'leave', color: 'blue' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setAttendanceState(prev => ({ ...prev, [s.id]: opt.id }))}
                              className={`flex-1 sm:flex-none px-4 py-2 sm:px-4 sm:py-1.5 rounded-xl text-xs font-black uppercase transition-all duration-300
                                ${attendanceState[s.id] === opt.id 
                                  ? opt.id === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20'
                                    : opt.id === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-500/20'
                                    : opt.id === 'leave' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-600/20'
                                    : 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-500/20'
                                  : 'bg-slate-100 sm:bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:bg-slate-800 sm:dark:bg-transparent dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700'
                                }
                              `}
                            >
                              {opt.id}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sticky bottom-4 w-full flex justify-end z-10 px-2 sm:px-0">
            <div className="w-full sm:w-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 sm:pl-6 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-4 animate-bounce-in">
              <div className="hidden md:flex flex-col text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Ready to save <span className="text-primary">{students.length}</span> records
                </p>
              </div>
              <Button 
                onClick={() => submitMutation.mutate()} 
                disabled={submitMutation.isPending} 
                className="w-full sm:w-auto h-12 px-10 rounded-xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-tight"
              >
                <Save className="w-5 h-5 mr-2" />
                {submitMutation.isPending ? 'Saving...' : 'Confirm & Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Student Search Tab
// ─────────────────────────────────────────────────────────────────────────────
function StudentSearchTab({ terms, type = 'school' }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('present');
  const [leaveType, setLeaveType] = useState('sick_leave');

  // Fetch current status for selected student and date
  const { data: currentStatusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['student-current-status', selectedStudent?.id, date],
    queryFn: async () => {
      const res = await studentAttendanceService.getAttendance({
        student_id: selectedStudent.id,
        date: date,
        limit: 1
      });
      return res?.data?.rows?.[0] ?? res?.data?.[0] ?? null;
    },
    enabled: !!selectedStudent && !!date
  });

  // Update status when currentStatusData changes
  useEffect(() => {
    if (currentStatusData) {
      setStatus(currentStatusData.status);
      if (currentStatusData.leave_type) setLeaveType(currentStatusData.leave_type);
    } else {
      setStatus('present'); // Reset if no record found
    }
  }, [currentStatusData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['student-search', debouncedSearch, type],
    queryFn: async () => {
      const res = await studentService.getAll({ search: debouncedSearch, limit: 10 }, type);
      const rows = res?.data?.rows ?? res?.data ?? [];
      const flat = rows.map(s => flattenStudent(s));
      return { data: { rows: flat } };
    },
    enabled: debouncedSearch.length >= 2
  });

  const students = studentsData?.data?.rows ?? studentsData?.data ?? [];

  const markMutation = useMutation({
    mutationFn: async (payload) => {
      console.log('MARK_ATTENDANCE_PAYLOAD:', payload);
      const res = await studentAttendanceService.markAttendance(payload);
      return res;
    },
    onSuccess: () => {
      toast.success(`Marked as ${status} for ${selectedStudent.first_name}!`);
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['existing-attendance']);
      queryClient.invalidateQueries(['student-current-status']);
      setSelectedStudent(null);
      setSearch('');
    },
    onError: (err) => {
      toast.error('Failed: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSubmit = () => {
    const payload = {
      student_id: selectedStudent.id,
      roll_no: selectedStudent.roll_no,
      class_id: selectedStudent.class_id || selectedStudent.class?.id,
      section_id: selectedStudent.section_id || selectedStudent.section?.id,
      date,
      status,
      leave_type: status === 'leave' ? leaveType : null,
      type: 'manual'
    };
    markMutation.mutate(payload);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Search Student</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            autoFocus
            className="pl-10 h-12 text-lg rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20"
            placeholder="Search by name or reg number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === '') setSelectedStudent(null);
            }}
          />
        </div>
        
        {isLoading && <p className="text-[10px] uppercase font-bold text-slate-400 animate-pulse mt-2 ml-1">Searching database...</p>}
        
        {debouncedSearch.length >= 2 && !isLoading && students.length === 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-3">
            <AlertCircle size={16} />
            <p className="text-sm font-semibold">No results for "{debouncedSearch}"</p>
          </div>
        )}
        
        {debouncedSearch.length >= 2 && students.length > 0 && !selectedStudent && (
          <ul className="mt-2 bg-white dark:bg-slate-900 border rounded-xl shadow-2xl overflow-hidden border-slate-200 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
            {students.map(s => (
              <li 
                key={s.id} 
                className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between group transition-colors"
                onClick={() => setSelectedStudent(s)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs ring-1 ring-indigo-200/50">
                    {s.first_name?.[0]}{s.last_name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary transition-colors">{s.first_name || s.name} {s.last_name || ''}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                       Roll: <span className="text-primary">{s.roll_no || 'N/A'}</span> • {s.class?.name || s.className || 'No Class'} {s.section?.name || s.sectionName ? `(${s.section?.name || s.sectionName})` : ''}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-lg h-8 px-4 text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">Select</Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedStudent && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          
          <button 
            onClick={() => setSelectedStudent(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-10"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-5 mb-8 border-b pb-6 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black text-2xl shadow-sm ring-1 ring-emerald-200/50">
              {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1 group-active:text-primary transition-colors">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                   {selectedStudent.class?.name || selectedStudent.className || 'No Class'}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                   {selectedStudent.section?.name || selectedStudent.sectionName || 'No Section'}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-widest border border-primary/20">
                   Roll: {selectedStudent.roll_no || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <DatePickerField label="Effective Date" value={date} onChange={setDate} />
            
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                Marking Status
                {status === 'leave' && <span className="text-[10px] text-blue-500 animate-pulse">Select Type Below</span>}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'present', label: 'Present', color: 'bg-emerald-500' },
                  { id: 'late', label: 'Late', color: 'bg-amber-500' },
                  { id: 'absent', label: 'Absent', color: 'bg-red-500' },
                  { id: 'leave', label: 'Leave', color: 'bg-blue-600' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`p-4 rounded-2xl border-2 font-black uppercase tracking-wider text-[10px] transition-all
                      ${status === opt.id 
                        ? `${opt.color} text-white border-transparent shadow-lg scale-[1.02] ring-4 ring-${opt.color.split('-')[1]}-500/10`
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {status === 'leave' && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500 mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                   <SelectField
                    label="Type of Leave"
                    options={[
                      { value: 'sick_leave', label: 'Sick Leave (Medical)' },
                      { value: 'casual_leave', label: 'Casual Leave' },
                      { value: 'emergency', label: 'Unforeseen Emergency' },
                      { value: 'medical', label: 'Authorized Hospitalization' },
                      { value: 'other', label: 'Standard Leave / Other' }
                    ]}
                    value={leaveType}
                    onChange={setLeaveType}
                  />
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] group" 
              onClick={handleSubmit} 
              disabled={markMutation.isPending}
            >
              {markMutation.isPending ? 'Processing Record...' : (
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="group-hover:rotate-12 transition-transform" />
                  Mark as {status}
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
