'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Printer, Send, Loader2 } from 'lucide-react';
import { testRecordService, teacherTestRecordService, getTestRecordError } from '@/services/testRecordService';
import { Button } from '@/components/ui/button';
import { FieldLabel, NativeSelect, StatusPill, LoadingBlock, ErrorBlock, InlineBanner, MONTH_OPTIONS, yearOptions, fmtDate, fmtNum } from './shared';

import useAuthStore from '@/store/authStore';
import { useInstituteStore } from '@/store/instituteStore';

/** Only http(s)/relative/blob/data-image logo URLs are rendered. */
const safeLogo = (v) => {
  const s = String(v || '').trim();
  return /^(https?:|blob:|\/(?!\/))/i.test(s) || /^data:image\/(png|jpe?g|gif|webp);/i.test(s) ? s : '';
};

const cellText = (c) => {
  if (!c) return '';
  if (c.is_absent) return 'A';
  return c.marks_obtained === null || c.marks_obtained === undefined ? '' : fmtNum(c.marks_obtained, 2);
};

/** The paper "Test Record Sheet" layout, rendered from the sheet payload. Used on screen and for printing. */
function SheetTable({ sheet, highlightId, print = false }) {
  const { tests = [], students = [] } = sheet;
  const th = print ? 'border border-black px-1 py-1 text-[10px] font-bold' : 'border border-slate-300 px-2 py-1.5 text-xs font-bold';
  const td = print ? 'border border-black px-1 py-1 text-[11px] text-center' : 'border border-slate-200 px-2 py-1.5 text-sm text-center';
  const head = print ? '' : 'bg-tca-dark text-white';
  const sub = print ? '' : 'bg-slate-100 text-slate-700';

  return (
    <table className="w-full border-collapse" style={print ? { tableLayout: 'auto' } : undefined}>
      <thead>
        <tr className={head}>
          <th className={th} rowSpan={3} style={{ width: 44 }}>
            S. No
          </th>
          <th className={`${th} text-left`} rowSpan={3} style={{ minWidth: 150 }}>
            Students name
          </th>
          <th className={`${th} text-right`} colSpan={Math.max(tests.length, 1)}>
            Tests
          </th>
          <th className={th} rowSpan={3} style={{ width: 64 }}>
            Total
          </th>
          <th className={th} rowSpan={3} style={{ width: 52 }}>
            %
          </th>
        </tr>
        <tr className={sub}>
          {tests.length === 0 && <th className={th}>—</th>}
          {tests.map((t) => (
            <th key={t.id} className={`${th} ${highlightId === t.id && !print ? '!bg-amber-300/40' : ''}`}>
              <span className="mr-1 text-[10px] font-semibold opacity-70">Date</span>
              {fmtDate(t.test_date)}
            </th>
          ))}
        </tr>
        <tr className={sub}>
          {tests.length === 0 && <th className={th}>—</th>}
          {tests.map((t) => (
            <th key={t.id} className={`${th} ${highlightId === t.id && !print ? '!bg-amber-300/40' : ''}`}>
              <span className="mr-1 text-[10px] font-semibold opacity-70">Total</span>
              {fmtNum(t.total_marks, 2)}
              {!print && (
                <div className="mt-0.5">
                  <StatusPill status={t.status} />
                </div>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.student_id}>
            <td className={td}>{s.s_no}</td>
            <td className={`${td} text-left`}>{s.name}</td>
            {tests.length === 0 && <td className={td} />}
            {tests.map((t) => {
              const c = s.marks?.[t.id];
              const failed = c && !c.is_absent && c.marks_obtained != null && Number(c.marks_obtained) < Number(t.passing_marks);
              return (
                <td key={t.id} className={`${td} ${!print && highlightId === t.id ? 'bg-amber-300/15' : ''} ${failed && !print ? 'font-bold text-red-600' : ''}`}>
                  {cellText(c)}
                </td>
              );
            })}
            <td className={`${td} font-semibold`}>{s.summary?.total_possible ? `${fmtNum(s.summary.total_obtained, 2)}/${fmtNum(s.summary.total_possible, 2)}` : ''}</td>
            <td className={`${td} font-semibold`}>{s.summary?.percentage == null ? '' : `${fmtNum(s.summary.percentage, 0)}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Print-only A4-landscape sheet (display:none on screen; window.print() shows only this element). */
function PrintableSheet({ sheet }) {
  const h = sheet.header || {};
  // The print header uses the logged-in institute's own name and logo (multi-school).
  const user = useAuthStore((s) => s.user);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const inst = user?.institute || user?.school || currentInstitute || {};
  const instName = inst.name || inst.institute_name || h.school_name || '';
  const logo = safeLogo(inst.logo_url);
  const field = (label, value) => (
    <span className="mr-6 inline-block">
      <b>{label}:</b> <span className="inline-block min-w-[90px] border-b border-black px-1 text-center">{value || ''}</span>
    </span>
  );
  return (
    <div id="tr-print-sheet" className="hidden bg-white p-2 text-black">
      <style>{`
        @page { size: A4 landscape; margin: 10mm; }
        @media print {
          body * { visibility: hidden !important; }
          #tr-print-sheet, #tr-print-sheet * { visibility: visible !important; }
          #tr-print-sheet { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
          #tr-print-sheet table { page-break-inside: auto; }
          #tr-print-sheet tr { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="mb-2 flex items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo && <img src={logo} alt="" style={{ height: 56, width: 56, objectFit: 'contain' }} />}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold underline" style={{ fontFamily: 'Georgia, serif' }}>
            {instName}
          </h1>
          <p className="text-sm italic">(Test Record Sheet)</p>
        </div>
      </div>
      <div className="mb-2 text-xs">
        {field('Class', h.section ? `${h.class} - ${h.section}` : h.class)}
        {field('Subject', h.subject)}
        {field('Teacher Name', h.teacher)}
        {field('Month', h.month_name)}
        {field('Year', h.year)}
      </div>
      <SheetTable sheet={sheet} print />
    </div>
  );
}

/**
 * "Monthly sheet" tab: every test of the same class + section + subject + teacher + month + year as a students × tests grid.
 */
export default function MonthlySheet({ test, mode = 'admin' }) {
  const qc = useQueryClient();
  const isAdmin = mode === 'admin';
  const ym = String(test.test_date || '').split('-');
  const [month, setMonth] = useState(String(Number(ym[1] || 1)));
  const [year, setYear] = useState(ym[0] || String(new Date().getFullYear()));

  const selector = {
    class_id: test.class_id,
    section_id: test.section_id || undefined,
    ...(test.subject_id ? { subject_id: test.subject_id } : { subject: test.subject_name }),
    ...(isAdmin ? { teacher_id: test.teacher_id } : {}),
    month,
    year,
  };
  const svc = isAdmin ? testRecordService : teacherTestRecordService;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['test-record-sheet', mode, selector],
    queryFn: () => svc.sheet(selector),
    staleTime: 0,
  });
  const sheet = data?.data;

  const publishMut = useMutation({
    mutationFn: () => testRecordService.publishSheet(selector),
    onSuccess: (res) => {
      const d = res?.data || {};
      toast.success(`${d.published_count ?? 0} test(s) published${d.skipped?.length ? `, ${d.skipped.length} skipped` : ''}`);
      qc.invalidateQueries({ queryKey: ['test-records'] });
      qc.invalidateQueries({ queryKey: ['test-record'] });
      refetch();
    },
    onError: (e) => toast.error(getTestRecordError(e, 'Could not publish the sheet')),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <FieldLabel>Month</FieldLabel>
            <NativeSelect value={month} onChange={(v) => v && setMonth(v)} options={MONTH_OPTIONS} placeholder="Month" />
          </div>
          <div className="w-28">
            <FieldLabel>Year</FieldLabel>
            <NativeSelect value={year} onChange={(v) => v && setYear(v)} options={yearOptions()} placeholder="Year" />
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" disabled={!sheet?.tests?.length || publishMut.isPending} onClick={() => publishMut.mutate()} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              {publishMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Publish sheet
            </Button>
          )}
          <Button onClick={() => window.print()} disabled={!sheet} className="bg-tca-dark text-white hover:bg-tca-dark/90">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingBlock label="Loading monthly sheet…" />
      ) : error ? (
        <ErrorBlock title="Couldn’t load the monthly sheet" message={getTestRecordError(error, 'Could not load the monthly sheet')} onRetry={refetch} />
      ) : sheet ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {[
                ['Class', sheet.header.section ? `${sheet.header.class} – ${sheet.header.section}` : sheet.header.class],
                ['Subject', sheet.header.subject],
                ['Teacher', sheet.header.teacher],
                ['Month', sheet.header.month_name],
                ['Year', sheet.header.year],
              ].map(([k, v]) => (
                <span key={k}>
                  <span className="text-xs font-semibold uppercase text-slate-500">{k}: </span>
                  <b className="text-tca-dark">{v}</b>
                </span>
              ))}
            </div>
          </div>
          {sheet.tests.length === 0 && <InlineBanner tone="info">No tests were recorded for this class, subject and teacher in {sheet.header.month_name} {sheet.header.year}.</InlineBanner>}
          <div className={`overflow-auto rounded-xl border border-slate-200 bg-white ${isFetching ? 'opacity-70' : ''}`}>
            <SheetTable sheet={sheet} highlightId={test.id} />
          </div>
          <p className="text-xs text-slate-500">A = absent · blank = not entered · Total/% count only tests with entered marks. Edit marks in the “Marks” tab of each test.</p>
          <PrintableSheet sheet={sheet} />
        </>
      ) : null}
    </div>
  );
}
