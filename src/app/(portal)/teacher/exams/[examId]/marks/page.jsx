// app/teacher/exams/[examId]/enter-marks/page.js

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherExamEntry } from '@/hooks/useTeacherPortal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, AlertCircle, CheckCircle, ChevronLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

// Debounced input handler hook
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Validate mark value
const validateMarkValue = (value, maxMarks) => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, error: null };
  }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Invalid number' };
  }
  if (numValue < 0) {
    return { isValid: false, error: 'Marks cannot be negative' };
  }
  if (numValue > maxMarks) {
    return { isValid: false, error: `Max ${maxMarks} marks` };
  }
  return { isValid: true, error: null };
};

// Mark input component
const MarkInput = ({ value, onChange, maxMarks, error, disabled, studentId, subjectId }) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    if (debouncedValue !== value && debouncedValue !== undefined) {
      onChange(studentId, subjectId, debouncedValue);
    }
  }, [debouncedValue, value, onChange, studentId, subjectId]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  return (
    <div className="flex flex-col">
      <Input
        type="number"
        min="0"
        max={maxMarks}
        step="0.5"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full text-center px-2 py-1 text-sm ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200'
        } disabled:opacity-50`}
        placeholder="-"
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="p-6">
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader className="inline-block animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-600 font-medium">Loading exam details...</p>
      </div>
    </div>
  </div>
);

export default function EnterMarksPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;

  // State
  const [marks, setMarks] = useState({});
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch data using the new hook
  const { 
    students, 
    exam, 
    loading, 
    error, 
    addResults, 
    isAddingResults,
    refetch 
  } = useTeacherExamEntry(examId, { search: debouncedSearch, status: statusFilter });

  // CRITICAL FIX: Initialize marks from fetched students
  useEffect(() => {
    if (students && students.length > 0 && exam?.subject_schedules) {
      const initialMarks = {};
      
      students.forEach((student) => {
        initialMarks[student.student_id] = {};
        
        // For each subject in exam (teacher's assigned subjects)
        exam.subject_schedules.forEach((subject) => {
          // Find if this student has existing marks for this subject
          const existingSubjectMark = student.subject_marks?.find(
            sm => sm.subject_id === subject.subject_id
          );
          
          // Set the value - if exists, use it, otherwise empty string
          initialMarks[student.student_id][subject.subject_id] = 
            existingSubjectMark?.marks_obtained !== undefined && 
            existingSubjectMark?.marks_obtained !== null &&
            existingSubjectMark?.marks_obtained !== ''
              ? existingSubjectMark.marks_obtained
              : '';
        });
      });
      
      console.log('Initialized marks:', initialMarks);
      setMarks(initialMarks);
    }
  }, [students, exam?.subject_schedules]);

  // Handle mark change
  const handleMarkChange = useCallback((studentId, subjectId, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: value === '' ? '' : parseFloat(value) || 0
      }
    }));

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${studentId}_${subjectId}`];
      return newErrors;
    });
  }, []);

  // Validate all marks before submit
  const validateAllMarks = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!exam?.subject_schedules) return { isValid: true, errors: {} };

    students.forEach((student) => {
      exam.subject_schedules.forEach((subject) => {
        const value = marks[student.student_id]?.[subject.subject_id];
        if (value !== '' && value !== null && value !== undefined && value !== 0) {
          const validation = validateMarkValue(value, subject.total_marks);
          if (!validation.isValid) {
            isValid = false;
            newErrors[`${student.student_id}_${subject.subject_id}`] = validation.error;
          }
        }
      });
    });

    return { isValid, errors: newErrors };
  }, [marks, students, exam]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateAllMarks();
    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Please fix all validation errors before saving');
      return;
    }

    // Prepare results array - ONLY for subjects teacher is assigned to
    const resultsToSubmit = students.map((student) => {
      const subjectMarks = (exam?.subject_schedules || []).map((subject) => {
        const marksValue = marks[student.student_id]?.[subject.subject_id];
        return {
          subject_id: subject.subject_id,
          marks_obtained: marksValue !== '' && marksValue !== null && !isNaN(parseFloat(marksValue))
            ? parseFloat(marksValue) 
            : 0
        };
      });

      return {
        student_id: student.student_id,
        subject_marks: subjectMarks,
        is_present: true
      };
    });

    addResults(resultsToSubmit, {
      onSuccess: () => {
        toast.success('Marks saved successfully!');
        setTimeout(() => {
          router.push(`/teacher/exams/${examId}/report`);
        }, 1500);
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to save marks');
      }
    });
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="inline-block text-red-600 mb-2" size={32} />
          <p className="text-red-800 font-medium">Failed to load exam data</p>
          <p className="text-red-600 text-sm mt-1">{error?.message || 'Unknown error'}</p>
          <Button onClick={() => refetch()} size="sm" className="mt-4" variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!students || students.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="inline-block text-orange-500 mb-2" size={32} />
          <p className="text-gray-600 text-lg font-medium">No students found for this exam</p>
          <p className="text-gray-500 text-sm mt-2">Please verify the exam configuration and student enrollment</p>
          <Button onClick={() => refetch()} size="sm" className="mt-4" variant="outline">
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  const subjectSchedules = exam?.subject_schedules || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Enter Marks</h1>
          <p className="text-gray-600 mt-1">
            {exam?.class_name || 'Class'} • {subjectSchedules.length} Subjects • {students.length} Students
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Students</option>
            <option value="pending">Pending</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Marks Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Student Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-24">Roll No.</th>
                    {subjectSchedules.map((subject) => (
                      <th key={subject.subject_id} className="px-4 py-3 text-center font-semibold text-gray-700 text-sm min-w-[100px]">
                        <div>{subject.subject_name}</div>
                        <div className="text-xs text-gray-500 font-normal">/{subject.total_marks}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, idx) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {student.student?.first_name} {student.student?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{student.student?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.student?.roll_number || '-'}
                      </td>
                      {subjectSchedules.map((subject) => {
                        // Get the current marks from state
                        const currentMarks = marks[student.student_id]?.[subject.subject_id];
                        const errorKey = `${student.student_id}_${subject.subject_id}`;
                        
                        return (
                          <td key={subject.subject_id} className="px-4 py-3">
                            <MarkInput
                              value={currentMarks !== undefined ? currentMarks : ''}
                              onChange={handleMarkChange}
                              maxMarks={subject.total_marks}
                              error={errors[errorKey]}
                              disabled={isAddingResults}
                              studentId={student.student_id}
                              subjectId={subject.subject_id}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm">
              <div className="text-gray-500">
                {students.length} students • {subjectSchedules.length} subjects
              </div>
              {Object.keys(errors).length > 0 && (
                <div className="text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {Object.keys(errors).length} validation error(s)
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isAddingResults}
              variant="outline"
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingResults}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {isAddingResults ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Saving Marks...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={18} />
                  Save All Marks
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}