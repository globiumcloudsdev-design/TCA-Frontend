// src/app/student/syllabus/page.jsx
'use client';

import { useMemo, useState } from 'react';
import {
  BookMarked, User, FileText, ChevronDown,
  BookOpen, Download, ExternalLink, Clock, MapPin
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useStudentClasses, useStudentProfile } from '@/hooks/useStudentPortal';
import { cn } from '@/lib/utils';
import { AppModal } from '@/components/common';

// ── Subject colours ────────────────────────────────────────────
const PALETTE = [
  { bg: 'bg-blue-50',    border: 'border-blue-200',   icon: 'bg-blue-500',    tag: 'bg-blue-100 text-blue-700',    heading: 'text-blue-700'    },
  { bg: 'bg-violet-50',  border: 'border-violet-200', icon: 'bg-violet-500',  tag: 'bg-violet-100 text-violet-700',heading: 'text-violet-700'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200',icon: 'bg-emerald-500', tag: 'bg-emerald-100 text-emerald-700',heading: 'text-emerald-700'},
  { bg: 'bg-teal-50',    border: 'border-teal-200',   icon: 'bg-teal-500',    tag: 'bg-teal-100 text-teal-700',    heading: 'text-teal-700'    },
  { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: 'bg-amber-500',   tag: 'bg-amber-100 text-amber-700',  heading: 'text-amber-700'   },
  { bg: 'bg-rose-50',    border: 'border-rose-200',   icon: 'bg-rose-500',    tag: 'bg-rose-100 text-rose-700',    heading: 'text-rose-700'    },
  { bg: 'bg-cyan-50',    border: 'border-cyan-200',   icon: 'bg-cyan-500',    tag: 'bg-cyan-100 text-cyan-700',    heading: 'text-cyan-700'    },
  { bg: 'bg-indigo-50',  border: 'border-indigo-200', icon: 'bg-indigo-500',  tag: 'bg-indigo-100 text-indigo-700',heading: 'text-indigo-700'  },
];

// Syllabus Content Component (to be used inside modal)
function SyllabusContent({ subject, pal }) {
  return (
    <div className="space-y-5">
      {/* Description */}
      {subject.description && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{subject.description}</p>
        </div>
      )}

      {/* Teacher Info */}
      {subject.teacher && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Teacher</h3>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <User className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-800">{subject.teacher}</p>
              {subject.teacher_email && (
                <p className="text-xs text-slate-500">{subject.teacher_email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room & Timing */}
      {(subject.room || subject.timing) && (
        <div className="grid grid-cols-2 gap-3">
          {subject.room && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Room</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{subject.room}</p>
            </div>
          )}
          {subject.timing && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Timing</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{subject.timing}</p>
            </div>
          )}
        </div>
      )}

      {/* Syllabus Materials (text/url/pdf) */}
      {Array.isArray(subject.syllabus_items) && subject.syllabus_items.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">Syllabus Materials</h3>
          <div className="space-y-2">
            {subject.syllabus_items.map((material, idx) => (
              <div
                key={material.id || `${subject.id}-${idx}`}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <p className="text-sm font-semibold text-slate-800">{material.title || `Material ${idx + 1}`}</p>
                {material.text && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{material.text}</p>
                )}
                {(material.pdf_url || material.url) && (
                  <a
                    href={material.pdf_url || material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {material.pdf_url ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {material.pdf_url ? 'Open PDF' : 'Open Link'}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy Syllabus Content / Chapters */}
      {(!Array.isArray(subject.syllabus_items) || subject.syllabus_items.length === 0) && subject.syllabus_content && subject.syllabus_content.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">Syllabus Outline</h3>
          <div className="space-y-2">
            {subject.syllabus_content.map((chapter, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className={cn('flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center mt-0.5', pal.icon)}>
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700 font-medium leading-snug">{chapter}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Link */}
      {subject.syllabus_file_url && (!Array.isArray(subject.syllabus_items) || subject.syllabus_items.length === 0) && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Resources</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Syllabus PDF</p>
              <p className="text-xs text-slate-400 truncate">{subject.syllabus_file_url}</p>
            </div>
            <a
              href={subject.syllabus_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </div>
      )}

      {/* Attendance Info */}
      {subject.attendance_percentage != null && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Attendance</h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Attendance</span>
              <span className={cn(
                'text-sm font-bold',
                subject.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'
              )}>
                {subject.attendance_percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  subject.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(subject.attendance_percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {subject.attended || 0} out of {subject.total_classes || 0} classes attended
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentSyllabusPage() {
  const { portalUser } = usePortalStore();
  const { data: classesRes, isLoading: classesLoading } = useStudentClasses();
  const { data: profileRes } = useStudentProfile();

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const profile = profileRes?.data || {};
  const t = getPortalTerms(portalUser?.institute_type || 'school');

  // Transform classes data to match the UI structure
  const subjects = useMemo(() => {
    const classData = classesRes?.data || [];
    return classData.map((item, index) => {
      const rawSyllabusItems = Array.isArray(item.syllabus)
        ? item.syllabus
        : (Array.isArray(item.materials) ? item.materials : []);

      const syllabusItems = rawSyllabusItems.map((material, materialIndex) => ({
        id: material?.id || `${item.id || `subject-${index}`}-material-${materialIndex + 1}`,
        title: material?.title || material?.name || `Material ${materialIndex + 1}`,
        text: material?.text || material?.description || material?.content || null,
        url: material?.url || material?.link || null,
        pdf_url: material?.pdf_url || null,
      }));

      const syllabusContent = syllabusItems
        .map((material) => material.text)
        .filter(Boolean);
      const firstMaterialLink = syllabusItems.find((material) => material.pdf_url || material.url);

      return {
        id: item.id || `subject-${index}`,
        name: item.name || item.subject || `Subject ${index + 1}`,
        code: item.code || item.subject_code || `SUB${index + 1}`,
        description: item.description || 'Course syllabus and learning materials will be available here.',
        teacher: item.teacher_name || item.teacher || null,
        teacher_email: item.teacher_email || null,
        room: item.room || null,
        timing: item.timing || null,
        attendance_percentage: item.attendance_percentage ?? null,
        total_classes: item.total_classes ?? null,
        attended: item.attended ?? null,
        syllabus_items: syllabusItems,
        syllabus_content: syllabusContent.length ? syllabusContent : (item.syllabus_content || item.chapters || []),
        syllabus_file_url: item.syllabus_file_url || item.pdf_url || firstMaterialLink?.pdf_url || firstMaterialLink?.url || null,
        syllabus_type: item.syllabus_type || 'text',
      };
    });
  }, [classesRes]);

  const filtered = subjects.filter((item) => 
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (subject, pal) => {
    setSelectedSubject({ ...subject, pal });
    setModalOpen(true);
  };

  if (classesLoading) {
    return (
      <div className="max-w-4xl mx-auto text-sm text-slate-500 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="w-10 h-10 text-slate-300 animate-pulse mx-auto mb-3" />
          <p>Loading syllabus...</p>
        </div>
      </div>
    );
  }

  // Get modal title with subject icon
  const modalTitle = selectedSubject ? (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm', selectedSubject.pal?.icon)}>
        {selectedSubject.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <span>{selectedSubject.name}</span>
    </div>
  ) : '';

  const modalDescription = selectedSubject?.code || '';

  return (
    <>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-600" /> My {t.syllabusLabel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile.class_name || portalUser?.class_name || 'Class'} — Academic Year 2025–26
          </p>
        </div>

        {/* Summary banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-xs mb-0.5">Total {t.subjectsLabel}</p>
            <p className="text-4xl font-extrabold">{subjects.length}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-0.5">{t.classLabel}</p>
            <p className="text-lg font-bold">{profile.class_name || portalUser?.class_name || '-'}</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects…"
                className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-xl bg-white/20 placeholder-white/60 text-white text-sm outline-none focus:bg-white/30 transition"
              />
            </div>
          </div>
        </div>

        {/* Subject cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No subjects found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((subject, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              const initials = subject.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
              
              return (
                <div
                  key={subject.id}
                  className={cn('rounded-2xl border-2 overflow-hidden transition-all cursor-pointer hover:shadow-md', pal.bg, pal.border)}
                  onClick={() => handleCardClick(subject, pal)}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Subject icon avatar */}
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0', pal.icon)}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className={cn('font-extrabold text-slate-900 text-sm')}>{subject.name}</p>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full font-mono', pal.tag)}>
                          {subject.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{subject.description}</p>
                      
                      {/* Teacher */}
                      {subject.teacher && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] text-slate-500">{subject.teacher}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {((subject.syllabus_items && subject.syllabus_items.length > 0) || (subject.syllabus_content && subject.syllabus_content.length > 0)) && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {(subject.syllabus_items?.length || subject.syllabus_content?.length || 0)} material{(subject.syllabus_items?.length || subject.syllabus_content?.length || 0) > 1 ? 's' : ''}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AppModal for Syllabus Details */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        description={modalDescription}
        size="lg"
      >
        {selectedSubject && (
          <SyllabusContent subject={selectedSubject} pal={selectedSubject.pal} />
        )}
      </AppModal>
    </>
  );
}