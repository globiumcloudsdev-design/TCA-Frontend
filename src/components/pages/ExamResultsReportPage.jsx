// 'use client';

// /**
//  * ExamResultsReportPage — View and analyze published exam results
//  * Shows rankings, pass/fail stats, performance analytics
//  */

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import { Download, ArrowLeft, TrendingUp, Users, Award, PrinterIcon } from 'lucide-react';

// import PageHeader from '@/components/common/PageHeader';
// import PageLoader from '@/components/common/PageLoader';
// import AppModal from '@/components/common/AppModal';
// import DataTable from '@/components/common/DataTable';
// import StatsCard from '@/components/common/StatsCard';
// import ResultCard from '@/components/cards/ResultCard';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { useAuthStore } from '@/store/authStore';

// import { examService } from '@/services/examService';

// export default function ExamResultsReportPage({ examId, type }) {
//   const router = useRouter();
//   const { user, getInstitute } = useAuthStore();
//   const institute = getInstitute();
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedResult, setSelectedResult] = useState(null);

//   // Fetch exam details
//   const { data: exam, isLoading: examLoading } = useQuery({
//     queryKey: ['exam', examId],
//     queryFn: () => examService.getById(examId),
//     enabled: !!examId
//   });

//   // Fetch results
//   const { data: resultsResponse, isLoading: resultsLoading } = useQuery({
//     queryKey: ['exam-results', examId],
//     queryFn: () => examService.getResults(examId),
//     enabled: !!examId
//   });

//   const results = resultsResponse?.data || [];

//   // Calculate statistics
//   const stats = {
//     total: results.length,
//     passed: results.filter(r => r.status === 'pass').length,
//     failed: results.filter(r => r.status === 'fail').length,
//     absent: results.filter(r => r.status === 'absent').length,
//     avgPercentage: results.length > 0 
//       ? (results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / results.length).toFixed(2)
//       : 0,
//     topScore: results.length > 0 
//       ? Math.max(...results.map(r => r.total_marks_obtained || 0))
//       : 0,
//     passPercentage: results.length > 0
//       ? ((results.filter(r => r.status === 'pass').length / results.length) * 100).toFixed(2)
//       : 0
//   };

