'use client';

/**
 * ExamResultsReportPage — View and analyze published exam results
 * Shows rankings, pass/fail stats, performance analytics
 * Fixed: Subject-level pass/fail based on threshold and robust stats calculation
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Download, ArrowLeft, TrendingUp, Users, Award, PrinterIcon } from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import PageLoader from '@/components/common/PageLoader';
import AppModal from '@/components/common/AppModal';
import DataTable from '@/components/common/DataTable';
import StatsCard from '@/components/common/StatsCard';
import ResultCard from '@/components/cards/ResultCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

import { examService } from '@/services/examService';
import { classService } from '@/services/classService';

// ======================= HELPER FUNCTIONS =======================
/**
 * Get grade based on percentage (standard scale)
 */
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

/**
 * Check if a subject is passed (marks >= 40% of total)
 */
const isSubjectPass = (marksObtained, totalMarks, subjectPassMarks) => {
  if (subjectPassMarks != null && Number(subjectPassMarks) >= 0) {
    return marksObtained >= Number(subjectPassMarks);
  }
  if (!totalMarks || totalMarks === 0) return true;
  const passingMarks = totalMarks * 0.4; // default 40% threshold
  return marksObtained >= passingMarks;
};

/**
 * Process a single result to compute correct subject passes, overall status, and grade
 */
const processResult = (result, examTotalMarks, subjectMap = {}) => {
  // Process each subject
  const processedSubjects = (result.subject_marks || []).map(sub => {
    const marksObtained = Number(sub.marks_obtained) || 0;
    const totalMarks = Number(sub.total_marks) || 0;
    const passThreshold = subjectMap[sub.subject_id]?.pass_marks;
    const passed = isSubjectPass(marksObtained, totalMarks, passThreshold);
    const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
    const grade = sub.grade || getGradeFromPercentage(percentage);
    
    return {
      ...sub,
      marks_obtained: marksObtained,
      total_marks: totalMarks,
      passed,
      percentage,
      grade,
      remarks: passed ? (sub.remarks || 'Pass') : (sub.remarks || 'Fail')
    };
  });

  // Determine overall status: fail if ANY subject failed
  const hasFailedSubject = processedSubjects.some(sub => !sub.passed);
  const overallPercentage = Number(result.percentage) || 
    (examTotalMarks > 0 ? (Number(result.total_marks_obtained) / examTotalMarks) * 100 : 0);
  
  let overallStatus = result.status; // 'pass', 'fail', 'absent'
  if (result.is_present === false || result.status === 'absent') {
    overallStatus = 'absent';
  } else if (hasFailedSubject) {
    overallStatus = 'fail';
  } else if (overallPercentage >= 40) {
    overallStatus = 'pass';
  } else {
    overallStatus = 'fail';
  }

  const overallGrade = result.grade || getGradeFromPercentage(overallPercentage);

  return {
    ...result,
    subject_marks: processedSubjects,
    overallPercentage,
    overallGrade,
    overallStatus,
    isPassed: overallStatus === 'pass',
    total_marks_obtained: Number(result.total_marks_obtained) || 0,
  };
};

