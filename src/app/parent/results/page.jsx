'use client';

import { useState } from 'react';
import { BookOpen, Award, TrendingUp, User } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_PARENTS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

const GRADE_COLORS = {
  'A+': 'text-emerald-600 bg-emerald-50', A: 'text-blue-600 bg-blue-50',
  'B+': 'text-indigo-600 bg-indigo-50',   B: 'text-violet-600 bg-violet-50',
  'C':  'text-amber-600 bg-amber-50',      F: 'text-red-600 bg-red-50',
};

function ResultCard({ result, childName, t }) {
  const pct = result.percentage;
  const arcColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs">{result.exam?.name || 'Exam'}</p>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{childName}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-white/80">
                📅 {result.exam?.start_date || 'N/A'}
              </span>
              <span className="text-sm text-white/80">
                🏆 Rank #{result.position} of {result.class_total}
              </span>
            </div>
          </div>
          <div className="text-center bg-white/20 rounded-xl px-4 py-3">
            <p className="text-3xl font-extrabold text-white">{pct}%</p>
            <p className="text-xs text-white/70 mt-0.5">
              {result.total_marks}/{result.total_full}
            </p>
            <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
              Grade {result.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Subjects table */}
      <div className="p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.subjectsLabel}-wise {t.resultsLabel}</p>
        <div className="space-y-2.5">
          {result.subjects.map((s) => {
            const pctS = Math.round((s.marks / s.total) * 100);
            const gradeCls = GRADE_COLORS[s.grade] || 'text-slate-600 bg-slate-50';
            return (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 w-28 flex-shrink-0 font-medium">{s.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${pctS >= 80 ? 'bg-emerald-500' : pctS >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${pctS}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-10 text-right">{s.marks}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeCls}`}>{s.grade}</span>
              </div>
            );
          })}
        </div>

        {result.remarks && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-xs font-semibold text-indigo-700">{t.teacherLabel}&apos;s Remarks</p>
            <p className="text-sm text-indigo-600 mt-0.5">{result.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentResultsPage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser || DUMMY_PARENTS[0];
  const t = getPortalTerms(parent?.institute_type);
  const children = parent.children || [];
  const [selectedChild, setSelectedChild] = useState(0);

  const child = children[selectedChild];
  const results = child?.results || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t.resultsLabel}</h1>
        <p className="text-sm text-slate-500 mt-1">Published {t.examLabel.toLowerCase()} results and {t.subjectLabel.toLowerCase()}-wise performance.</p>
      </div>

      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button key={c.id} onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedChild === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
              {c.first_name} {c.last_name}
            </button>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No published results yet</p>
          <p className="text-sm text-slate-400 mt-1">Results will appear here once published by the school.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {results.map((r) => (
            <ResultCard key={`${r.exam_id}-${r.student_id}`} result={r} childName={`${child.first_name} ${child.last_name}`} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
