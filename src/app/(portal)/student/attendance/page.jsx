// 'use client';

// import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
// import { useStudentAttendance } from '@/hooks/useStudentPortal';

// export default function StudentAttendancePage() {
//   const { data: attendanceRes, isLoading } = useStudentAttendance();
//   const attendance = attendanceRes?.data || {};
//   const summary = attendance.summary || {};
//   const records = attendance.records || [];

//   if (isLoading) {
//     return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading attendance...</div>;
//   }

//   return (
//     <div className="space-y-6 max-w-4xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
//           <Calendar className="w-6 h-6 text-emerald-600" /> Attendance
//         </h1>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <SummaryCard label="Total" value={summary.total ?? 0} icon={Calendar} />
//         <SummaryCard label="Present" value={summary.present ?? 0} icon={CheckCircle2} color="text-emerald-600" />
//         <SummaryCard label="Absent" value={summary.absent ?? 0} icon={XCircle} color="text-red-600" />
//         <SummaryCard label="Late" value={summary.late ?? 0} icon={Clock} color="text-amber-600" />
//       </div>

//       <div className="bg-white border rounded-2xl p-5">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="font-semibold text-slate-800">Overall Percentage</h2>
//           <span className="text-2xl font-bold text-emerald-600">{summary.percentage ?? 0}%</span>
//         </div>
//         <div className="w-full bg-slate-100 rounded-full h-3">
//           <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(summary.percentage ?? 0, 100)}%` }} />
//         </div>
//       </div>

//       <div className="bg-white border rounded-2xl p-5">
//         <h2 className="font-semibold text-slate-800 mb-3">Recent Records</h2>
//         {records.length === 0 ? (
//           <p className="text-sm text-slate-500">No attendance records found.</p>
//         ) : (
//           <div className="space-y-2">
//             {records.slice(0, 30).map((item, idx) => (
//               <div key={`${item.date}-${item.subject}-${idx}`} className="p-3 rounded-lg bg-slate-50 text-sm flex items-center justify-between gap-2">
//                 <div>
//                   <p className="font-semibold text-slate-800">{item.subject || 'General'}</p>
//                   <p className="text-slate-500">{item.date} | {item.day}</p>
//                 </div>
//                 <span className="capitalize text-xs font-semibold px-2 py-1 rounded-full bg-white border text-slate-700">
//                   {item.status || 'unknown'}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SummaryCard({ label, value, icon: Icon, color = 'text-slate-700' }) {
//   return (
//     <div className="bg-white border rounded-xl p-4">
//       <Icon className={`w-5 h-5 mb-2 ${color}`} />
//       <p className={`text-2xl font-bold ${color}`}>{value}</p>
//       <p className="text-xs text-slate-500 mt-1">{label}</p>
//     </div>
//   );
// }







'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Info
} from 'lucide-react';
import { useStudentAttendance } from '@/hooks/useStudentPortal';

export default function StudentAttendancePage() {
  const { data: attendanceRes, isLoading } = useStudentAttendance();
  const [filterStatus, setFilterStatus] = useState('all');
  
  const attendance = attendanceRes?.data || {};
  const summary = attendance.summary || {};
  const records = attendance.records || [];

  // HEATMAP LOGIC: Current Month Days
  const heatmapData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr);
      monthDays.push({
        day: i,
        date: dateStr,
        status: record ? record.status?.toLowerCase() : 'no-data'
      });
    }
    return monthDays;
  }, [records]);

  // Filter Logic for List
  const filteredRecords = useMemo(() => {
    if (filterStatus === 'all') return records;
    return records.filter(r => r.status?.toLowerCase() === filterStatus.toLowerCase());
  }, [records, filterStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Building your attendance heatmap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
            Attendance Analytics
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Track your daily presence and performance
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {['all', 'present', 'absent', 'late'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                filterStatus === status 
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* MONTHLY HEATMAP SECTION */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
           <h2 className="font-bold text-slate-800 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-emerald-600" />
             Monthly Activity Heatmap
           </h2>
           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 rounded-sm"></div> N/A</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Present</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Absent</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Late</span>
           </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:gap-3 justify-between">
          {heatmapData.map((item, idx) => {
            const statusColors = {
              present: 'bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-105',
              absent: 'bg-rose-500 text-white shadow-md shadow-rose-100',
              late: 'bg-amber-500 text-white shadow-md shadow-amber-100',
              'no-data': 'bg-slate-50 text-slate-300 border border-slate-100'
            };

            return (
              <div 
                key={idx}
                title={item.date}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-help ${statusColors[item.status] || statusColors['no-data']}`}
              >
                {item.day}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl border border-slate-100">
           <Info className="w-4 h-4 text-emerald-500" />
           This heatmap shows your presence for the current month. Darker colors represent active recorded statuses.
        </div>
      </div>

      {/* STATS & RECORDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Summary Stats */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-2">Quick Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard label="Total" value={summary.total ?? 0} icon={Calendar} iconColor="text-blue-600" bg="bg-blue-50" />
            <SummaryCard label="Present" value={summary.present ?? 0} icon={CheckCircle2} iconColor="text-emerald-600" bg="bg-emerald-50" />
            <SummaryCard label="Absent" value={summary.absent ?? 0} icon={XCircle} iconColor="text-rose-600" bg="bg-rose-50" />
            <SummaryCard label="Late" value={summary.late ?? 0} icon={Clock} iconColor="text-amber-600" bg="bg-amber-50" />
          </div>

          <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
            <p className="text-sm font-medium opacity-70">Attendance Score</p>
            <div className="mt-2 flex items-end gap-2">
               <span className="text-4xl font-black">{summary.percentage ?? 0}%</span>
               <span className={`text-xs font-bold px-2 py-1 rounded-lg mb-1 ${summary.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {summary.percentage >= 75 ? 'Good' : 'Low'}
               </span>
            </div>
            <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
               <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${summary.percentage}%` }} />
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Logs */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Attendance Log</h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Live Updates</span>
            </div>
          </div>

          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
            {filteredRecords.length === 0 ? (
              <div className="py-20 text-center">
                <Search className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No records matching your filter.</p>
              </div>
            ) : (
              filteredRecords.map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.subject || 'School Session'}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{item.date} • {item.day}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                       item.status?.toLowerCase() === 'absent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                       item.status?.toLowerCase() === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                       'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {item.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ label, value, icon: Icon, iconColor, bg }) {
  return (
    <div className={`p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all ${bg}`}>
       <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm ${iconColor}`}>
          <Icon className="w-4 h-4" />
       </div>
       <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 opacity-70 tracking-tighter">{label}</p>
    </div>
  );
}