export default function ExamResultsReportPage({ examId, type }) {
  const router = useRouter();
  const { user, getInstitute } = useAuthStore();
  const institute = getInstitute();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getById(examId),
    enabled: !!examId
  });

  // Fetch class to get class & section names
  const { data: classData } = useQuery({
    queryKey: ['class', exam?.class_id],
    queryFn: () => classService.getById(exam?.class_id),
    enabled: !!exam?.class_id
  });

  // Fetch results with pagination
  const { data: resultsResponse, isLoading: resultsLoading } = useQuery({
    queryKey: ['exam-results', examId, page, pageSize],
    queryFn: () => examService.getResults(examId, { page, limit: pageSize }),
    enabled: !!examId
  });

  const rawResults = resultsResponse?.data || [];
  const pagination = resultsResponse?.pagination || {};
  const total = pagination.total ?? rawResults.length;
  const totalPages = pagination.totalPages ?? 1;
  const summary = resultsResponse?.summary || exam?.results_summary;

  // Build subject lookup map for pass marks
  const subjectMap = {};
  (exam?.subject_schedules || []).forEach(s => {
    subjectMap[s.subject_id] = s;
  });
  
  // Process results with correct pass/fail logic
  const examTotalMarks = exam?.total_marks || 
    exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
  
  const processedResults = rawResults.map(result => processResult(result, examTotalMarks, subjectMap));
  
  // Sort by rank or percentage
  const sortedResults = [...processedResults].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return (b.overallPercentage || 0) - (a.overallPercentage || 0);
  });

  // Robust statistics calculation (handles 0/null summary cache gracefully)
  const effectiveTotal = (summary && Number(summary.total_students) > 0)
    ? Number(summary.total_students)
    : (Number(total) > 0 ? Number(total) : processedResults.length);

  const hasSummaryStats = summary && Number(summary.total_students) > 0;

  const passedCount = hasSummaryStats && summary.passed != null
    ? Number(summary.passed)
    : processedResults.filter(r => r.overallStatus === 'pass').length;

  const failedCount = hasSummaryStats && summary.failed != null
    ? Number(summary.failed)
    : processedResults.filter(r => r.overallStatus === 'fail').length;

  const absentCount = hasSummaryStats && summary.absent != null
    ? Number(summary.absent)
    : processedResults.filter(r => r.overallStatus === 'absent').length;

  const avgPct = hasSummaryStats && summary.avg_percentage != null
    ? Number(summary.avg_percentage).toFixed(2)
    : (processedResults.length > 0 
        ? (processedResults.reduce((sum, r) => sum + (r.overallPercentage || 0), 0) / processedResults.length).toFixed(2)
        : '0.00');

  const topScoreValue = hasSummaryStats && summary.top_score != null
    ? Number(summary.top_score)
    : (processedResults.length > 0 
        ? Math.max(...processedResults.map(r => r.total_marks_obtained || 0))
        : 0);

  const passPct = hasSummaryStats && summary.pass_percentage != null
    ? Number(summary.pass_percentage).toFixed(2)
    : (processedResults.length > 0
        ? ((passedCount / (processedResults.length || 1)) * 100).toFixed(2)
        : '0.00');

  const stats = {
    total: effectiveTotal,
    passed: passedCount,
    failed: failedCount,
    absent: absentCount,
    avgPercentage: avgPct,
    topScore: topScoreValue,
    passPercentage: passPct
  };

  // Class and Section labels
  const className = classData?.data?.name || classData?.name || '';
  const sectionsList = classData?.data?.sections || classData?.sections || [];
  const sectionName = exam?.section_id
    ? (sectionsList.find(s => s.id === exam.section_id)?.name ? `Section ${sectionsList.find(s => s.id === exam.section_id)?.name}` : 'Specific Section')
    : 'All Sections';

  // Table columns with processed data
  const columns = [
    {
      accessorKey: 'student.roll_number',
      header: 'Roll No',
      cell: ({ row }) => row.original.student?.roll_number || '—'
    },
    {
      accessorKey: 'student.name',
      header: 'Student Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.student?.first_name} {row.original.student?.last_name}</p>
          {row.original.student?.email && (
            <p className="text-xs text-muted-foreground">{row.original.student?.email}</p>
          )}
        </div>
      )
    },
    ...(!exam?.section_id ? [{
      id: 'section_name',
      header: 'Section',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">
          {row.original.student?.section_name || '—'}
        </Badge>
      )
    }] : []),
    {
      accessorKey: 'total_marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }) => {
        const obtained = row.original.total_marks_obtained;
        const totalMarksVal = examTotalMarks;
        return <div className="font-semibold">{obtained} / {totalMarksVal}</div>;
      }
    },
    {
      accessorKey: 'overallPercentage',
      header: 'Percentage',
      cell: ({ row }) => {
        const percentage = row.original.overallPercentage || 0;
        const color = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{percentage.toFixed(2)}%</span>;
      }
    },
    {
      accessorKey: 'overallGrade',
      header: 'Grade',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-sm font-semibold">
          {row.original.overallGrade || getGradeFromPercentage(row.original.overallPercentage)}
        </Badge>
      )
    },
    {
      accessorKey: 'overallStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.overallStatus;
        let variant = 'default';
        if (status === 'pass') variant = 'default';
        else if (status === 'absent') variant = 'secondary';
        else variant = 'destructive';
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => {
        const rank = row.original.rank;
        return rank ? (
          <div className="flex items-center font-semibold">
            <Award className="h-4 w-4 mr-1 text-amber-600" />
            #{rank}
          </div>
        ) : '—';
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedStudent(row.original.student);
            setSelectedResult(row.original);
          }}
          className="gap-2"
        >
          <PrinterIcon className="h-4 w-4" />
          Print Card
        </Button>
      )
    }
  ];

  if (examLoading || resultsLoading) {
    return <PageLoader message="Loading results..." />;
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

  // Prepare data for ResultCard modal
  const selectedExamForCard = {
    name: exam.name,
    total_marks: examTotalMarks,
    subject_schedules: exam.subject_schedules?.map(s => ({
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      total_marks: s.total_marks,
    })) || []
  };

  const selectedResultForCard = selectedResult ? {
    subject_marks: selectedResult.subject_marks?.map(sub => ({
      subject_id: sub.subject_id,
      subject_name: sub.subject_name,
      marks_obtained: sub.marks_obtained,
      total_marks: sub.total_marks,
      grade: sub.grade,
      remarks: sub.remarks,
    })) || [],
    total_marks: examTotalMarks,
    total_marks_obtained: selectedResult.total_marks_obtained,
    percentage: selectedResult.overallPercentage,
    grade: selectedResult.overallGrade,
    status: selectedResult.overallStatus,
  } : null;

  return (
    <>
      <AppModal
        open={!!(selectedStudent && selectedResult)}
        onClose={() => {
          setSelectedStudent(null);
          setSelectedResult(null);
        }}
        title="Student Result Card"
        description={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
        size="xl"
      >
        {selectedStudent && selectedResultForCard && (
          <ResultCard
            student={{
              first_name: selectedStudent.first_name,
              last_name: selectedStudent.last_name,
              registration_no: selectedStudent.registration_no,
              roll_number: selectedStudent.roll_number,
            }}
            exam={selectedExamForCard}
            result={selectedResultForCard}
            institute={institute}
          />
        )}
      </AppModal>

      <div className="space-y-6" role="main">
        <PageHeader
          title={`Results - ${exam.name}`}
          description={`${className ? `Class: ${className}` : ''}${sectionName ? ` (${sectionName})` : ''} • ${stats.total} students • ${examTotalMarks} marks`}
          action={
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          }
        />

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatsCard
            label="Total Students"
            value={stats.total}
            icon={<Users size={18} />}
            variant="info"
          />
          <StatsCard
            label="Passed"
            value={stats.passed}
            icon={<TrendingUp size={18} />}
            variant="success"
            subtitle={`${stats.passPercentage}%`}
          />
          <StatsCard
            label="Failed"
            value={stats.failed}
            icon={<TrendingUp size={18} />}
            variant="destructive"
          />
          <StatsCard
            label="Avg Percentage"
            value={`${stats.avgPercentage}%`}
            icon={<TrendingUp size={18} />}
            variant="warning"
          />
        </div>

        {/* Subject-wise Analysis with Pass/Fail */}
        {exam.subject_schedules && exam.subject_schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {exam.subject_schedules.map(subject => {
                  // Get all subject marks for this subject across all students
                  const subjectMarksList = processedResults
                    .flatMap(r => r.subject_marks || [])
                    .filter(sm => sm.subject_id === subject.subject_id);
                  
                  const avgMarks = subjectMarksList.length > 0
                    ? (subjectMarksList.reduce((sum, sm) => sum + (sm.marks_obtained || 0), 0) / subjectMarksList.length).toFixed(2)
                    : 0;
                  
                  const passCount = subjectMarksList.filter(sm => sm.passed).length;
                  const passPercentage = subjectMarksList.length > 0
                    ? ((passCount / subjectMarksList.length) * 100).toFixed(2)
                    : 0;

                  return (
                    <Card key={subject.subject_id} className="border">
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium mb-2">{subject.subject_name}</div>
                        <div className="text-2xl font-bold text-primary">{avgMarks}</div>
                        <div className="text-xs text-muted-foreground">Average out of {subject.total_marks}</div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Pass Rate:</span>
                          <Badge variant={passPercentage >= 80 ? 'default' : 'outline'} className="text-xs">
                            {passPercentage}% ({passCount}/{subjectMarksList.length})
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={sortedResults}
              emptyMessage="No results found"
              pagination={{
                page,
                totalPages,
                onPageChange: setPage,
                total,
                pageSize,
                onPageSizeChange: (s) => {
                  setPageSize(s);
                  setPage(1);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
