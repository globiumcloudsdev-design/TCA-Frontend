

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherExamDetails, useTeacherExamResults } from '@/hooks/useTeacherPortal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader, AlertCircle, Download, ArrowLeft, Printer } from 'lucide-react';

// ResultCard component for printing
const ResultCard = ({ result, exam, student }) => {
  const totalMarks = exam?.total_marks || exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
  const obtainedMarks = result?.total_marks_obtained || 0;
  const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

  const getGrade = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C';
    if (p >= 40) return 'D';
    return 'F';
  };

  const getStatus = (percentage) => {
    const p = parseFloat(percentage);
    if (result?.status === 'absent') return 'ABSENT';
    if (p >= 40) return 'PASS';
    return 'FAIL';
  };

  const status = getStatus(percentage);
  const statusColor = status === 'PASS' ? 'text-green-600' : status === 'ABSENT' ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="p-8 bg-white border-2 border-gray-300 min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold">Examination Result</h1>
        <p className="text-gray-600 mt-2">{exam?.name || 'Exam Result'}</p>
        <p className="text-gray-500 text-sm">
          {exam?.class_name || exam?.class?.name || 'Class'} 
          {exam?.section_name || exam?.section?.name ? ` - Section ${exam.section_name || exam.section?.name}` : ''}
        </p>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-600">Student Name</p>
          <p className="text-lg font-semibold">
            {student?.first_name} {student?.last_name}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Roll Number</p>
          <p className="text-lg font-semibold">{student?.roll_number || student?.registration_no || 'N/A'}</p>
        </div>
      </div>

      {/* Marks Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-400">
            <th className="py-3 text-left font-bold">Subject</th>
            <th className="py-3 text-center font-bold">Marks</th>
            <th className="py-3 text-center font-bold">Out of</th>
            <th className="py-3 text-center font-bold">Percentage</th>
            <th className="py-3 text-center font-bold">Grade</th>
           </tr>
        </thead>
        <tbody>
          {exam?.subject_schedules?.map((subject, idx) => {
            const subjectMark = result?.subject_marks?.find(sm => sm.subject_id === subject.subject_id);
            const marksObtained = subjectMark?.marks_obtained || 0;
            const subjectPercentage = subject.total_marks > 0 
              ? ((marksObtained / subject.total_marks) * 100).toFixed(2)
              : 0;
            const subjectGrade = subjectMark?.grade || getGrade(subjectPercentage);
            return (
              <tr key={subject.subject_id} className="border-b border-gray-200">
                <td className="py-3 px-2 font-medium">{subject.subject_name}</td>
                <td className="py-3 text-center font-semibold">{marksObtained}</td>
                <td className="py-3 text-center">{subject.total_marks}</td>
                <td className="py-3 text-center">{subjectPercentage}%</td>
                <td className="py-3 text-center font-semibold">{subjectGrade}</td>
               </tr>
            );
          })}
        </tbody>
       </table>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-4 bg-gray-100 rounded">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Marks</p>
          <p className="text-2xl font-bold">{obtainedMarks}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Out of</p>
          <p className="text-2xl font-bold">{totalMarks}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Percentage</p>
          <p className="text-2xl font-bold">{percentage}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Grade</p>
          <p className="text-2xl font-bold">{getGrade(percentage)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Status</p>
          <p className={`text-2xl font-bold ${statusColor}`}>{status}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-auto text-sm text-gray-600 text-center">
        <p>This is an official document of The Clouds Academy</p>
        <p className="text-xs mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default function ExamReportPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const { exam, loading: examLoading, error: examError } = useTeacherExamDetails(examId);
  const { results, loading: resultsLoading, refetch } = useTeacherExamResults(examId);

  const handlePrintResult = (studentId) => {
    setSelectedStudentId(studentId);
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => setSelectedStudentId(null), 500);
    }, 100);
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

  // If a student is selected for printing, show the print view
  if (selectedStudentId) {
    const selectedResult = results.find(r => r.student_id === selectedStudentId);
    const selectedStudentData = selectedResult?.student;
    
    if (selectedResult) {
      return (
        <div className="print:block">
          <div className="print:hidden p-6">
            <div className="flex gap-4 mb-6">
              <Button onClick={() => setSelectedStudentId(null)} variant="outline">
                <ArrowLeft className="mr-2" size={16} />
                Back to Results
              </Button>
              <Button onClick={() => handlePrintResult(selectedStudentId)} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="mr-2" size={16} />
                Print Result
              </Button>
            </div>
          </div>
          <div className="print:p-0 p-6">
            <ResultCard 
              result={selectedResult} 
              exam={exam} 
              student={selectedStudentData} 
            />
          </div>
        </div>
      );
    }
  }

  // Calculate exam statistics
  const totalMarks = exam?.total_marks || exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
  
  const stats = {
    total_students: results.length,
    submitted: results.filter(r => r.status !== 'pending' && r.total_marks_obtained > 0).length,
    passed: results.filter(r => {
      if (r.status === 'absent') return false;
      const percentage = totalMarks > 0 ? (r.total_marks_obtained / totalMarks) * 100 : 0;
      return percentage >= 40;
    }).length,
    failed: results.filter(r => {
      if (r.status === 'absent') return false;
      const percentage = totalMarks > 0 ? (r.total_marks_obtained / totalMarks) * 100 : 0;
      return percentage < 40 && r.total_marks_obtained > 0;
    }).length,
    absent: results.filter(r => r.status === 'absent' || r.is_present === false).length,
    avg_percentage: results.filter(r => r.status !== 'absent' && r.total_marks_obtained > 0).length > 0
      ? (results.filter(r => r.status !== 'absent' && r.total_marks_obtained > 0).reduce((sum, r) => {
          return sum + ((r.total_marks_obtained / totalMarks) * 100);
        }, 0) / results.filter(r => r.status !== 'absent' && r.total_marks_obtained > 0).length).toFixed(2)
      : '0'
  };

  const subjectSchedules = exam?.subject_schedules || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exam Report</h1>
          <p className="text-gray-600 mt-2">
            {exam?.name || 'Exam'} • {exam?.class_name || exam?.class?.name || 'Class'}
            {exam?.section_name || exam?.section?.name ? ` - Section ${exam.section_name || exam.section?.name}` : ''}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {exam?.start_date ? new Date(exam.start_date).toLocaleDateString() : 'N/A'} 
            {exam?.end_date ? ` to ${new Date(exam.end_date).toLocaleDateString()}` : ''}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
      </div>

      {/* Exam Statistics Cards */}
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
              {results.map((result, idx) => {
                const obtainedMarks = parseFloat(result?.total_marks_obtained) || 0;
                const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;
                const isPassed = result?.status === 'pass';
                const isAbsent = result?.status === 'absent' || result?.is_present === false;
                
                let statusText = 'Pending';
                let statusClass = 'bg-gray-100 text-gray-800';
                if (isAbsent) {
                  statusText = 'Absent';
                  statusClass = 'bg-orange-100 text-orange-800';
                } else if (isPassed) {
                  statusText = 'Passed';
                  statusClass = 'bg-green-100 text-green-800';
                } else if (result?.status === 'fail') {
                  statusText = 'Failed';
                  statusClass = 'bg-red-100 text-red-800';
                }

                const getGradeForPercentage = (p) => {
                  const perc = parseFloat(p);
                  if (perc >= 90) return 'A+';
                  if (perc >= 80) return 'A';
                  if (perc >= 70) return 'B+';
                  if (perc >= 60) return 'B';
                  if (perc >= 50) return 'C';
                  if (perc >= 40) return 'D';
                  return 'F';
                };

                const displayGrade = result?.grade || getGradeForPercentage(percentage);
                const studentData = result?.student || {};

                return (
                  <tr key={result.student_id || result.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 text-gray-500 text-sm">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-medium text-gray-900">
                        {studentData?.first_name} {studentData?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{studentData?.email || ''}</p>
                    </td>
                    <td className="p-3 text-gray-600">
                      {studentData?.roll_number || studentData?.registration_no || '-'}
                    </td>
                    {subjectSchedules.map((subject) => {
                      const subjectMark = result?.subject_marks?.find(sm => sm.subject_id === subject.subject_id);
                      const marksObtained = subjectMark?.marks_obtained || 0;
                      return (
                        <td key={subject.subject_id} className="p-3 text-center font-medium">
                          {isAbsent ? <span className="text-gray-400">-</span> : marksObtained}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold">
                      {isAbsent ? <span className="text-gray-400">-</span> : obtainedMarks}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {isAbsent ? <span className="text-gray-400">-</span> : `${percentage}%`}
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {isAbsent ? <span className="text-gray-400">-</span> : displayGrade}
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
                        onClick={() => setSelectedStudentId(result.student_id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Printer size={14} className="mr-1" />
                        Print
                      </Button>
                    </td>
                   </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
          Showing {results.length} of {stats.total_students} students
        </div>
      </Card>
    </div>
  );
}