//   const columns = [
//     {
//       accessorKey: 'student.roll_number',
//       header: 'Roll No',
//       cell: ({ row }) => row.original.student?.roll_number || '—'
//     },
//     {
//       accessorKey: 'student.name',
//       header: 'Student Name',
//       cell: ({ row }) => (
//         <div>
//           <p className="font-medium">{row.original.student?.first_name} {row.original.student?.last_name}</p>
//           <p className="text-xs text-muted-foreground">{row.original.student?.email}</p>
//         </div>
//       )
//     },
//     {
//       accessorKey: 'total_marks_obtained',
//       header: 'Marks Obtained',
//       cell: ({ getValue }) => (
//         <div className="font-semibold">{getValue()} / {exam?.total_marks}</div>
//       )
//     },
//     {
//       accessorKey: 'percentage',
//       header: 'Percentage',
//       cell: ({ getValue }) => {
//         const percentage = Number(getValue()) || 0;
//         const color = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600';
//         return <span className={`font-semibold ${color}`}>{percentage.toFixed(2)}%</span>;
//       }
//     },
//     {
//       accessorKey: 'grade',
//       header: 'Grade',
//       cell: ({ getValue }) => (
//         <Badge variant="outline" className="text-sm font-semibold">
//           {getValue()}
//         </Badge>
//       )
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ getValue }) => {
//         const status = getValue();
//         const variant = status === 'pass' ? 'default' : status === 'absent' ? 'secondary' : 'destructive';
//         return (
//           <Badge variant={variant} className="capitalize">
//             {status}
//           </Badge>
//         );
//       }
//     },
//     {
//       accessorKey: 'rank',
//       header: 'Rank',
//       cell: ({ getValue }) => {
//         const rank = getValue();
//         return rank ? (
//           <div className="flex items-center font-semibold">
//             <Award className="h-4 w-4 mr-1 text-amber-600" />
//             #{rank}
//           </div>
//         ) : '—';
//       }
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => (
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => {
//             setSelectedStudent(row.original.student);
//             setSelectedResult(row.original);
//           }}
//           className="gap-2"
//         >
//           <PrinterIcon className="h-4 w-4" />
//           Print Card
//         </Button>
//       )
//     }
//   ];

//   if (examLoading || resultsLoading) {
//     return <PageLoader message="Loading results..." />;
//   }

//   if (!exam) {
//     return (
//       <div className="space-y-4">
//         <PageHeader title="Exam Not Found" description="The exam you're looking for doesn't exist." />
//         <Button onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   const sortedResults = [...results].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

//   return (
//     <>
//       <AppModal
//         open={!!(selectedStudent && selectedResult)}
//         onClose={() => {
//           setSelectedStudent(null);
//           setSelectedResult(null);
//         }}
//         title="Student Result Card"
//         description={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
//         size="xl"
//       >
//         {selectedStudent && selectedResult && (
//           <ResultCard
//             student={selectedStudent}
//             exam={exam}
//             result={selectedResult}
//             institute={institute}
//           />
//         )}
//       </AppModal>

//       <div className="space-y-6" role="main">
//         <PageHeader
//           title={`Results - ${exam.name}`}
//           description={`${exam.name} | ${results.length} students | ${exam.total_marks} marks`}
//           action={
//             <div className="flex gap-2">
//               <Button onClick={() => router.back()} variant="outline">
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back
//               </Button>
//               <Button>
//                 <Download className="mr-2 h-4 w-4" />
//                 Export
//               </Button>
//             </div>
//           }
//         />

//         {/* Statistics */}
//         <div className="grid gap-4 sm:grid-cols-4">
//           <StatsCard
//             label="Total Students"
//             value={stats.total}
//             icon={<Users size={18} />}
//             variant="info"
//           />
//           <StatsCard
//             label="Passed"
//             value={stats.passed}
//             icon={<TrendingUp size={18} />}
//             variant="success"
//             subtitle={`${stats.passPercentage}%`}
//           />
//           <StatsCard
//             label="Failed"
//             value={stats.failed}
//             icon={<TrendingUp size={18} />}
//             variant="destructive"
//           />
//           <StatsCard
//             label="Avg Percentage"
//             value={`${stats.avgPercentage}%`}
//             icon={<TrendingUp size={18} />}
//             variant="warning"
//           />
//         </div>

//         {/* Subject-wise Analysis */}
//         {exam.subject_schedules && exam.subject_schedules.length > 0 && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Subject-wise Analysis</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
//                 {exam.subject_schedules.map(subject => {
//                   const subjectResults = results
//                     .flatMap(r => r.subject_marks || [])
//                     .filter(sm => sm.subject_id === subject.subject_id);
                  
//                   const avgMarks = subjectResults.length > 0
//                     ? (subjectResults.reduce((sum, sm) => sum + (sm.marks_obtained || 0), 0) / subjectResults.length).toFixed(2)
//                     : 0;

//                   return (
//                     <Card key={subject.subject_id} className="border">
//                       <CardContent className="pt-6">
//                         <div className="text-sm font-medium mb-2">{subject.subject_name}</div>
//                         <div className="text-2xl font-bold text-primary">{avgMarks}</div>
//                         <div className="text-xs text-muted-foreground">Average out of {subject.total_marks}</div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Student Results</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <DataTable
//               columns={columns}
//               data={sortedResults}
//               emptyMessage="No results found"
//               pagination={false}
//             />
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// }

'use client';

/**
 * ExamResultsReportPage — View and analyze published exam results
 * Shows rankings, pass/fail stats, performance analytics
 * Fixed: Subject-level pass/fail based on 40% threshold
 */

import { useEffect, useState } from 'react';
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
const isSubjectPass = (marksObtained, totalMarks) => {
  if (!totalMarks || totalMarks === 0) return true;
  const passingMarks = totalMarks * 0.4; // 40% threshold
  return marksObtained >= passingMarks;
};

/**
 * Process a single result to compute correct subject passes, overall status, and grade
 */
const processResult = (result, examTotalMarks) => {
  // Process each subject
  const processedSubjects = (result.subject_marks || []).map(sub => {
    const marksObtained = Number(sub.marks_obtained) || 0;
    const totalMarks = Number(sub.total_marks) || 0;
    const passed = isSubjectPass(marksObtained, totalMarks);
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

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getById(examId),
    enabled: !!examId
  });

  // Fetch results
  const { data: resultsResponse, isLoading: resultsLoading } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => examService.getResults(examId),
    enabled: !!examId
  });

  const rawResults = resultsResponse?.data || [];
  
  // Process results with correct pass/fail logic
  const examTotalMarks = exam?.total_marks || 
    exam?.subject_schedules?.reduce((sum, s) => sum + (s.total_marks || 0), 0) || 0;
  
  const processedResults = rawResults.map(result => processResult(result, examTotalMarks));
  
  // Sort by rank or percentage
  const sortedResults = [...processedResults].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return (b.overallPercentage || 0) - (a.overallPercentage || 0);
  });

  // Calculate statistics based on processed status
  const stats = {
    total: processedResults.length,
    passed: processedResults.filter(r => r.overallStatus === 'pass').length,
    failed: processedResults.filter(r => r.overallStatus === 'fail').length,
    absent: processedResults.filter(r => r.overallStatus === 'absent').length,
    avgPercentage: processedResults.length > 0 
      ? (processedResults.reduce((sum, r) => sum + (r.overallPercentage || 0), 0) / processedResults.length).toFixed(2)
      : 0,
    topScore: processedResults.length > 0 
      ? Math.max(...processedResults.map(r => r.total_marks_obtained || 0))
      : 0,
    passPercentage: processedResults.length > 0
      ? ((processedResults.filter(r => r.overallStatus === 'pass').length / processedResults.length) * 100).toFixed(2)
      : 0
  };

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
          <p className="text-xs text-muted-foreground">{row.original.student?.email}</p>
        </div>
      )
    },
    {
      accessorKey: 'total_marks_obtained',
      header: 'Marks Obtained',
      cell: ({ row }) => {
        const obtained = row.original.total_marks_obtained;
        const total = examTotalMarks;
        return <div className="font-semibold">{obtained} / {total}</div>;
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
          description={`${exam.name} | ${stats.total} students | ${examTotalMarks} marks`}
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
              pagination={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}