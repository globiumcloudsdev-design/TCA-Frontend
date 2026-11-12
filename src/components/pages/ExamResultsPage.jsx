'use client';

/**
 * ExamResultsPage — Enter/Manage exam results for all students
 * Uses getExamResults endpoint to load students based on exam's class/section
 * Supports entering marks per subject for each student with automatic data transformation
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Check, Download } from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import PageLoader from '@/components/common/PageLoader';
import DataTable from '@/components/common/DataTable';
import AppPagination from '@/components/common/AppPagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';

import { examService } from '@/services/examService';
import { classService } from '@/services/classService';
import { generateReportCard } from '@/lib/pdf/reportCardPdf';
import { generateMarkSheet } from '@/lib/pdf/markSheetPdf';

export default function ExamResultsPage({ examId, type }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [markEntries, setMarkEntries] = useState({}); // student_id -> { subject_id: marks, ... }
  const [absentStudents, setAbsentStudents] = useState(new Set()); // student_ids
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sectionFilter, setSectionFilter] = useState('all');

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getById(examId),
    enabled: !!examId
  });

  // Fetch class to get available sections for filtering
  const { data: classData } = useQuery({
    queryKey: ['class', exam?.class_id],
    queryFn: () => classService.getById(exam.class_id),
    enabled: !!exam?.class_id
  });
  const availableSections = classData?.data?.sections || [];

  // Fetch exam results with pagination and optional section filter
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['exam-results', examId, page, pageSize, sectionFilter],
    queryFn: () => examService.getResults(examId, {
      page,
      limit: pageSize,
      section_id: sectionFilter !== 'all' ? sectionFilter : undefined
    }),
    enabled: !!examId
  });

  // Save results mutation
  const saveMutation = useMutation({
    mutationFn: (data) => examService.addResults(examId, data),
    onSuccess: () => {
      toast.success('Results saved successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-results', examId] });
      setMarkEntries({});
      setAbsentStudents(new Set());
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to save results');
    }
  });

  // Initialize with existing results
  useEffect(() => {
    if (resultsData?.data) {
      setMarkEntries(prev => {
        const next = { ...prev };
        resultsData.data.forEach(result => {
          const sId = result.student_id || result.id;
          if (!next[sId] && result.subject_marks && Array.isArray(result.subject_marks)) {
            const subjectMarks = {};
            result.subject_marks.forEach(sm => {
              subjectMarks[sm.subject_id] = sm.marks_obtained || 0;
            });
            next[sId] = subjectMarks;
          }
        });
        return next;
      });

      setAbsentStudents(prev => {
        const next = new Set(prev);
        resultsData.data.forEach(result => {
          const sId = result.student_id || result.id;
          if (result.is_present === false) {
            next.add(sId);
          }
        });
        return next;
      });
    }
  }, [resultsData]);

  if (examLoading || resultsLoading) {
    return <PageLoader message="Loading exam and students..." />;
  }

  if (!exam) {
    return (
      <div className="space-y-4">
        <PageHeader title="Exam Not Found" description="The exam you're looking for doesn't exist." />
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const students = resultsData?.data || [];
  const pagination = resultsData?.pagination || {};
  const total = pagination.total ?? students.length;
  const totalPages = pagination.totalPages ?? 1;
  const subjectSchedules = exam.subject_schedules || [];

  const handleMarkChange = (studentId, subjectId, marks) => {
    // Find the subject to get its max marks
    const subject = subjectSchedules.find(s => s.subject_id === subjectId);
    const maxMarks = subject?.total_marks || 0;
    const markValue = parseInt(marks) || 0;
    
    // Cap the marks at the subject's total marks
    const cappedMarks = Math.min(markValue, maxMarks);
    
    setMarkEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: cappedMarks
      }
    }));
  };

  const handleToggleAbsent = (studentId) => {
    setAbsentStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSaveResults = () => {
    // Transform data to backend format
    const results = students
      .filter(student => student.student_id || student.id) // Only valid students
      .map(student => {
        const studentId = student.student_id || student.id;
        const isAbsent = absentStudents.has(studentId);
        const marks = markEntries[studentId] || {};
        
        return {
          student_id: studentId,
          subject_marks: subjectSchedules.map(subject => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            marks_obtained: isAbsent ? 0 : (marks[subject.subject_id] || 0)
          })),
          is_present: !isAbsent,
          absent_reason: isAbsent ? 'Not Present' : null
        };
      });

    if (results.length === 0) {
      toast.error('No students found');
      return;
    }

    // Validate marks - check if any marks exceed the subject's total marks
    for (const result of results) {
      if (result.is_present) {
        for (const subjectMark of result.subject_marks) {
          const subject = subjectSchedules.find(s => s.subject_id === subjectMark.subject_id);
          if (subject && subjectMark.marks_obtained > subject.total_marks) {
            toast.error(
              `❌ ${subjectMark.subject_name}: Marks (${subjectMark.marks_obtained}) cannot exceed total marks (${subject.total_marks})`
            );
            return;
          }
        }
      }
    }

    saveMutation.mutate(results);
  };

  const filledCount = Object.keys(markEntries).filter(studentId => {
    const marks = markEntries[studentId];
    return marks && Object.values(marks).some(m => m > 0);
  }).length;

  const className = classData?.data?.name || classData?.name || '';
  const targetSection = exam.section_id 
    ? (availableSections.find(s => s.id === exam.section_id)?.name ? `Section ${availableSections.find(s => s.id === exam.section_id)?.name}` : 'Specific Section')
    : 'All Sections';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Enter Results - ${exam.name}`}
        description={`${className ? `Class: ${className}` : ''}${targetSection ? ` (${targetSection})` : ''} • ${total} students • ${subjectSchedules.length} subjects`}
        action={
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectSchedules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Results Filled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filledCount} <span className="text-sm text-muted-foreground">/ {total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.total_marks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle>Student Results</CardTitle>
              {!exam.section_id && availableSections.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Section:</span>
                  <Select
                    value={sectionFilter}
                    onValueChange={(val) => {
                      setSectionFilter(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Sections</SelectItem>
                      {availableSections.map(sec => (
                        <SelectItem key={sec.id} value={sec.id} className="text-xs">{sec.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => generateMarkSheet(students, exam, subjectSchedules, user?.institute || user?.school)}
                disabled={students.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Class Mark Sheet
              </Button>
              <Button 
                onClick={handleSaveResults} 
                disabled={saveMutation.isPending || students.length === 0}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Results'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students found for this exam's class/section
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Student</th>
                    <th className="px-4 py-2 text-center font-medium">Roll No</th>
                    {!exam.section_id && (
                      <th className="px-4 py-2 text-center font-medium">Section</th>
                    )}
                    {subjectSchedules.map(subject => (
                      <th key={subject.subject_id} className="px-4 py-2 text-center font-medium">
                        <div className="text-xs">{subject.subject_name}</div>
                        <div className="text-xs text-muted-foreground">({subject.total_marks})</div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center font-medium">Absent</th>
                    <th className="px-4 py-2 text-center font-medium">Report Card</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    // Extract student ID and details from the result object
                    const studentId = student.student_id || student.id;
                    
                    // Student info can be at student.student or directly on the result
                    const studentInfo = student.student || student;
                    
                    const studentName = studentInfo?.first_name || 'Unknown';
                    const studentLastName = studentInfo?.last_name || '';
                    const studentEmail = studentInfo?.email || '';
                    const rollNumber = studentInfo?.roll_number || '';
                    
                    return (
                      <tr key={studentId} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2">
                          <div className="font-medium">{studentName} {studentLastName}</div>
                          <div className="text-xs text-muted-foreground">{studentEmail}</div>
                        </td>
                        <td className="px-4 py-2 text-center font-medium">{rollNumber || '—'}</td>
                        {!exam.section_id && (
                          <td className="px-4 py-2 text-center text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {studentInfo?.section_name || studentInfo?.section?.name || '—'}
                            </span>
                          </td>
                        )}
                        {subjectSchedules.map(subject => {
                          const studentMarks = markEntries[studentId]?.[subject.subject_id] || 0;
                          const isExceeding = studentMarks > subject.total_marks;
                          
                          return (
                            <td key={`${studentId}-${subject.subject_id}`} className="px-4 py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max={subject.total_marks}
                                className={`w-14 px-2 py-1 border rounded text-center text-sm ${
                                  isExceeding ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="—"
                                value={studentMarks}
                                onChange={(e) => handleMarkChange(studentId, subject.subject_id, e.target.value)}
                                disabled={absentStudents.has(studentId)}
                                title={`Max marks: ${subject.total_marks}`}
                              />
                              {isExceeding && (
                                <div className="text-xs text-red-600 mt-1">Max: {subject.total_marks}</div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={absentStudents.has(studentId)}
                            onChange={() => handleToggleAbsent(studentId)}
                            className="h-4 w-4 rounded border"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-800"
                            onClick={() => generateReportCard(student, exam, subjectSchedules, markEntries[studentId] || {}, user?.institute || user?.school, absentStudents.has(studentId))}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {students.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t mt-4">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Showing {students.length} of {total} records
                </p>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[65px] text-xs px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 25, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AppPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
