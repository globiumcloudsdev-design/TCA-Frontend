'use client';
/**
 * FeesPage — Student fee records with payment status
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, DollarSign, AlertCircle, Download } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FEES } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'paid', label:'Paid' }, { value:'pending', label:'Pending' }, { value:'overdue', label:'Overdue' }, { value:'partial', label:'Partial' }];
const STATUS_COLORS = { paid:'bg-emerald-100 text-emerald-700', pending:'bg-amber-100 text-amber-700', overdue:'bg-red-100 text-red-700', partial:'bg-blue-100 text-blue-700' };
const MONTH_OPTS = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({ value: m.toLowerCase(), label: m }));

const schema = z.object({
  student_name: z.string().min(2, 'Required'),
  roll_no:      z.string().optional(),
  amount:       z.coerce.number().min(1, 'Required'),
  paid_amount:  z.coerce.number().optional(),
  month:        z.string().optional(),
  due_date:     z.string().optional(),
  status:       z.string().min(1, 'Required'),
  remarks:      z.string().optional(),
});



export default function FeesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const user  = useAuthStore((s) => s.user);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const { terms } = useInstituteConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'pending' } });

  const { data, isLoading } = useQuery({
    queryKey: ['fees', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { feeService } = await import('@/services'); return await feeService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_FEES.filter(r => (!search || r.student_name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_FEES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { feeService } = await import('@/services'); return editing ? await feeService.update(editing.id, vals) : await feeService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Recorded'); qc.invalidateQueries({ queryKey: ['fees'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { feeService } = await import('@/services'); return await feeService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['fees'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'pending' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const totalCollected = useMemo(() => rows.reduce((s, r) => s + (r.paid_amount ?? 0), 0), [rows]);
  const totalDue       = useMemo(() => rows.reduce((s, r) => s + (r.amount ?? 0), 0), [rows]);
  const totalOverdue   = useMemo(() => rows.filter(r => r.status === 'overdue').length, [rows]);

  const formatDateDDMMYY = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  };

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const amountInWords = (amount) => {
    const num = Number(amount || 0);
    if (!Number.isFinite(num) || num <= 0) return 'ZERO ONLY';

    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    const twoDigits = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      const t = Math.floor(n / 10);
      const o = n % 10;
      return `${tens[t]}${o ? ` ${ones[o]}` : ''}`;
    };

    const threeDigits = (n) => {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      if (!h) return twoDigits(rest);
      return `${ones[h]} HUNDRED${rest ? ` ${twoDigits(rest)}` : ''}`;
    };

    const toWords = (n) => {
      if (n < 1000) return threeDigits(n);
      if (n < 1000000) {
        const th = Math.floor(n / 1000);
        const rest = n % 1000;
        return `${threeDigits(th)} THOUSAND${rest ? ` ${threeDigits(rest)}` : ''}`;
      }
      const mn = Math.floor(n / 1000000);
      const rest = n % 1000000;
      const th = Math.floor(rest / 1000);
      const rem = rest % 1000;
      let out = `${threeDigits(mn)} MILLION`;
      if (th) out += ` ${threeDigits(th)} THOUSAND`;
      if (rem) out += ` ${threeDigits(rem)}`;
      return out;
    };

    return `${toWords(Math.floor(num))} ONLY`;
  };

  const handleDownloadVoucher = async (row) => {
    const institute = currentInstitute || user?.institute || user?.school || {};
    const instituteName = institute?.name || user?.school?.name || user?.institute?.name || 'Institute Name';
    const instituteLogo = institute?.logo_url || user?.institute?.logo_url || user?.school?.logo_url || '';
    const instituteAddress = institute?.address || institute?.location?.address || '';
    const institutePhone = institute?.phone || institute?.contact_no || '';
    const instituteEmail = institute?.email || '';
    const voucherId = row?.voucher_no || row?.id || '—';
    const studentName = row?.student_name || row?.student?.name || '—';
    const rollNo = row?.roll_no || row?.student?.roll_number || row?.student?.registration_no || '—';
    const fatherName = row?.father_name || row?.student?.father_name || '—';
    const dueDate = formatDateDDMMYY(row?.due_date);
    const amount = Number(row?.amount || 0);
    const netAmount = Number((row?.amount || 0) - (row?.discount || 0));
    const monthLabel = row?.month
      ? (MONTH_OPTS.find((m) => m.value === String(row.month).toLowerCase())?.label || row.month)
      : '—';
    const yearLabel = row?.year || new Date().getFullYear();
    const voucherDate = formatDateDDMMYY(row?.created_at || row?.issue_date);
    const className = row?.class_name || row?.student?.class_name || '—';
    const statusLabel = row?.status || 'pending';
    const courses = Array.isArray(row?.courses) ? row.courses : [];

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 8;
      const sectionGap = 3;
      const sectionHeight = 90;
      const leftTagWidth = 26;
      const contentX = margin + leftTagWidth + 2;
      const contentWidth = pageWidth - contentX - margin;
      const bankName = institute?.bank_name || 'N/A';
      const accountTitle = institute?.account_title || instituteName;
      const accountNo = institute?.account_no || institute?.iban || 'N/A';

      let logoData = null;
      if (instituteLogo) {
        try {
          logoData = await new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = image.width;
              canvas.height = image.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(image, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            };
            image.onerror = reject;
            image.src = instituteLogo;
          });
        } catch {
          logoData = null;
        }
      }

      const drawKV = (x, yPos, label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), x + 21, yPos);
      };

      const drawCopy = (copyLabel, topY, showCourses = false) => {
        const bottomY = topY + sectionHeight;
        const metaX = contentX + contentWidth - 52;

        doc.setDrawColor(170, 170, 170);
        doc.setLineWidth(0.2);
        doc.rect(margin, topY, pageWidth - margin * 2, sectionHeight);

        doc.setFillColor(235, 235, 235);
        doc.rect(margin + 1, topY + 2, leftTagWidth - 2, 16, 'F');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        const [labelA, labelB] = copyLabel.split(' ');
        doc.text(labelA || '', margin + 3, topY + 8);
        doc.text(labelB || '', margin + 3, topY + 14);

        if (logoData) {
          doc.addImage(logoData, 'PNG', contentX, topY + 2, 8, 8);
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(instituteName, contentX + 10, topY + 7);

        doc.setFontSize(7.5);
        drawKV(contentX, topY + 13, 'Bank Name:', bankName);
        drawKV(contentX, topY + 17, 'Title A/C:', accountTitle);
        drawKV(contentX, topY + 21, 'A/C #:', accountNo);

        doc.setFont('helvetica', 'bold');
        doc.text('Voucher No:', metaX, topY + 7);
        doc.text('Month:', metaX, topY + 12);
        doc.text('Status:', metaX, topY + 17);
        doc.text('Amount:', metaX, topY + 22);
        doc.setFont('helvetica', 'normal');
        doc.text(String(voucherId), metaX + 21, topY + 7);
        doc.text(`${monthLabel} ${yearLabel}`, metaX + 21, topY + 12);
        doc.text(String(statusLabel), metaX + 21, topY + 17);
        doc.text(String(netAmount.toLocaleString()), metaX + 21, topY + 22);

        const detailsY = topY + 25;
        const detailsW = contentWidth * 0.55;
        const feesX = contentX + detailsW + 2;
        const feesW = contentWidth - detailsW - 2;

        doc.setFillColor(238, 238, 238);
        doc.rect(contentX, detailsY, detailsW, 6, 'F');
        doc.rect(feesX, detailsY, feesW, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Student Details', contentX + detailsW / 2, detailsY + 4, { align: 'center' });
        doc.text('Fees', feesX + feesW / 2, detailsY + 4, { align: 'center' });

        doc.rect(contentX, detailsY + 6, detailsW, 21);
        doc.rect(feesX, detailsY + 6, feesW, 21);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        doc.text(`Registration No : ${String(rollNo)}`, contentX + 2, detailsY + 11);
        doc.text(`Student Name : ${String(studentName)}`, contentX + 2, detailsY + 16);
        doc.text(`Father Name : ${String(fatherName)}`, contentX + 2, detailsY + 21);
        doc.text(`Class : ${String(className)}`, contentX + 2, detailsY + 26);

        doc.text(`Current Balance : ${netAmount.toLocaleString()}`, feesX + 2, detailsY + 11);
        doc.line(feesX, detailsY + 14, feesX + feesW, detailsY + 14);
        doc.line(feesX, detailsY + 17, feesX + feesW, detailsY + 17);
        doc.line(feesX, detailsY + 20, feesX + feesW, detailsY + 20);
        doc.line(feesX, detailsY + 23, feesX + feesW, detailsY + 23);
        doc.text(`Total : ${netAmount.toLocaleString()}`, feesX + 2, detailsY + 26);

        const accountY = detailsY + 29;
        const accountW = detailsW * 0.67;
        const stampX = contentX + accountW + 2;
        const stampW = detailsW - accountW - 2;

        doc.setFillColor(238, 238, 238);
        doc.rect(contentX, accountY, accountW, 6, 'F');
        doc.rect(stampX, accountY, stampW, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Account', contentX + accountW / 2, accountY + 4, { align: 'center' });
        doc.text('Bank Stamp', stampX + stampW / 2, accountY + 4, { align: 'center' });

        doc.rect(contentX, accountY + 6, accountW, 14);
        doc.rect(stampX, accountY + 6, stampW, 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        doc.text('DD/PO # : __________________', contentX + 2, accountY + 10.5);
        doc.text(`Bank Date : ${voucherDate}`, contentX + 2, accountY + 14.5);
        doc.text(`Validity Date : ${dueDate}`, contentX + 2, accountY + 18.5);

        doc.rect(feesX, accountY, feesW, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.text('Rs. In Words', feesX + 2, accountY + 5);
        doc.setFont('helvetica', 'normal');
        const words = doc.splitTextToSize(amountInWords(amount), feesW - 4);
        doc.text(words, feesX + 2, accountY + 9);

        if (showCourses) {
          const courseHeaderY = bottomY - 11;
          doc.setFillColor(238, 238, 238);
          doc.rect(contentX, courseHeaderY, contentWidth, 5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('Registered Courses', contentX + contentWidth / 2, courseHeaderY + 3.4, { align: 'center' });

          doc.rect(contentX, courseHeaderY + 5, contentWidth, 6);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const courseText = courses.length
            ? courses.map((course) => String(course?.name || course)).join('   |   ')
            : 'No courses assigned';
          const courseLines = doc.splitTextToSize(courseText, contentWidth - 4);
          doc.text(courseLines, contentX + 2, courseHeaderY + 9);
        }
      };

      const copies = ['BANK RECEIPT', 'SCHOOL RECEIPT', 'PARENT RECEIPT'];
      copies.forEach((copy, index) => {
        const topY = margin + index * (sectionHeight + sectionGap);
        drawCopy(copy, topY, index === 2);
      });

      const normalizedStudent = String(studentName).trim().toLowerCase().replace(/\s+/g, '-');
      const normalizedVoucherId = String(voucherId).trim().replace(/[^a-zA-Z0-9-_]/g, '') || 'voucher';
      doc.save(`fee-voucher-${normalizedStudent || 'student'}-${normalizedVoucherId}.pdf`);
      toast.success('Fee voucher downloaded');
    } catch (error) {
      console.error('Voucher download failed:', error);
      toast.error('Unable to download voucher right now');
    }
  };

  const columns = useMemo(() => [
    { accessorKey: 'student_name', header: `${terms.student} Name`, cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.student_name}</p><p className="text-xs text-muted-foreground">Roll: {r.roll_no} · {r.class_name}</p></div> },
    { accessorKey: 'month',        header: 'Month',      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'amount',       header: 'Amount',     cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'paid_amount',  header: 'Paid',       cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'due_date',     header: 'Due Date',   cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('fees.read') && <button onClick={() => handleDownloadVoucher(row.original)} className="rounded p-1.5 hover:bg-accent" title="Download Voucher"><Download size={13} /></button>}
        {canDo('fees.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('fees.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms.student, currentInstitute, user]);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Records" description={`${total} records`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Collected" value={`PKR ${totalCollected.toLocaleString()}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Total Due"        value={`PKR ${(totalDue - totalCollected).toLocaleString()}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Overdue"          value={totalOverdue} icon={<AlertCircle size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No fee records found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('fees.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Fee</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'fee-records' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Fee Record' : 'Add Fee Record'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="fee-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Save'}</button></>}>
        <form id="fee-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.student} Name *</label><input {...register('student_name')} className="input-base" />{errors.student_name && <p className="text-xs text-destructive">{errors.student_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Roll No.</label><input {...register('roll_no')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Amount (PKR) *</label><input type="number" {...register('amount')} className="input-base" />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Paid Amount</label><input type="number" {...register('paid_amount')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Month"  name="month"  control={control} options={MONTH_OPTS} />
            <DatePickerField label="Due Date" name="due_date" control={control} />
          </div>
          <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          <div className="space-y-1.5"><label className="text-sm font-medium">Remarks</label><input {...register('remarks')} className="input-base" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Fee Record" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete fee record for <strong>{deleting?.student_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
