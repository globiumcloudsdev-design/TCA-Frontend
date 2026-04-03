'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTeacherExams } from '@/hooks/useTeacherPortal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PlusCircle, FileText, Calendar, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { EXAM_TYPES } from '@/constants';
import useAuthStore from '@/store/authStore';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';

// Exam type display mapping with colors
const EXAM_TYPE_DISPLAY = {
  periodical: { label: 'Periodic Test', color: 'bg-blue-100 text-blue-800' },
  mid_term: { label: 'Mid Term', color: 'bg-purple-100 text-purple-800' },
  final: { label: 'Final', color: 'bg-emerald-100 text-emerald-800' },
  unit_test: { label: 'Unit Test', color: 'bg-sky-100 text-sky-800' },
  monthly: { label: 'Monthly', color: 'bg-amber-100 text-amber-800' },
  weekly: { label: 'Weekly', color: 'bg-cyan-100 text-cyan-800' },
  quarterly: { label: 'Quarterly', color: 'bg-rose-100 text-rose-800' },
  half_yearly: { label: 'Half Yearly', color: 'bg-indigo-100 text-indigo-800' },
  annual: { label: 'Annual', color: 'bg-emerald-100 text-emerald-800' },
  entrance: { label: 'Entrance', color: 'bg-orange-100 text-orange-800' },
  practice: { label: 'Practice', color: 'bg-slate-100 text-slate-800' },
  quiz: { label: 'Quiz', color: 'bg-teal-100 text-teal-800' },
  assignment: { label: 'Assignment', color: 'bg-violet-100 text-violet-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: FileText },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: BarChart3 }
};

// Create filter options from constants
const EXAM_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  ...EXAM_TYPES
];

export default function TeacherExamsPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');

  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { exams, pagination, loading, error } = useTeacherExams(filters, page, limit);

  const displayExams = useMemo(() => {
    if (!Array.isArray(exams)) return [];
    
    return exams.map(exam => ({
      ...exam,
      id: exam.id || exam.exam_id,
      class_name: exam.class?.name || exam.class_name || 'Class',
      section_name: exam.section?.name || exam.section_name,
      exam_type: exam.exam_type?.toUpperCase() || exam.type?.toUpperCase() || 'PERIODIC',
      status: exam.status?.toLowerCase() || 'draft',
      total_marks: exam.total_marks || exam.subject_schedules?.reduce((sum, s) => sum + (Number(s.total_marks) || 0), 0) || 0,
      subject_count: exam.subject_count || exam.subject_schedules?.length || 0,
      assigned_subjects: exam.subject_schedules?.map(s => s.subject_name).join(', ') || ''
    }));
  }, [exams]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-semibold">Failed to load exams</p>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 text-slate-900">
            <BookOpen className="w-7 h-7 text-blue-600" /> My Exams
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage exams for your assigned {t.classesLabel.toLowerCase()}</p>
        </div>
        <Link href="/teacher/exams/create">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md gap-2">
            <PlusCircle className="w-4 h-4" /> New Exam
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <InputField
            placeholder="Search exams..."
            value={filters.search || ''}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
          />
          <SelectField
            value={filters.status || ''}
            onChange={(v) => {
              setFilters({ ...filters, status: v });
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
          <SelectField
            value={filters.type || ''}
            onChange={(v) => {
              setFilters({ ...filters, type: v });
              setPage(1);
            }}
            options={EXAM_TYPE_OPTIONS}
          />
        </div>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="inline-block w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-slate-600 font-medium">Loading exams...</p>
        </div>
      ) : displayExams.length === 0 ? (
        <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No exams found</p>
          <p className="text-slate-500 text-sm mt-1">Create your first exam to get started</p>
          <Link href="/teacher/exams/create" className="inline-block mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <PlusCircle className="w-4 h-4" /> Create Exam
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayExams.map((exam) => {
            const typeInfo = EXAM_TYPE_DISPLAY[exam.exam_type] || EXAM_TYPE_DISPLAY.other;
            const statusInfo = STATUS_MAP[exam.status] || STATUS_MAP.draft;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={exam.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Class & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={typeInfo.color} variant="secondary">
                        {typeInfo.label}
                      </Badge>
                      <Badge className={statusInfo.color} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                      {exam.name || `${exam.class_name} Exam`}
                    </h3>
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      {exam.class_name}
                      {exam.section_name && <span className="font-normal"> - Section {exam.section_name}</span>}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Subjects</p>
                        <p className="font-bold text-slate-800 mt-1 truncate" title={exam.assigned_subjects}>
                          {exam.assigned_subjects || <span className="text-slate-400 italic">No subjects assigned</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                        <p className="font-bold text-slate-800 mt-1">{exam.total_marks}</p>
                      </div>
                      {exam.exam_date && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                          <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(exam.exam_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {exam.duration_minutes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                          <p className="font-bold text-slate-800 mt-1">{exam.duration_minutes} min</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/teacher/exams/${exam.id}/marks`}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Enter Marks
                      </Button>
                    </Link>
                    <Link href={`/teacher/exams/${exam.id}/report`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-600">
            Page <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span>
          </span>
          <Button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
