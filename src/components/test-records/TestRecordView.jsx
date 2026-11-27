'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2, Send, Undo2, Loader2, CalendarDays, Users, UserCheck, GraduationCap } from 'lucide-react';
import { testRecordService, teacherTestRecordService, getTestRecordError } from '@/services/testRecordService';
import useBranchAccess from '@/hooks/useBranchAccess';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TestRecordFormModal from './TestRecordFormModal';
import MarksEntry from './MarksEntry';
import MonthlySheet from './MonthlySheet';
import { StatusPill, LoadingBlock, ErrorBlock, fmtDate, fmtNum } from './shared';

function StatTile({ label, value, tone = 'text-tca-dark' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

/** Detail page for one test: header card + stats, marks table (inline entry), monthly sheet tab. */
export default function TestRecordView({ testId, mode = 'admin', backHref }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = mode === 'admin';
  const svc = isAdmin ? testRecordService : teacherTestRecordService;
  const { activeBranchId } = useBranchAccess();

  const [editOpen, setEditOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['test-record', mode, testId],
    queryFn: () => svc.get(testId),
    refetchOnWindowFocus: false, // never replace the marks table while the user is typing
  });
  const test = data?.data;
  const st = test?.stats || {};

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['test-records'] });
    qc.invalidateQueries({ queryKey: ['test-record-sheet'] });
  };

  const editMut = useMutation({
    mutationFn: (body) => svc.update(testId, body),
    onSuccess: () => {
      toast.success('Test record updated');
      setEditOpen(false);
      invalidate();
      refetch();
    },
    onError: (e) => {
      const msg = getTestRecordError(e, 'Failed to save');
      setFormError(msg);
      toast.error(msg);
    },
  });
  const deleteMut = useMutation({
    mutationFn: () => svc.remove(testId),
    onSuccess: () => {
      toast.success('Test record deleted');
      invalidate();
      router.push(backHref);
    },
    onError: (e) => {
      toast.error(getTestRecordError(e, 'Failed to delete'));
      setDeleteOpen(false);
    },
  });
  const publishMut = useMutation({
    mutationFn: (publish) => (publish ? testRecordService.publish(testId) : testRecordService.unpublish(testId)),
    onSuccess: (_r, publish) => {
      toast.success(publish ? 'Test published' : 'Test unpublished');
      invalidate();
      refetch();
    },
    onError: (e) => toast.error(getTestRecordError(e, 'Action failed')),
  });

  const canMutate = !!test && (isAdmin || test.status !== 'published');

  return (
    <div className="space-y-5">
      <button onClick={() => router.push(backHref)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tca-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Test Records
      </button>

      {isLoading ? (
        <LoadingBlock label="Loading test record…" />
      ) : error ? (
        <ErrorBlock title="Couldn’t load this test record" message={getTestRecordError(error, 'Could not load this test record')} onRetry={refetch} />
      ) : test ? (
        <>
          {/* Header card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 bg-gradient-to-r from-tca-dark to-tca-dark/90 px-5 py-4 text-white">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black">{test.title}</h1>
                  <StatusPill status={test.status} />
                </div>
                <p className="mt-1 text-sm text-white/80">
                  {test.subject_name} · {test.class_name}
                  {test.section_name ? ` – ${test.section_name}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isAdmin && test.status !== 'published' && (
                  <Button
                    size="sm"
                    disabled={publishMut.isPending || (st.entered_count ?? 0) === 0}
                    title={(st.entered_count ?? 0) === 0 ? 'Enter marks before publishing' : undefined}
                    onClick={() => publishMut.mutate(true)}
                    className="bg-amber-300 text-tca-dark hover:bg-amber-400"
                  >
                    {publishMut.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />} Publish
                  </Button>
                )}
                {isAdmin && test.status === 'published' && (
                  <Button size="sm" variant="outline" disabled={publishMut.isPending} onClick={() => publishMut.mutate(false)} className="border-white/40 bg-transparent text-white hover:bg-white/10">
                    <Undo2 className="mr-1.5 h-4 w-4" /> Unpublish
                  </Button>
                )}
                {canMutate && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormError('');
                        setEditOpen(true);
                      }}
                      className="border-white/40 bg-transparent text-white hover:bg-white/10"
                    >
                      <Pencil className="mr-1.5 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteOpen(true)} className="border-red-300/60 bg-transparent text-red-200 hover:bg-red-500/20">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-5 py-4 text-sm sm:grid-cols-4">
              {[
                [CalendarDays, 'Test date', fmtDate(test.test_date)],
                [UserCheck, 'Teacher', test.teacher_name],
                [GraduationCap, 'Total / Passing', `${fmtNum(test.total_marks, 2)} / ${fmtNum(test.passing_marks, 2)}`],
                [Users, 'Marks entered', `${st.entered_count ?? 0} / ${st.total_students ?? test.students?.length ?? 0} entered`],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 rounded-lg bg-tca-primary/10 p-1.5 text-tca-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="font-semibold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Absent" value={st.absent_count ?? 0} tone="text-amber-600" />
              <StatTile label="Passed" value={st.pass_count ?? 0} tone="text-emerald-600" />
              <StatTile label="Failed" value={st.fail_count ?? 0} tone="text-red-600" />
              <StatTile label="Average" value={st.average_percentage == null ? '—' : `${fmtNum(st.average_percentage)}%`} />
              <StatTile label="Highest" value={st.highest_marks == null ? '—' : fmtNum(st.highest_marks, 2)} />
              <StatTile label="Highest %" value={st.highest_percentage == null ? '—' : `${fmtNum(st.highest_percentage)}%`} />
            </div>
          </div>

          <Tabs defaultValue="marks" className="w-full">
            <TabsList className="mb-3 h-10 rounded-xl border border-slate-200 bg-white p-1">
              <TabsTrigger value="marks" className="rounded-lg px-4 font-bold data-[state=active]:bg-tca-primary data-[state=active]:text-white">
                Marks
              </TabsTrigger>
              <TabsTrigger value="sheet" className="rounded-lg px-4 font-bold data-[state=active]:bg-tca-primary data-[state=active]:text-white">
                Monthly sheet
              </TabsTrigger>
            </TabsList>
            <TabsContent value="marks" className="mt-0">
              <MarksEntry test={test} mode={mode} onSaved={() => refetch()} />
            </TabsContent>
            <TabsContent value="sheet" className="mt-0">
              <MonthlySheet test={test} mode={mode} />
            </TabsContent>
          </Tabs>

          <TestRecordFormModal
            open={editOpen}
            onClose={() => !editMut.isPending && setEditOpen(false)}
            mode={mode}
            record={test}
            branchId={activeBranchId}
            saving={editMut.isPending}
            serverError={formError}
            onSubmit={(body) => {
              setFormError('');
              editMut.mutate(body);
            }}
          />
          <ConfirmDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => deleteMut.mutate()}
            loading={deleteMut.isPending}
            title="Delete test record"
            description={`Delete “${test.title}”? Its saved marks will be removed too.`}
            confirmLabel="Delete"
          />
        </>
      ) : null}
    </div>
  );
}
