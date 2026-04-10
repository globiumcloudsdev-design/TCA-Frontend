// MarkAttendanceModal.jsx - A comprehensive modal for marking student attendance with multiple modes (QR scan, class-wise, student search) and detailed feedback mechanisms.
//src/components/attendance/MarkAttendanceModal.jsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Users, UserSquare, CheckCircle, Search, Save, AlertCircle, Calendar, X, Trash2, UserCheck, Clock, UserX, Gift, ChevronDown, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField, CreatableSelectField, DatePickerField, AppModal } from '@/components/common';
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
  const { terms, instituteId } = useInstituteConfig();
  const [activeTab, setActiveTab] = useState(defaultMode);

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
      title={isScanOnly ? "📱 QR Attendance Scanner" : "📝 Manual Attendance"} 
      description={isScanOnly ? "Rapidly scan student ID cards to mark attendance instantly" : "Mark bulk attendance by class or search for individual students"}
      size="xl"
      className="max-w-6xl"
    >
      <div className="space-y-6">
        {isScanOnly ? (
          <InstantScanTab instituteId={instituteId} type={type} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 gap-2 w-full h-auto mb-6 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl">
              <TabsTrigger value="bulk-scan" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all">
                <QrCode className="w-4 h-4 mr-2" /> Bulk Scan Mode
              </TabsTrigger>
              <TabsTrigger value="class" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all">
                <Users className="w-4 h-4 mr-2" /> By {terms.class || 'Class'}
              </TabsTrigger>
              <TabsTrigger value="student" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all">
                <UserSquare className="w-4 h-4 mr-2" /> By {terms.student || 'Student'}
              </TabsTrigger>
            </TabsList>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <TabsContent value="bulk-scan" className="mt-0 outline-none">
                <BulkScanTab terms={terms} instituteId={instituteId} type={type} />
              </TabsContent>

              <TabsContent value="class" className="mt-0 outline-none">
                <ClassAttendanceTab terms={terms} type={type} instituteId={instituteId} />
              </TabsContent>

              <TabsContent value="student" className="mt-0 outline-none">
                <StudentSearchTab terms={terms} type={type} instituteId={instituteId} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </AppModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Instant Scan Tab - Direct API Calls with Student Details
// ─────────────────────────────────────────────────────────────────────────────
function InstantScanTab({ instituteId, type }) {
  const [scanHistory, setScanHistory] = useState([]);
  const [scanType, setScanType] = useState('regular');
  const [scanDate, setScanDate] = useState(new Date().toISOString().slice(0, 10));
  const [showDetails, setShowDetails] = useState(null);
  
  const todayDate = new Date().toISOString().slice(0, 10);

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await studentService.getById(studentId, instituteId, type);
      const student = response?.data || response;
      
      if (student) {
        const details = student.details?.studentDetails || student.studentDetails || {};
        const activeSession = details.academicSessions?.find(s => s.status === 'active') || {};
        
        return {
          id: student.id,
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          roll_no: activeSession.roll_no || details.roll_no || student.roll_no || 'N/A',
          class_name: activeSession.class_name || details.class_name || student.class_name || 'N/A',
          section_name: activeSession.section_name || details.section_name || student.section_name || 'N/A',
          registration_no: student.registration_no || 'N/A',
          avatar: student.avatar_url,
          status: 'pending'
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      return null;
    }
  };

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    const lastScan = scanHistory[0];
    if (lastScan && lastScan.id === studentId && (Date.now() - lastScan.timestamp < 3000)) {
      return false; 
    }
    
    try {
      // First fetch student details
      const studentInfo = await fetchStudentDetails(studentId);
      
      const response = await studentAttendanceService.scanQR({
        student_id: studentId,
        date: scanDate,
        type: scanType
      });
      
      const status = response?.data?.status || 'present';
      
      const scanRecord = {
        id: studentId,
        student: studentInfo,
        status: 'success',
        attendance_status: status,
        timestamp: Date.now(),
        message: `Marked as ${status.toUpperCase()}`
      };
      
      setScanHistory(prev => [scanRecord, ...prev].slice(0, 50));
      setShowDetails(scanRecord);
      
      toast.success(`${studentInfo?.name || 'Student'} marked as ${status}!`);
      
      setTimeout(() => setShowDetails(null), 3000);
      return true; 
    } catch(err) {
      const errorMsg = err.response?.data?.message || 'Failed to mark attendance';
      setScanHistory(prev => [{ 
        id: studentId, 
        status: 'error', 
        error: errorMsg, 
        timestamp: Date.now(),
        student: null
      }, ...prev].slice(0, 50));
      
      toast.error(errorMsg);
      return false;
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setShowDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section - Responsive */}
      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">📅 Date</label>
            <DatePickerField 
              value={scanDate} 
              onChange={setScanDate}
              className="w-full"
              disableFutureDates
            />
          </div>
          
          <CreatableSelectField
            label="📋 Type"
            options={[
              { value: 'regular', label: '📚 Regular Class' },
              { value: 'exam', label: '📝 Examination' },
              { value: 'extra_class', label: '⭐ Extra Class' },
              { value: 'event', label: '🎉 Special Event' }
            ]}
            value={scanType}
            onChange={(val) => setScanType(val)}
            placeholder="Select or create..."
          />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">⏰ Time</label>
            <div className="px-3 py-2.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-bold text-emerald-600">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              <p className="text-[10px] text-slate-500">Current time</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">📊 Stats</label>
            <div className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-2xl font-black text-emerald-600">{scanHistory.filter(s => s.status === 'success').length}</p>
              <p className="text-[10px] text-emerald-600">Marked today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                Instant QR Scanner
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Scan automatically marks attendance
              </p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {scanDate}
              </p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-inner bg-black/5 p-1.5 border border-slate-200 dark:border-slate-700">
            <QRScanner 
              onScan={handleScan} 
              bulkMode={true}
              instituteId={instituteId}
              type={type}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 text-center">
            <button
              onClick={clearHistory}
              disabled={scanHistory.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl transition-all shadow-md disabled:shadow-none"
            >
              {scanHistory.filter(s => s.status === 'success').length > 0 ? (
                <><Trash2 size={14} className="mr-2 inline" /> Clear History ({scanHistory.filter(s => s.status === 'success').length})</>
              ) : (
                <>No scans yet</>
              )}
            </button>
          </div>
        </div>
        
        {/* History Section */}
        <div className="space-y-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Clock size={18} className="text-emerald-500" />
                Recent Scans
              </h4>
              <p className="text-xs text-slate-500">Last 50 scans</p>
            </div>
          </div>
          
          {scanHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950">
              <QrCode className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Ready to Scan</p>
              <p className="text-xs text-slate-400 text-center mt-1">Scan QR codes to start marking attendance</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {scanHistory.map((item, idx) => (
                <div 
                  key={`${item.id}-${item.timestamp}-${idx}`} 
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                    item.status === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  } ${showDetails?.id === item.id ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''}`}
                  onClick={() => setShowDetails(item)}
                >
                  {item.student ? (
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                        {item.student.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.student.name}
                          </p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.attendance_status === 'present' ? 'bg-emerald-500 text-white' :
                            item.attendance_status === 'late' ? 'bg-amber-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {item.attendance_status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                            Roll: {item.student.roll_no}
                          </span>
                          <span className="text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {item.student.class_name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <XCircle size={20} className="text-red-500 shrink-0" />
                      <div>
                        <p className="font-mono text-sm font-bold">{item.id}</p>
                        <p className="text-xs text-red-600">{item.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Floating Details Modal */}
          {showDetails && showDetails.student && (
            <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-l-4 border-emerald-500 p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {showDetails.student.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{showDetails.student.name}</p>
                      <button onClick={() => setShowDetails(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
                      <div>
                        <p className="text-slate-500">Roll No</p>
                        <p className="font-bold font-mono">{showDetails.student.roll_no}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Class</p>
                        <p className="font-bold">{showDetails.student.class_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Section</p>
                        <p className="font-bold">{showDetails.student.section_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className={`font-bold ${
                          showDetails.attendance_status === 'present' ? 'text-emerald-600' :
                          showDetails.attendance_status === 'late' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {showDetails.attendance_status?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Bulk Scan Tab - Queue based with Student Details
// ─────────────────────────────────────────────────────────────────────────────
function BulkScanTab({ terms, instituteId, type }) {
  const [scannedStudents, setScannedStudents] = useState([]);
  const scannedIdsRef = useRef(new Set());
  const [scanType, setScanType] = useState('regular');
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [showDetails, setShowDetails] = useState(null);
  const queryClient = useQueryClient();

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await studentService.getById(studentId, instituteId, type);
      const student = response?.data || response;
      
      if (student) {
        const details = student.details?.studentDetails || student.studentDetails || {};
        const activeSession = details.academicSessions?.find(s => s.status === 'active') || {};
        
        return {
          id: student.id,
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          roll_no: activeSession.roll_no || details.roll_no || student.roll_no || 'N/A',
          class_name: activeSession.class_name || details.class_name || student.class_name || 'N/A',
          section_name: activeSession.section_name || details.section_name || student.section_name || 'N/A',
          registration_no: student.registration_no || 'N/A'
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      return null;
    }
  };

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    if (scannedIdsRef.current.has(studentId)) {
      toast.warning('Student already in queue');
      return false; 
    }
    
    const studentInfo = await fetchStudentDetails(studentId);
    
    if (studentInfo) {
      setScannedStudents(prev => [...prev, { ...studentInfo, scannedAt: Date.now() }]);
      scannedIdsRef.current.add(studentId);
      setShowDetails(studentInfo);
      toast.success(`✅ ${studentInfo.name} added to queue`);
      
      setTimeout(() => setShowDetails(null), 2000);
      return true;
    } else {
      toast.error('Student not found');
      return false;
    }
  };

  const removeStudent = (id) => {
    setScannedStudents(prev => prev.filter(s => s.id !== id));
    scannedIdsRef.current.delete(id);
    toast.info('Removed from queue');
  };

  const clearAll = () => {
    setScannedStudents([]);
    scannedIdsRef.current.clear();
    toast.info('Queue cleared');
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...(filters.academic_year_id ? { academic_year_id: filters.academic_year_id } : {}),
        ...(filters.class_id ? { class_id: filters.class_id } : {}),
        ...(filters.section_id ? { section_id: filters.section_id } : {}),
        date: filters.date,
        type: scanType,
        skip_existing: true,
        records: scannedStudents.map(s => ({ student_id: s.id, status: 'present', remarks: '' })),
      };
      
      const response = await studentAttendanceService.bulkMarkAttendance(payload);
      return response;
    },
    onSuccess: (data) => {
      toast.success(`✅ Successfully marked attendance for ${scannedStudents.length} students!`);
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['existing-attendance']);
      setScannedStudents([]);
      scannedIdsRef.current.clear();
    },
    onError: (err) => {
      toast.error('Failed to submit bulk attendance. Please try again.');
      console.error(err);
    }
  });

  // Fetch classes for dropdown
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });

  const classes = classesData?.data?.rows || classesData?.data || [];

  // Get sections for selected class
  const selectedClass = classes.find(c => String(c.id) === String(filters.class_id));
  const sections = selectedClass?.sections || [];

  return (
    <div className="space-y-6">
      {/* Filters Section - Responsive */}
      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Row 1: Date, Class, Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
            <DatePickerField 
              value={filters.date} 
              onChange={(date) => setFilters({ ...filters, date })}
              className="w-full"
              disableFutureDates
            />
          </div>
          
          <SelectField
            label="Class"
            placeholder="Select Class"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={filters.class_id}
            onChange={(val) => setFilters({ ...filters, class_id: val, section_id: '' })}
            className="w-full"
          />
          
          <SelectField
            label="Section"
            placeholder="Select Section"
            options={sections.map(s => ({ value: s.id, label: s.name }))}
            value={filters.section_id}
            onChange={(val) => setFilters({ ...filters, section_id: val })}
            disabled={!filters.class_id}
            className="w-full"
          />
        </div>

        {/* Row 2: Type, Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CreatableSelectField
            label="Type"
            options={[
              { value: 'regular', label: '📚 Regular Class' },
              { value: 'exam', label: '📝 Examination' },
              { value: 'extra_class', label: '⭐ Extra Class' },
              { value: 'event', label: '🎉 Special Event' }
            ]}
            value={scanType}
            onChange={(val) => setScanType(val)}
            placeholder="Select or create..."
          />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stats</label>
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-emerald-600">{scannedStudents.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Students in queue</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              Queue Scanner
            </h3>
            <p className="text-sm text-slate-500">Scan students → Add to queue → Submit batch</p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-inner bg-black/5 p-1.5 border border-slate-200 dark:border-slate-700">
            <QRScanner 
              onScan={handleScan} 
              bulkMode={true}
              instituteId={instituteId}
              type={type}
            />
          </div>

          {showDetails && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-200 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  {showDetails.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{showDetails.name}</p>
                  <div className="flex gap-2 text-xs">
                    <span>Roll: {showDetails.roll_no}</span>
                    <span>•</span>
                    <span>{showDetails.class_name} - {showDetails.section_name}</span>
                  </div>
                </div>
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
            </div>
          )}
        </div>
        
        {/* Queue Section */}
        <div className="space-y-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Users size={18} className="text-emerald-500" />
                Scan Queue
              </h4>
              <p className="text-xs text-slate-500">Students ready to submit</p>
            </div>
            {scannedStudents.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                <Trash2 size={14} className="mr-1" /> Clear All
              </Button>
            )}
          </div>
          
          {scannedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950">
              <QrCode className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Queue is empty</p>
              <p className="text-xs text-slate-400 text-center mt-1">Scan student QR codes to<br />add them to the queue</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {scannedStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{student.name}</p>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="text-emerald-600 font-mono">Roll: {student.roll_no}</span>
                        <span className="text-slate-500">{student.class_name}</span>
                        <span className="text-slate-500">{student.section_name}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeStudent(student.id)} 
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {scannedStudents.length > 0 && (
            <Button 
              onClick={() => submitMutation.mutate()} 
              disabled={submitMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {submitMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Submit Batch ({scannedStudents.length})</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Class Attendance Tab
// ─────────────────────────────────────────────────────────────────────────────
function ClassAttendanceTab({ terms, type, instituteId }) {
  const queryClient = useQueryClient();
  const [scanType, setScanType] = useState('regular');
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

  const classes = classesData?.data?.rows || classesData?.data || [];
  const selectedClass = classes.find(c => String(c.id) === String(filters.class_id));
  const sections = selectedClass?.sections || [];

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-for-attendance', filters.class_id, filters.section_id, filters.academic_year_id],
    queryFn: async () => {
      const params = {
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        limit: 1000
      };
      if (filters.section_id) params.section_id = filters.section_id;
      
      const res = await studentService.getAll(params, type);
      const rows = res?.data?.rows ?? res?.data ?? [];
      
      // Enrich with class/section names
      return rows.map(s => {
        const details = s.details?.studentDetails || {};
        const activeSession = details.academicSessions?.find(sess => sess.status === 'active') || {};
        return {
          ...s,
          class_name: activeSession.class_name || details.class_name || selectedClass?.name,
          section_name: activeSession.section_name || details.section_name,
          roll_no: activeSession.roll_no || details.roll_no || s.roll_no
        };
      });
    },
    enabled: !!filters.class_id,
  });

  const { data: existingAttendanceData } = useQuery({
    queryKey: ['existing-attendance', filters.class_id, filters.section_id, filters.date],
    queryFn: async () => {
      const res = await studentAttendanceService.getAttendance({
        class_id: filters.class_id,
        section_id: filters.section_id || undefined,
        date: filters.date,
        limit: 1000
      });
      return res?.data?.rows ?? res?.data ?? [];
    },
    enabled: !!filters.class_id && !!filters.date
  });

  const students = studentsData || [];

  // Hydrate attendance state when students or existing records change
  useEffect(() => {
    if (!existingAttendanceData || !studentsData?.length) return;
    const newState = {};
    existingAttendanceData.forEach(rec => {
      // String comparison to avoid number/string ID mismatch
      if (studentsData.find(s => String(s.id) === String(rec.student_id))) {
        newState[rec.student_id] = rec.status;
      }
    });
    setAttendanceState(newState);
  }, [studentsData, existingAttendanceData]);

  const markAll = (status) => {
    const nextState = {};
    students.forEach(s => { nextState[s.id] = status; });
    setAttendanceState(nextState);
    toast.info(`All students marked as ${status}`);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceState)
        .filter(([_, status]) => !!status)
        .map(([student_id, status]) => ({
          student_id,
          status,
          remarks: ''
        }));

      const payload = {
        ...(filters.academic_year_id ? { academic_year_id: filters.academic_year_id } : {}),
        ...(filters.class_id ? { class_id: filters.class_id } : {}),
        ...(filters.section_id ? { section_id: filters.section_id } : {}),
        date: filters.date,
        type: scanType,
        skip_existing: true,
        records
      };

      return await studentAttendanceService.bulkMarkAttendance(payload);
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
      {/* Filters */}
      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Row 1: Date, Class, Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
            <DatePickerField value={filters.date} onChange={(date) => setFilters({ ...filters, date })} disableFutureDates />
          </div>
          <SelectField
            label="Class"
            placeholder="Select Class"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={filters.class_id}
            onChange={(val) => setFilters({ ...filters, class_id: val, section_id: '' })}
            className="w-full"
          />
          <SelectField
            label="Section"
            placeholder="All Sections"
            options={sections.map(s => ({ value: s.id, label: s.name }))}
            value={filters.section_id}
            onChange={(val) => setFilters({ ...filters, section_id: val })}
            disabled={!filters.class_id}
            className="w-full"
          />
        </div>

        {/* Row 2: Type, Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CreatableSelectField
            label="Type"
            options={[
              { value: 'regular', label: '📚 Regular Class' },
              { value: 'exam', label: '📝 Examination' },
              { value: 'extra_class', label: '⭐ Extra Class' },
              { value: 'event', label: '🎉 Special Event' }
            ]}
            value={scanType}
            onChange={(val) => setScanType(val)}
            placeholder="Select or create..."
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</label>
            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <p className="text-lg font-black text-emerald-600">{stats.present}</p>
                <p className="text-[9px] font-bold text-emerald-600">P</p>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-lg font-black text-red-600">{stats.absent}</p>
                <p className="text-[9px] font-bold text-red-600">A</p>
              </div>
              <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <p className="text-lg font-black text-amber-600">{stats.late}</p>
                <p className="text-[9px] font-bold text-amber-600">L</p>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-lg font-black text-blue-600">{stats.leave}</p>
                <p className="text-[9px] font-bold text-blue-600">LV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {students.length > 0 && (
        <div className="flex gap-3 justify-end">
          <Button onClick={() => markAll('present')} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
            <UserCheck size={16} className="mr-2" /> All Present
          </Button>
          <Button onClick={() => markAll('absent')} variant="outline" className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
            <UserX size={16} className="mr-2" /> All Absent
          </Button>
          <Button onClick={() => markAll('late')} variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100">
            <Clock size={16} className="mr-2" /> All Late
          </Button>
        </div>
      )}

      {/* Students Table */}
      {!filters.class_id ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold">Select a class to load students</p>
        </div>
      ) : isLoadingStudents ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
          <p className="mt-2">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold">No students found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500">Roll No</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-slate-500">{student.class_name} {student.section_name && `- ${student.section_name}`}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{student.roll_no || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {['present', 'late', 'absent', 'leave'].map(status => (
                          <button
                            key={status}
                            onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: status }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                              attendanceState[student.id] === status
                                ? status === 'present' ? 'bg-emerald-500 text-white'
                                  : status === 'late' ? 'bg-amber-500 text-white'
                                  : status === 'absent' ? 'bg-red-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {status === 'present' ? 'P' : status === 'late' ? 'L' : status === 'absent' ? 'A' : 'LV'}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sticky bottom-0 pt-4">
            <Button 
              onClick={() => submitMutation.mutate()} 
              disabled={submitMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg"
            >
              {submitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Attendance</>}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Student Search Tab
// ─────────────────────────────────────────────────────────────────────────────
function StudentSearchTab({ terms, type, instituteId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('present');
  const [leaveType, setLeaveType] = useState('sick_leave');
  const [scanType, setScanType] = useState('regular');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['student-search', debouncedSearch, type],
    queryFn: async () => {
      const res = await studentService.getAll({ search: debouncedSearch, limit: 10 }, type);
      const rows = res?.data?.rows ?? res?.data ?? [];
      // Enrich student details
      return rows.map(s => {
        const details = s.details?.studentDetails || {};
        const activeSession = details.academicSessions?.find(sess => sess.status === 'active') || {};
        return {
          ...s,
          class_name: activeSession.class_name || details.class_name,
          section_name: activeSession.section_name || details.section_name,
          roll_no: activeSession.roll_no || details.roll_no || s.roll_no
        };
      });
    },
    enabled: debouncedSearch.length >= 2
  });

  const students = studentsData || [];

  const { data: currentStatusData } = useQuery({
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

  useEffect(() => {
    if (currentStatusData) {
      setStatus(currentStatusData.status);
      if (currentStatusData.leave_type) setLeaveType(currentStatusData.leave_type);
    } else {
      setStatus('present');
    }
  }, [currentStatusData]);

  const markMutation = useMutation({
    mutationFn: async (payload) => {
      return await studentAttendanceService.markAttendance(payload);
    },
    onSuccess: () => {
      toast.success(`Marked as ${status} for ${selectedStudent.first_name}!`);
      queryClient.invalidateQueries(['attendance']);
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
      date,
      status,
      leave_type: status === 'leave' ? leaveType : null,
      type: scanType
    };
    markMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      <div className="space-y-2">
        <label className="text-sm font-bold">🔍 Search Student</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            autoFocus
            className="pl-10 h-12 rounded-xl"
            placeholder="Search by name, registration number, or roll number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === '') setSelectedStudent(null);
            }}
          />
        </div>
        
        {isLoading && <p className="text-xs text-slate-500 animate-pulse">Searching...</p>}
        
        {debouncedSearch.length >= 2 && !isLoading && students.length === 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-600">
            <p className="text-sm font-semibold">No students found for "{debouncedSearch}"</p>
          </div>
        )}
        
        {debouncedSearch.length >= 2 && students.length > 0 && !selectedStudent && (
          <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
            {students.map(s => (
              <div 
                key={s.id} 
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md cursor-pointer transition-all"
                onClick={() => setSelectedStudent(s)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-lg">
                    {s.first_name?.charAt(0)}{s.last_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{s.first_name} {s.last_name}</p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-emerald-600 font-mono">Roll: {s.roll_no || 'N/A'}</span>
                      <span className="text-slate-500">{s.class_name || 'No Class'}</span>
                      {s.section_name && <span className="text-slate-500">- {s.section_name}</span>}
                    </div>
                  </div>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">Select</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative">
          <button 
            onClick={() => setSelectedStudent(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              {selectedStudent.first_name?.charAt(0)}{selectedStudent.last_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 rounded-full font-mono">
                  Roll: {selectedStudent.roll_no || 'N/A'}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {selectedStudent.class_name || 'No Class'} {selectedStudent.section_name && `- ${selectedStudent.section_name}`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <DatePickerField label="Select Date" value={date} onChange={setDate} disableFutureDates />
            
            <CreatableSelectField
              label="📋 Attendance Type"
              options={[
                { value: 'regular', label: '📚 Regular Class' },
                { value: 'exam', label: '📝 Examination' },
                { value: 'extra_class', label: '⭐ Extra Class' },
                { value: 'event', label: '🎉 Special Event' }
              ]}
              value={scanType}
              onChange={(val) => setScanType(val)}
              placeholder="Select or create..."
            />
            
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-500">Attendance Status</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'present', label: 'Present', icon: UserCheck, color: 'emerald' },
                  { id: 'late', label: 'Late', icon: Clock, color: 'amber' },
                  { id: 'absent', label: 'Absent', icon: UserX, color: 'red' },
                  { id: 'leave', label: 'Leave', icon: Gift, color: 'blue' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      status === opt.id
                        ? `bg-${opt.color}-500 text-white border-transparent shadow-lg`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <opt.icon size={16} className="mx-auto mb-1" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {status === 'leave' && (
              <SelectField
                label="Leave Type"
                options={[
                  { value: 'sick_leave', label: '🤒 Sick Leave' },
                  { value: 'casual_leave', label: '🏠 Casual Leave' },
                  { value: 'emergency', label: '🚨 Emergency' },
                  { value: 'medical', label: '🏥 Medical' }
                ]}
                value={leaveType}
                onChange={setLeaveType}
              />
            )}

            <Button 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg"
              onClick={handleSubmit} 
              disabled={markMutation.isPending}
            >
              {markMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Mark as {status.toUpperCase()}</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}