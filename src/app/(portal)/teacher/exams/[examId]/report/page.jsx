//src/app/(portal)/teacher/exams/[examId]/report/page.jsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherExamDetails, useTeacherExamResults } from '@/hooks/useTeacherPortal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader, AlertCircle, Download, ArrowLeft, Printer, X } from 'lucide-react';
import ResultCard from '@/components/cards/ResultCard'; // Shared component

// Helper: Calculate grade based on percentage (standard scale)
const getGradeFromPercentage = (percentage) => {
  const p = parseFloat(percentage);
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C';
  if (p >= 40) return 'D';
  return 'F';
};

// Helper: Determine pass/fail status for a subject
const isSubjectPass = (marksObtained, passMarks) => {
  return marksObtained >= passMarks;
};

// Helper: Determine overall exam status
const getExamStatus = (totalPercentage, examPassPercentage, subjectResults) => {
  if (totalPercentage >= examPassPercentage && subjectResults.every(sub => sub.passed)) {
    return 'pass';
  }
  return 'fail';
};

export default function ExamReportPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;

  const [selectedResultData, setSelectedResultData] = useState(null); // Store full result object for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { exam, loading: examLoading, error: examError } = useTeacherExamDetails(examId);
  const { results, loading: resultsLoading, refetch } = useTeacherExamResults(examId);

  const handlePrintResult = (result) => {
    setSelectedResultData(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResultData(null);
  };

  if (examLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="inline-block animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="inline-block text-red-600 mb-2" size={32} />
          <p className="text-red-600 text-lg font-medium">Failed to load exam</p>
          <p className="text-red-500 text-sm mt-2">{examError?.message || 'Exam not found'}</p>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-6">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-600 text-lg">No results found for this exam</p>
          <p className="text-gray-500 text-sm mt-2">Results will appear once marks are entered</p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  // Prepare subject schedules with pass marks
  const subjectSchedules = exam.subject_schedules || [];
  const examPassPercentage = parseFloat(exam.pass_percentage) || 40;
  const totalExamMarks = subjectSchedules.reduce((sum, s) => sum + (s.total_marks || 0), 0);

  // Calculate statistics
  const stats = {
    total_students: results.length,
    passed: 0,
    failed: 0,
    absent: 0,
    totalPercentageSum: 0,
    validResultsCount: 0,
  };

  // Pre-process each result to compute subject-wise pass/fail and overall status
  const processedResults = results.map(result => {
    const isAbsent = result.status === 'absent' || result.is_present === false;
    let obtainedTotal = 0;
    let subjectDetails = [];

    if (!isAbsent && result.subject_marks) {
      subjectSchedules.forEach(subject => {
        const subjectMark = result.subject_marks.find(sm => sm.subject_id === subject.subject_id);
        const marksObtained = subjectMark?.marks_obtained || 0;
        const passMarks = subject.pass_marks || (subject.total_marks * examPassPercentage / 100);
        const passed = isSubjectPass(marksObtained, passMarks);
        const percentage = subject.total_marks > 0 ? (marksObtained / subject.total_marks) * 100 : 0;
        const grade = subjectMark?.grade || getGradeFromPercentage(percentage);
        
        subjectDetails.push({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          marks_obtained: marksObtained,
          total_marks: subject.total_marks,
          percentage: percentage.toFixed(2),
          grade: grade,
          passed: passed,
          pass_marks: passMarks,
        });
        obtainedTotal += marksObtained;
      });
    }

    const totalPercentage = totalExamMarks > 0 ? (obtainedTotal / totalExamMarks) * 100 : 0;
    const examStatus = isAbsent ? 'absent' : getExamStatus(totalPercentage, examPassPercentage, subjectDetails);
    const isPassed = examStatus === 'pass';
    const isFailed = examStatus === 'fail';

    // Update stats
    if (!isAbsent) {
      stats.totalPercentageSum += totalPercentage;
      stats.validResultsCount++;
      if (isPassed) stats.passed++;
      else if (isFailed) stats.failed++;
    } else {
      stats.absent++;
    }

    const finalGrade = getGradeFromPercentage(totalPercentage);

    return {
      ...result,
      obtained_total: obtainedTotal,
      total_percentage: totalPercentage.toFixed(2),
      exam_status: examStatus,
      grade: finalGrade,
      subject_details: subjectDetails,
      student: result.student || {},
    };
  });

  stats.avg_percentage = stats.validResultsCount > 0 ? (stats.totalPercentageSum / stats.validResultsCount).toFixed(2) : '0';

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exam Report</h1>
          <p className="text-gray-600 mt-2">
            {exam.name} • {exam.class_name || exam.class?.name || 'Class'}
            {exam.section_name || exam.section?.name ? ` - Section ${exam.section_name || exam.section?.name}` : ''}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {exam.start_date ? new Date(exam.start_date).toLocaleDateString() : 'N/A'} 
            {exam.end_date ? ` to ${new Date(exam.end_date).toLocaleDateString()}` : ''}
          </p>
          <p className="text-sm text-gray-500">Passing Percentage: {examPassPercentage}%</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-gray-600">Passed</p>
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4 bg-orange-50">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-orange-600">{stats.absent}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Average %</p>
          <p className="text-2xl font-bold text-purple-600">{stats.avg_percentage}%</p>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left font-semibold text-gray-700">#</th>
                <th className="p-3 text-left font-semibold text-gray-700">Student Name</th>
                <th className="p-3 text-left font-semibold text-gray-700">Roll No.</th>
                {subjectSchedules.map((subject) => (
                  <th key={subject.subject_id} className="p-3 text-center font-semibold text-gray-700 min-w-[80px]">
                    <div className="text-sm">{subject.subject_name}</div>
                    <div className="text-xs text-gray-500">/{subject.total_marks}</div>
                  </th>
                ))}
                <th className="p-3 text-center font-semibold text-gray-700">Total</th>
                <th className="p-3 text-center font-semibold text-gray-700">%</th>
                <th className="p-3 text-center font-semibold text-gray-700">Grade</th>
                <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                <th className="p-3 text-center font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {processedResults.map((result, idx) => {
                const isAbsent = result.exam_status === 'absent';
                let statusText = 'Pending';
                let statusClass = 'bg-gray-100 text-gray-800';
                if (isAbsent) {
                  statusText = 'Absent';
                  statusClass = 'bg-orange-100 text-orange-800';
                } else if (result.exam_status === 'pass') {
                  statusText = 'Passed';
                  statusClass = 'bg-green-100 text-green-800';
                } else if (result.exam_status === 'fail') {
                  statusText = 'Failed';
                  statusClass = 'bg-red-100 text-red-800';
                }

                return (
                  <tr key={result.id || result.student_id || `result-${idx}`} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 text-gray-500 text-sm">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-medium text-gray-900">
                        {result.student.first_name} {result.student.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{result.student.email || ''}</p>
                    </td>
                    <td className="p-3 text-gray-600">
                      {result.student.roll_number || result.student.registration_no || '-'}
                    </td>
                    {subjectSchedules.map((subject) => {
                      const subDetail = result.subject_details.find(sd => sd.subject_id === subject.subject_id);
                      const marks = subDetail?.marks_obtained ?? '-';
                      const isSubFail = subDetail && !subDetail.passed;
                      return (
                        <td key={subject.subject_id} className="p-3 text-center font-medium">
                          {isAbsent ? <span className="text-gray-400">-</span> : 
                            <span className={isSubFail ? 'text-red-600 font-bold' : ''}>{marks}</span>
                          }
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold">
                      {isAbsent ? <span className="text-gray-400">-</span> : result.obtained_total}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {isAbsent ? <span className="text-gray-400">-</span> : `${result.total_percentage}%`}
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {isAbsent ? <span className="text-gray-400">-</span> : result.grade}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintResult(result)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Printer size={14} className="mr-1" />
                        Result Card
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
          Showing {processedResults.length} of {stats.total_students} students
        </div>
      </Card>

      {/* Result Card Modal */}
      {isModalOpen && selectedResultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-5 max-h-[90vh] overflow-y-auto">
              {/* Prepare data for ResultCard component */}
              <ResultCard
                student={{
                  first_name: selectedResultData.student.first_name || '',
                  last_name: selectedResultData.student.last_name || '',
                  registration_no: selectedResultData.student.registration_no || 'N/A',
                  roll_number: selectedResultData.student.roll_number || 'N/A',
                }}
                exam={{
                  name: exam.name,
                  total_marks: totalExamMarks,
                  subject_schedules: subjectSchedules.map(s => ({
                    subject_id: s.subject_id,
                    subject_name: s.subject_name,
                    total_marks: s.total_marks,
                  })),
                }}
                result={{
                  subject_marks: selectedResultData.subject_details.map(sd => ({
                    subject_id: sd.subject_id,
                    subject_name: sd.subject_name,
                    marks_obtained: sd.marks_obtained,
                    total_marks: sd.total_marks,
                    grade: sd.grade,
                    remarks: sd.passed ? '' : `Fail (Need ${sd.pass_marks} to pass)`,
                  })),
                  total_marks: totalExamMarks,
                  total_marks_obtained: selectedResultData.obtained_total,
                  percentage: parseFloat(selectedResultData.total_percentage),
                  grade: selectedResultData.grade,
                  status: selectedResultData.exam_status,
                }}
                institute={{ name: exam.school?.name || 'The Clouds Academy', code: exam.school?.code || '' }}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Result
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}