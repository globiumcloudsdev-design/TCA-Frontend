'use client';

import { useState } from 'react';
import { Briefcase, Users, BookOpen, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useTeacherClasses } from '@/hooks/useTeacherPortal';
import AppModal from '@/components/common/AppModal';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

export default function TeacherClassesPage() {
  const { classes, loading } = useTeacherClasses();
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  const [activeSubject, setActiveSubject] = useState(null);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  const openSyllabusModal = (cls, subjectName) => {
    const details = (cls.subject_details || []).find(
      (subject) => (subject?.name || '').toLowerCase() === String(subjectName).toLowerCase()
    );

    const materials = (details?.materials || []).map((item, idx) => {
      if (typeof item === 'string') return { id: `${idx}`, name: item, url: null, type: null };
      return {
        id: item?.id || `${idx}`,
        name: item?.name || item?.title || item?.file_name || `Material ${idx + 1}`,
        type: item?.type || null,
        url: item?.url || item?.file_url || item?.download_url || item?.pdf_url || null
      };
    });

    const pdf = materials.find(
      (m) => String(m?.type || '').toLowerCase().includes('pdf') || String(m?.url || '').toLowerCase().endsWith('.pdf')
    );

    setActiveSubject({
      className: cls.class_name || cls.name,
      subjectName,
      syllabus: details?.syllabus || null,
      materials,
      pdfUrl: pdf?.url || null
    });
    setIsSyllabusOpen(true);
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto text-sm text-slate-500">Loading classes...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" /> My {t.classesLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">You are assigned to {classes.length} {t.classesLabel.toLowerCase()} this session.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls, i) => (
            <div key={cls.class_id || cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-sky-700 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-base font-extrabold">
                    {i + 1}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold">{cls.class_name || cls.name}</h2>
                    <p className="text-white/80 text-[11px] mt-0.5">
                      Sections: {(cls.sections || []).map((s) => s.name).join(', ') || cls.section_name || 'N/A'}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">{cls.total_students || cls.student_count || 0} enrolled {t.studentsLabel.toLowerCase()}</p>
                  </div>
                </div>
                <Users className="w-6 h-6 text-white/50" />
              </div>

              {/* Subjects */}
              <div className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.subjectsLabel} I Teach</p>
                <div className="flex flex-wrap gap-2">
                  {(cls.subjects || []).map((sub, j) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => openSyllabusModal(cls, sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] ${SUBJECT_COLORS[j % SUBJECT_COLORS.length]}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {(cls.subject_details || []).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {(cls.subject_details || []).map((subject) => (
                      <div key={subject.id || subject.name} className="text-[11px] text-slate-500">
                        <p>
                          <span className="font-semibold text-slate-700">{subject.name}</span>
                          {subject.syllabus ? ` - ${subject.syllabus}` : ' - Syllabus pending'}
                        </p>
                        {Array.isArray(subject.materials) && subject.materials.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Materials: {subject.materials
                              .map((m) => m?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Notes', href: '/teacher/notes', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                    { label: 'Assignments', href: '/teacher/assignments', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                    { label: 'Attendance', href: '/teacher/attendance', color: 'bg-teal-50   text-teal-700   hover:bg-teal-100' },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${a.color}`}
                    >
                      {a.label} <ChevronRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AppModal
        open={isSyllabusOpen}
        onClose={() => {
          setIsSyllabusOpen(false);
          setActiveSubject(null);
        }}
        title={activeSubject ? `${activeSubject.subjectName} Syllabus` : 'Syllabus'}
        description={activeSubject ? `${activeSubject.className} - Subject Outline and Materials` : 'Subject details'}
        size="xl"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setIsSyllabusOpen(false);
              setActiveSubject(null);
            }}
          >
            Close
          </Button>
        }
      >
        {!activeSubject ? null : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Syllabus Summary</p>
              <p className="text-sm text-slate-800">
                {activeSubject.syllabus || 'Syllabus pending'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Materials</p>
              {activeSubject.materials.length === 0 ? (
                <p className="text-sm text-slate-500">No material uploaded for this subject yet.</p>
              ) : (
                <div className="space-y-2">
                  {activeSubject.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-slate-700 truncate">{material.name}</p>
                      </div>
                      {material.url ? (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Open <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No file URL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeSubject.pdfUrl && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b text-xs font-semibold text-slate-600">
                  PDF Preview
                </div>
                <iframe
                  title="Syllabus PDF Preview"
                  src={activeSubject.pdfUrl}
                  className="w-full h-[60vh]"
                />
              </div>
            )}
          </div>
        )}
      </AppModal>
    </div>
  );
}
