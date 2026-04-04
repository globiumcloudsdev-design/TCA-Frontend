// //src/app/student/exams/page.jsx
'use client';

import { useState } from 'react';
import { BookOpen, Calendar, CheckCircle, ChevronRight, Award, Clock, FileText } from 'lucide-react';
import { useStudentExamSchedule, useStudentResults, useStudentProfile } from '@/hooks/useStudentPortal';
import ResultCard from '@/components/cards/ResultCard';
import { useAuthStore } from '@/store/authStore';
import usePortalStore from '@/store/portalStore';

export default function StudentExamsPage() {
  const { data: scheduleRes, isLoading: scheduleLoading } = useStudentExamSchedule();
  const { data: resultsRes, isLoading: resultsLoading } = useStudentResults();
  const { data: profileRes } = useStudentProfile();
  const { user, getInstitute } = useAuthStore();
  const { portalUser } = usePortalStore();
  
  const [selectedExamResult, setSelectedExamResult] = useState(null);

  const schedule = scheduleRes?.data || [];
  const results = resultsRes?.data || [];
  const profile = profileRes?.data || {};
  const authInstitute = getInstitute?.();
  const selectedInstitute = authInstitute || portalUser?.institute || portalUser?.school || null;

  const fullName = String(profile?.name || '').trim();
  const fallbackNameParts = fullName ? fullName.split(' ') : [];
  const fallbackFirstName = fallbackNameParts[0] || 'Student';
  const fallbackLastName = fallbackNameParts.slice(1).join(' ');

  const selectedStudent = {
    first_name: user?.first_name || fallbackFirstName,
    last_name: user?.last_name || fallbackLastName,
    registration_no: user?.registration_no || profile?.registration_no || 'N/A',
    roll_number: profile?.roll_no || profile?.roll_number || user?.roll_number || user?.roll_no || 'N/A'
  };

  const selectedExam = selectedExamResult
    ? {
        name: selectedExamResult.exam_name,
        total_marks: Number(selectedExamResult.total_marks || 0),
        subject_schedules: (selectedExamResult.subjects || []).map((sub, idx) => ({
          subject_id: sub.subject_id || `${idx}-${sub.subject || sub.subject_name || 'subject'}`,
          subject_name: sub.subject || sub.subject_name || `Subject ${idx + 1}`,
          total_marks: Number(sub.total || sub.total_marks || 0)
        }))
      }
    : null;

  const selectedResult = selectedExamResult
    ? {
        subject_marks: (selectedExamResult.subjects || []).map((sub) => ({
          subject_id: sub.subject_id || null,
          subject_name: sub.subject || sub.subject_name || 'Subject',
          marks_obtained: Number(sub.marks || sub.marks_obtained || 0),
          total_marks: Number(sub.total || sub.total_marks || 0),
          grade: sub.grade || null,
          remarks: sub.remarks || null
        })),
        total_marks: Number(selectedExamResult.total_marks || 0),
        total_marks_obtained: Number(selectedExamResult.obtained_marks || 0),
        percentage: Number(selectedExamResult.percentage || 0),
        grade: selectedExamResult.grade || 'N/A',
        status: String(selectedExamResult.status || '').toLowerCase() || (Number(selectedExamResult.percentage || 0) >= 50 ? 'pass' : 'fail')
      }
    : null;

  if (scheduleLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-slate-500 font-medium">Fetching Exam Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <BookOpen className="w-7 h-7 text-emerald-600" />
            </div>
            Exams & Results
          </h1>
          <p className="text-slate-500 mt-2 ml-14 font-medium">
            {profile.name || 'Student'} • <span className="text-emerald-600">{profile.class_name || 'General Class'}</span>
          </p>
        </div>
        <div className="absolute top-[-20px] right-[-20px] opacity-5">
           <Award className="w-40 h-40 text-slate-900" />
        </div>
      </div>

      {/* SECTION: UPCOMING & ACTIVE EXAMS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1">
          <Calendar className="w-5 h-5 text-blue-600" /> Scheduled Exams
        </h2>
        
        {schedule.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No exams are currently scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {schedule.map((exam) => {
              // Check if result exists for this exam
              const resultData = results.find(r => r.exam_id === exam.exam_id);
              const hasResult = !!resultData;

              return (
                <div key={exam.exam_id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${hasResult ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {exam.exam_type?.replace('_', ' ') || 'Examination'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{exam.exam_name}</h3>
                      </div>

                      {hasResult ? (
                        <div className="text-right">
                          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-tight">Obtained</p>
                            <p className="text-2xl font-black text-emerald-700">{resultData.percentage}%</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 text-sm font-medium text-slate-600">
                           <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 uppercase">Total Marks</span>
                              <span className="text-slate-800">{exam.total_marks}</span>
                           </div>
                           <div className="flex flex-col items-end border-l pl-4 border-slate-100">
                              <span className="text-xs text-slate-400 uppercase">Subjects</span>
                              <span className="text-slate-800">{exam.subjects_count}</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Conditional Rendering: Schedule vs Result Summary */}
                    {!hasResult ? (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {exam.subjects?.map((sub, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                              <span className="text-[10px] font-bold text-blue-600 uppercase">{new Date(sub.scheduled_date).toLocaleString('en-us', {month:'short'})}</span>
                              <span className="text-sm font-black text-slate-800 mt-[-2px]">{new Date(sub.scheduled_date).getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{sub.subject_name}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {sub.scheduled_time} • {sub.total_marks} Marks
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <p className="text-sm font-semibold text-emerald-800">Result has been announced for this exam.</p>
                        </div>
                        <button 
                          onClick={() => setSelectedExamResult(resultData)}
                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
                        >
                          View Result <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: PREVIOUS RESULTS ARCHIVE (If any) */}
      <section className="pt-4 border-t border-slate-100">
         <h2 className="text-lg font-bold text-slate-700 mb-4 px-1">Performance History</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((res) => (
               <div key={res.exam_id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors group">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <FileText className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">{res.exam_name}</p>
                        <p className="text-[11px] text-slate-500">{new Date(res.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-slate-700 group-hover:text-emerald-600">{res.percentage}%</p>
                     <p className="text-[10px] font-bold text-slate-400">GRADE {res.grade}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* RESULT MODAL: Beautiful Detailed View */}
      {selectedExamResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 relative">
            <button
              onClick={() => setSelectedExamResult(null)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition"
              aria-label="Close result card"
            >
              ✕
            </button>
            <div className="p-5 max-h-[90vh] overflow-y-auto">
              <ResultCard
                student={selectedStudent}
                exam={selectedExam}
                result={selectedResult}
                institute={selectedInstitute}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}