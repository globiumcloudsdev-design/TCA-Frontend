// frontend/src/app/(portal)/parent/attendance/page.js

'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, XCircle, Clock, TrendingUp, 
  Filter, ChevronDown, Download, FileText, User, 
  BookOpen, GraduationCap, AlertCircle, Plus, 
  Eye, FileCheck, X, MessageCircle, Phone, Mail,
  BarChart3, PieChart, Activity, Award, Users
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useChildAttendance, useChildDetails } from '@/hooks/useParentPortal';
import { useParentLeaveRequests, useCreateParentLeaveRequest, useParentLeaveBalance } from '@/hooks/useParentPortal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

const STATUS_CONFIG = {
  present: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Present', bg: 'bg-emerald-50' },
  absent:  { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: XCircle, label: 'Absent', bg: 'bg-red-50' },
  late:    { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: Clock, label: 'Late', bg: 'bg-amber-50' },
  half_day: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: Clock, label: 'Half Day', bg: 'bg-blue-50' },
  holiday: { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', icon: Calendar, label: 'Holiday', bg: 'bg-purple-50' }
};

// Leave Request Modal Component
const LeaveRequestModal = ({ isOpen, onClose, child, onSubmit, isLoading, leaveBalances }) => {
  const [formData, setFormData] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    child_id: ''
  });

  useEffect(() => {
    if (child) {
      setFormData(prev => ({ ...prev, child_id: child.id }));
    }
  }, [child]);
  
  useEffect(() => {
    if (leaveBalances && Object.keys(leaveBalances).length > 0 && !formData.leave_type_id) {
      setFormData(prev => ({ ...prev, leave_type_id: Object.keys(leaveBalances)[0] }));
    }
  }, [leaveBalances, formData.leave_type_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const start = new Date(formData.from_date);
    const end = new Date(formData.to_date);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    onSubmit({
      ...formData,
      number_of_days: days > 0 ? days : 1
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Request Leave for {child?.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {leaveBalances && Object.entries(leaveBalances).map(([id, balance]) => (
                <option key={id} value={id}>{balance.leave_type_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please provide reason for leave..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Leave Balance Card Component
const LeaveBalanceCard = ({ balances }) => {
  if (!balances || Object.keys(balances).length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-indigo-600" />
        Leave Balance
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.values(balances).map((balance, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">{balance.leave_type_name}</p>
            <p className="text-2xl font-bold text-slate-800">{balance.remaining_days}</p>
            <p className="text-[10px] text-slate-400">Used: {balance.used_days}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Leave Requests Component
const RecentLeaveRequests = ({ requests, onViewAll }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="text-center py-6">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No leave requests found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Recent Leave Requests
        </h2>
        <button onClick={onViewAll} className="text-xs text-indigo-600 hover:text-indigo-700">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {requests.slice(0, 3).map((req) => (
          <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-800">{req.leaveType?.leave_type_name}</p>
              <p className="text-xs text-slate-500">
                {format(new Date(req.from_date), 'dd MMM')} - {format(new Date(req.to_date), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">{req.number_of_days} days</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Attendance Page Component
export default function ParentAttendancePage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser;
  const t = getPortalTerms(parent?.institute_type);
  const children = parent?.children || [];

  const [selectedChild, setSelectedChild] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, subject, monthly
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAllLeaves, setShowAllLeaves] = useState(false);

  const child = children[selectedChild];
  
  // Fetch attendance with filters
  const { data: attendanceData, isLoading: attendanceLoading, refetch } = useChildAttendance(
    child?.id,
    {
      month: selectedMonth + 1,
      year: selectedYear,
      subject_id: selectedSubject !== 'all' ? selectedSubject : null
    }
  );

  // Fetch leave requests
  const { data: leaveRequests } = useParentLeaveRequests({ child_id: child?.id });
  const { data: leaveBalance } = useParentLeaveBalance(child?.id);
  const createLeaveMutation = useCreateParentLeaveRequest();

  const attendance = attendanceData?.data;
  
  // Get available months for filtering
  const availableMonths = attendance?.monthly_history?.map(m => ({
    month: new Date(m.month).getMonth(),
    year: new Date(m.month).getFullYear(),
    name: m.month
  })) || [];

  // Get unique subjects from attendance data
  const subjects = attendance?.subject_wise?.map(s => ({
    id: s.subject_id,
    name: s.subject
  })) || [];

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    refetch();
  };

  const handleExportAttendance = () => {
    if (!attendance?.all_records) return;
    
    const csvContent = [
      ['Date', 'Day', 'Status', 'Subject', 'Check In', 'Check Out', 'Remarks'].join(','),
      ...attendance.all_records.map(record => [
        record.date_formatted,
        record.day,
        record.status,
        record.subject || '',
        record.check_in_time || '',
        record.check_out_time || '',
        record.remarks || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${child?.name}_${selectedYear}_${selectedMonth + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLeaveRequest = async (data) => {
    try {
      await createLeaveMutation.mutateAsync({
        ...data
      });
      setShowLeaveModal(false);
    } catch (error) {
      console.error('Leave request failed:', error);
    }
  };

  if (!child) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No child data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Attendance & Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track attendance, request leaves, and monitor your child's progress</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Request Leave
          </button>
          <button
            onClick={handleExportAttendance}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedChild === i
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Child Info Banner */}
      {child && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{child.name}</h2>
              <p className="text-sm text-slate-600">
                Registration: {child.registration_no} | Class: {child.class} | Section: {child.section}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {attendance?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">Total Days</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{attendance.summary.total_days}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-600">Present</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">{attendance.summary.present}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600">Absent</span>
            </div>
            <p className="text-2xl font-extrabold text-red-700">{attendance.summary.absent}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-600">Late</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-700">{attendance.summary.late}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600">Attendance %</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-700">{attendance.summary.percentage}%</p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {['calendar', 'subject', 'monthly'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm capitalize transition ${
                    viewMode === mode ? 'bg-white shadow text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value), selectedYear)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{format(new Date(selectedYear, i, 1), 'MMMM')}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => handleMonthChange(selectedMonth, parseInt(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {attendanceLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading attendance data...</p>
        </div>
      )}

      {/* View Modes */}
      {!attendanceLoading && attendance && (
        <>
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4">
                {format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy')} — Daily Attendance
              </h2>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
                  const endDate = endOfMonth(new Date(selectedYear, selectedMonth));
                  const days = eachDayOfInterval({ start: startDate, end: endDate });
                  const startDayOfWeek = startDate.getDay();
                  
                  const blanks = Array(startDayOfWeek).fill(null);
                  const allDays = [...blanks, ...days];
                  
                  return allDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`blank-${idx}`} className="aspect-square p-1" />;
                    }
                    
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const record = attendance.all_records?.find(r => r.date === dateStr);
                    const status = record?.status || 'absent';
                    const config = STATUS_CONFIG[status] || STATUS_CONFIG.absent;
                    const isCurrentMonth = isSameMonth(day, new Date(selectedYear, selectedMonth));
                    
                    return (
                      <div
                        key={dateStr}
                        className={`aspect-square p-1 rounded-lg ${config.bg} ${!isCurrentMonth ? 'opacity-40' : ''}`}
                      >
                        <div className="text-center">
                          <span className={`text-xs font-medium ${isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                            {format(day, 'd')}
                          </span>
                          {record && (
                            <div className="mt-1">
                              {config.icon && <config.icon className="w-3 h-3 mx-auto" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-slate-100">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                    {config.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject-wise View */}
          {viewMode === 'subject' && attendance.subject_wise?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Subject-wise Attendance
              </h2>
              <div className="space-y-4">
                {attendance.subject_wise.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{subject.subject}</span>
                      <span className="text-slate-500">{subject.percentage}%</span>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500 mb-1">
                      <span>Present: {subject.present}</span>
                      <span>Absent: {subject.absent}</span>
                      <span>Late: {subject.late}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly History View */}
          {viewMode === 'monthly' && attendance.monthly_history?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Monthly Attendance History
              </h2>
              <div className="space-y-4">
                {attendance.monthly_history.map((month) => (
                  <div key={month.month_key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{month.month}</span>
                      <span className={`font-bold ${
                        month.percentage >= 90 ? 'text-emerald-600' :
                        month.percentage >= 75 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {month.percentage}%
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mb-1">
                      <span>Present: {month.present}</span>
                      <span>Absent: {month.absent}</span>
                      <span>Late: {month.late}</span>
                      <span>Total: {month.total}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          month.percentage >= 90 ? 'bg-emerald-500' :
                          month.percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${month.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Leave Balance and Recent Requests */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LeaveBalanceCard balances={leaveBalance?.data} />
        <RecentLeaveRequests 
          requests={leaveRequests?.data} 
          onViewAll={() => setShowAllLeaves(true)}
        />
      </div>

      {/* Class-wise Stats (if available) */}
      {attendance?.class_wise?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Class-wise Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-600">Class</th>
                  <th className="text-center py-2 text-slate-600">Total</th>
                  <th className="text-center py-2 text-slate-600">Present</th>
                  <th className="text-center py-2 text-slate-600">Absent</th>
                  <th className="text-center py-2 text-slate-600">Late</th>
                  <th className="text-right py-2 text-slate-600">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {attendance.class_wise.map((cls) => (
                  <tr key={cls.class} className="border-b border-slate-50">
                    <td className="py-2 font-medium">{cls.class}</td>
                    <td className="text-center">{cls.total}</td>
                    <td className="text-center text-emerald-600">{cls.present}</td>
                    <td className="text-center text-red-600">{cls.absent}</td>
                    <td className="text-center text-amber-600">{cls.late}</td>
                    <td className="text-right font-bold">{cls.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        child={child}
        onSubmit={handleLeaveRequest}
        isLoading={createLeaveMutation.isPending}
        leaveBalances={leaveBalance?.data}
      />

      {/* All Leave Requests Modal */}
      {showAllLeaves && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">All Leave Requests</h2>
              <button onClick={() => setShowAllLeaves(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {leaveRequests?.data?.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800 capitalize">{req.leaveType?.leave_type_name}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(req.from_date), 'dd MMM yyyy')} - {format(new Date(req.to_date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{req.reason}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {req.remarks && (
                    <p className="text-xs text-slate-500 mt-2 border-t border-slate-200 pt-2">
                      Remarks: {req.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}