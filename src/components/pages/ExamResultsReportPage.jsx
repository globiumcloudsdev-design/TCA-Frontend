'use client';

/**
 * ExamResultsReportPage — View and analyze published exam results
 * Shows rankings, pass/fail stats, performance analytics
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

  const results = resultsResponse?.data || [];

  // Calculate statistics
  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    absent: results.filter(r => r.status === 'absent').length,
    avgPercentage: results.length > 0 
      ? (results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / results.length).toFixed(2)
      : 0,
    topScore: results.length > 0 
      ? Math.max(...results.map(r => r.total_marks_obtained || 0))
      : 0,
    passPercentage: results.length > 0
      ? ((results.filter(r => r.status === 'pass').length / results.length) * 100).toFixed(2)
      : 0
  };

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
      cell: ({ getValue }) => (
        <div className="font-semibold">{getValue()} / {exam?.total_marks}</div>
      )
    },
    {
      accessorKey: 'percentage',
      header: 'Percentage',
      cell: ({ getValue }) => {
        const percentage = Number(getValue()) || 0;
        const color = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{percentage.toFixed(2)}%</span>;
      }
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-sm font-semibold">
          {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        const variant = status === 'pass' ? 'default' : status === 'absent' ? 'secondary' : 'destructive';
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
      cell: ({ getValue }) => {
        const rank = getValue();
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

  const sortedResults = [...results].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

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
        {selectedStudent && selectedResult && (
          <ResultCard
            student={selectedStudent}
            exam={exam}
            result={selectedResult}
            institute={institute}
          />
        )}
      </AppModal>

      <div className="space-y-6" role="main">
        <PageHeader
          title={`Results - ${exam.name}`}
          description={`${exam.name} | ${results.length} students | ${exam.total_marks} marks`}
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

        {/* Statistics */}
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

        {/* Subject-wise Analysis */}
        {exam.subject_schedules && exam.subject_schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {exam.subject_schedules.map(subject => {
                  const subjectResults = results
                    .flatMap(r => r.subject_marks || [])
                    .filter(sm => sm.subject_id === subject.subject_id);
                  
                  const avgMarks = subjectResults.length > 0
                    ? (subjectResults.reduce((sum, sm) => sum + (sm.marks_obtained || 0), 0) / subjectResults.length).toFixed(2)
                    : 0;

                  return (
                    <Card key={subject.subject_id} className="border">
                      <CardContent className="pt-6">
                        <div className="text-sm font-medium mb-2">{subject.subject_name}</div>
                        <div className="text-2xl font-bold text-primary">{avgMarks}</div>
                        <div className="text-xs text-muted-foreground">Average out of {subject.total_marks}</div>
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
