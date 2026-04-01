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
import { ArrowLeft, Check } from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import PageLoader from '@/components/common/PageLoader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

import { examService } from '@/services/examService';

export default function ExamResultsPage({ examId, type }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [markEntries, setMarkEntries] = useState({}); // student_id -> { subject_id: marks, ... }
  const [absentStudents, setAbsentStudents] = useState(new Set()); // student_ids

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getById(examId),
    enabled: !!examId
  });

  // Fetch exam results which automatically loads students from exam's class/section
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => examService.getResults(examId),
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
      const entries = {};
      const absent = new Set();
      
      resultsData.data.forEach(result => {
        if (result.subject_marks && Array.isArray(result.subject_marks)) {
          const subjectMarks = {};
          result.subject_marks.forEach(sm => {
            subjectMarks[sm.subject_id] = sm.marks_obtained || 0;
          });
          entries[result.student_id] = subjectMarks;
        }
        
        if (!result.is_present) {
          absent.add(result.student_id);
        }
      });
      
      setMarkEntries(entries);
      setAbsentStudents(absent);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Enter Results - ${exam.name}`}
        description={`Enter marks for ${students.length} students across ${subjectSchedules.length} subjects`}
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
            <div className="text-2xl font-bold">{students.length}</div>
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
              {filledCount} <span className="text-sm text-muted-foreground">/ {students.length}</span>
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
          <div className="flex justify-between items-center">
            <CardTitle>Student Results</CardTitle>
            <Button 
              onClick={handleSaveResults} 
              disabled={saveMutation.isPending || students.length === 0}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Results'}
            </Button>
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
                    <th className="px-4 py-2 text-left font-medium">Roll No</th>
                    {subjectSchedules.map(subject => (
                      <th key={subject.subject_id} className="px-4 py-2 text-center font-medium">
                        <div className="text-xs">{subject.subject_name}</div>
                        <div className="text-xs text-muted-foreground">({subject.total_marks})</div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center font-medium">Absent</th>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
