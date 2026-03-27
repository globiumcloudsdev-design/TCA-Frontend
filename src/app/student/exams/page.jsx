'use client';

import { BookOpen } from 'lucide-react';
import { useStudentResults, useStudentProfile } from '@/hooks/useStudentPortal';

export default function StudentExamsPage() {
  const { data: resultsRes, isLoading } = useStudentResults();
  const { data: profileRes } = useStudentProfile();

  const results = resultsRes?.data || [];
  const profile = profileRes?.data || {};

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading results...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" /> Exam Results
        </h1>
        <p className="text-sm text-slate-500 mt-1">{profile.name || 'Student'} | {profile.class_name || '-'}</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-slate-500">No exam results published yet.</div>
      ) : (
        <div className="space-y-4">
          {results.map((exam) => (
            <div key={exam.exam_id || `${exam.exam_name}-${exam.date}`} className="bg-white border rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{exam.exam_name || 'Exam'}</p>
                  <p className="text-xs text-slate-500 mt-1">{exam.date ? new Date(exam.date).toLocaleDateString() : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{exam.percentage ?? 0}%</p>
                  <p className="text-xs text-slate-500">Rank: {exam.rank ?? '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {(exam.subjects || []).map((subject, idx) => (
                  <div key={`${subject.subject}-${idx}`} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">{subject.subject}</p>
                    <p className="text-sm text-slate-700">
                      {subject.marks ?? 0}/{subject.total ?? 0} {subject.grade ? `(${subject.grade})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
